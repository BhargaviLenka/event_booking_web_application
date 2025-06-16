import React, { useEffect, useState } from 'react';
import useAxios from '../../useAxios';
import { Modal, Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useSelector } from 'react-redux';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const CalendarSlotManager = () => {
  const [weekDates, setWeekDates] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slots, setSlots] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [availResp, , , fetchAvailability] = useAxios();
  const [catResp, , , fetchCategories] = useAxios();
  const [slotResp, , , fetchSlots] = useAxios();
  const [submitResp, , , submitAvailability] = useAxios();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const auth = useSelector((state) => state.auth);
  const userRole = auth?.is_admin ? 'admin' : 'user'; 

  useEffect(() => {
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    setWeekDates(dates);
    fetchAvailability({ method: 'GET', url: '/api/availability/', params: { dates } });
  }, [currentWeekStart, submitResp]);

  useEffect(() => {
    if (submitResp?.result === 'Success') {
      showToast('Event Category added successfully!', 'success');
    }
    else if (submitResp?.result === 'Failed') {
      showToast('Failed to add Event Category.', 'danger');
    }
  }
  , [submitResp]);

  useEffect(() => {
    fetchCategories({ method: 'GET', url: '/api/categories/' });
    fetchSlots({ method: 'GET', url: '/api/timeslots/' });
  }, []);

  useEffect(() => {
    if (availResp?.result === 'Success') setAvailability(availResp.data);
    if (catResp?.result === 'Success') setCategories(catResp.data);
    if (slotResp?.status === 'Success') setSlots(slotResp?.data);
  }, [availResp, catResp, slotResp]);

  const handleSlotClick = (date, slotId, category, categoryId) => {
    const slotData = getSlotData(date, slotId);
    const todayStr = new Date().toISOString().split('T')[0];
    if (new Date(date) < new Date(todayStr)) return;

    if (userRole === 'user') {
      if (slotData?.status === 'Booked') return;
      setSelectedSlot({ date, slot: slotId, category: category, categoryId: categoryId });
      setConfirmModal(true);
    }

    if (userRole === 'admin') {
      if (!slotData || slotData?.status !== 'Booked') {
        setSelectedSlot({ date, slot: slotId, category: category, categoryId: categoryId });
        setShowModal(true);
      }
    }
  };

  const handleConfirmAvailability = () => {
    submitAvailability({
      method: 'POST',
      url: '/api/availability/',
      data: {
        date: selectedSlot.date,
        time_slot: selectedSlot.slot,
        category: selectedCategory
      }
    });
    setConfirmModal(false);
    setShowModal(false);
    
  };

  const handleConfirmBooking = () => {
    submitAvailability({
      method: 'POST',
      url: '/api/user-bookings/',
      data: {
        date: selectedSlot.date,
        time_slot: selectedSlot.slot,
        category: selectedSlot.category,
        categoryId: selectedSlot.categoryId
      }
    });
    setConfirmModal(false);
    setShowModal(false);
    showToast('Slot booked successfully!', 'success');
  };

  const handleDeleteSlot = (date, slotId, category, categoryId) => {
    setSelectedSlot({ date, slot: slotId , category: category, categoryId: categoryId });
    setToast({ show: true, message: 'Click to confirm deletion.', variant: 'danger', confirmDelete: true });
  };

  const confirmDelete = () => {
    if (!selectedSlot) return;
    submitAvailability({
      method: 'DELETE',
      url: '/api/availability/',
      data: { date: selectedSlot.date, time_slot: selectedSlot.slot }
    });
    setToast({ show: true, message: 'Slot deleted successfully.', variant: 'success' });
  };

  const getSlotData = (date, slotId) => {
    return availability.find(a => a.date === date && a.time_slot.id === slotId);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

//   const getSlotBgClass = (slotData, date) => {
//   const isPast = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));

//   if (isPast) return 'bg-secondary'; // grey
//   if (!slotData || slotData.status !== 'Booked') return 'uibg-primary'; // blue
//   if (slotData?.user?.is_self) return 'bg-success'; // green
//   return 'bg-danger'; // red
// };


  return (
    <div className="container mt-5">
      <h4 className="mb-4">Weekly Event Availability</h4>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-primary" size="sm" onClick={handlePrevWeek}>Previous Week</Button>
        <span className="fw-bold text-secondary">{weekDates[0]} &ndash; {weekDates[6]}</span>
        <Button variant="outline-primary" size="sm" onClick={handleNextWeek}>Next Week</Button>
      </div>

      <div className="row g-3">
        {weekDates.map(date => (
          <div className="col-12 col-md-6 col-lg-4" key={date}>
            <div className="bg-light p-3 rounded shadow-sm">
              <h6 className="fw-bold text-center mb-3">{date}</h6>
              {slots.map(slot => {
                const slotData = getSlotData(date, slot.id);
                const isBooked = slotData?.status === 'Booked';
                const isBackDate = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <div key={slot.id} className={`position-relative border rounded p-2 mb-2 shadow-sm`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                      {!isBackDate && (
                        <div>
                          {userRole === 'user' && !isBooked && ( 
                            <Plus role="button" size={16} onClick={() => handleSlotClick(date, slot.id, slotData?.category?.name, slotData?.category?.id)} className="text-success" />
                          )}
                          {userRole === 'admin' && !isBooked && (<>
                            {slotData?.category?.id ? 
                            <Pencil
                                role="button"
                                title="Edit Slot"
                                size={16}
                                onClick={() => handleSlotClick(date, slot.id, slotData?.category?.name, slotData?.category?.id)}
                                className="text-primary"
                            /> : <Plus role="button" size={16} onClick={() => handleSlotClick(date, slot.id, slotData?.category?.name, slotData?.category?.id)} className="me-2 text-success" />}
                                    <span> </span>                      
                              {slotData && (

                                <Trash role="button" size={16} onClick={() => handleDeleteSlot(date, slot.id, slotData?.category?.name)} className="text-danger" />
                              )}
                            </>
                        )}
                        </div>
                      )}
                    </div>

                    <div className="mt-1 small text-muted">
                      <div className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                        {slotData?.category?.name || (userRole === 'admin' ?  <span className="text-muted">No Category</span> : 'N/A')}
                      </div>
                      <div className="small text-secondary">
                        {userRole === 'admin' && (slotData?.user?.name || 'N/A')}
                      </div>
                    </div>
                  </div>
                );
              })}
              

            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={selectedCategory || selectedSlot?.category} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" 
            onClick={() => {
                setSelectedSlot(null);
                setShowModal(false)
            }}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmAvailability}>Next</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmModal} onHide={() => setConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to book this slot?</p>
          <p><strong>Date:</strong> {selectedSlot?.date}</p>
          <p><strong>Time:</strong> {
            (() => {
              const slotObj = slots.find(s => s.id === selectedSlot?.slot);
              return slotObj
                ? `${formatTime(slotObj.start_time)} - ${formatTime(slotObj.end_time)}`
                : 'N/A';
            })()
          }</p>
          <p><strong>Category:</strong> {selectedSlot?.category}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
                setSelectedSlot(null);setConfirmModal(false)}}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmBooking}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} bg={toast.variant} delay={3000} autohide>
          <Toast.Body>
            {toast.message}
            {toast.confirmDelete && (
              <div className="mt-2">
                <Button variant="light" size="sm" onClick={confirmDelete}>Confirm Delete</Button>
              </div>
            )}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CalendarSlotManager;
