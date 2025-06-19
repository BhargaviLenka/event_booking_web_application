import React, { useEffect, useState } from 'react';
import useAxios from '../../useAxios';
import { Modal, Button, Form, Toast, ToastContainer, Card } from 'react-bootstrap';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useSelector } from 'react-redux';

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
  const [filterCategory, setFilterCategory] = useState('');
  const [maxSlotCount, setMaxSlotCount] = useState(1);

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
    fetchCategories({ method: 'GET', url: '/api/categories/' });
    fetchSlots({ method: 'GET', url: '/api/timeslots/' });
  }, []);

  useEffect(() => {
    if (availResp?.result === 'Success') setAvailability(availResp.data);
    if (catResp?.result === 'Success') setCategories(catResp.data);
    if (slotResp?.status === 'Success') setSlots(slotResp?.data);
  }, [availResp, catResp, slotResp]);

  useEffect(() => {
    if (submitResp?.result === 'Success') {
      setToast({ show: true, message: submitResp?.message, variant: 'success' });
    } else if (submitResp?.result === 'Failed') {
      setToast({ show: true, message: submitResp?.message || 'An error occurred.', variant: 'danger' });
    }
  }, [submitResp]);

  useEffect(() => {
    calculateMaxSlotCount();
  }, [availability, filterCategory]);

  const calculateMaxSlotCount = () => {
    const maxCount = weekDates.reduce((max, date) => {
      const count = slots.filter(slot => {
        const slotData = getSlotData(date, slot.id);
        if (filterCategory) {
          return slotData?.category?.id == filterCategory;
        }
        return true;
      }).length;
      return Math.max(max, count);
    }, 1);
    setMaxSlotCount(maxCount);
  };

  const getSlotData = (date, slotId) => {
    return availability.find(a => a.date === date && a.time_slot.id === slotId);
  };

  const handleSlotClick = (date, slotId, category, categoryId) => {
    const slotData = getSlotData(date, slotId);
    const todayStr = new Date().toISOString().split('T')[0];
    if (new Date(date) < new Date(todayStr)) return;

    if (userRole === 'user') {
      if (slotData?.status === 'BOOKED' || !slotData?.category) return;
      setSelectedSlot({ date, slot: slotId, category, categoryId });
      setConfirmModal(true);
    }

    if (userRole === 'admin') {
      setSelectedSlot({ date, slot: slotId, category, categoryId });
      setShowModal(true);
    }
  };

  const handleConfirmAvailability = () => {
    submitAvailability({
      method: 'POST',
      url: '/api/availability/',
      data: {
        date: selectedSlot.date,
        time_slot: selectedSlot.slot,
        category: selectedCategory || selectedSlot?.categoryId
      }
    });
    setConfirmModal(false);
    setShowModal(false);
    setSelectedCategory('');
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
    setSelectedCategory('');
  };

  const handleDeleteSlot = () => {
    submitAvailability({
      method: 'DELETE',
      url: '/api/availability/',
      data: { date: selectedSlot.date, time_slot: selectedSlot.slot }
    });
    setToast({ show: true, message: 'Slot deleted successfully.', variant: 'success' });
    setSelectedCategory('');
  };

  const handleCloseModal = () => {
  setSelectedCategory('');  
  setShowModal(false);
  };

  const filteredWeekDates = filterCategory
    ? weekDates.filter(date =>
      slots.some(slot => {
        const slotData = getSlotData(date, slot.id);
        return slotData?.category?.id == filterCategory;
      })
    )
    : weekDates;

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${minute} ${ampm}`;
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

  return (
    <div className="container-fluid mt-4">
      <div className="row align-items-center mb-3">
        <div className="col-2 text-start">
          <Button variant="outline-primary" size="sm" onClick={handlePrevWeek}>Previous</Button>
        </div>
        <div className="col-8 text-center">
          <h5>{weekDates[0]} – {weekDates[6]}</h5>
        </div>
        <div className="col-2 text-end">
          <Button variant="outline-primary" size="sm" onClick={handleNextWeek}>Next</Button>
        </div>
      </div>

      <div className="row mt-4 justify-content-center">
        <div className="col-12 col-md-4">
          <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Form.Select>
        </div>
      </div>

      <div className="row g-3 justify-content-center mt-3">
        {filteredWeekDates.length === 0 ? (
          <div className="text-center text-muted mt-4">No slots available for selected filter.</div>
        ) : (
          filteredWeekDates.map(date => (
            <div key={date} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="border rounded p-3 shadow-sm bg-light" style={{ minHeight: `${maxSlotCount * 80 + 80}px` }}>
                <h6 className="fw-bold text-primary mb-3 text-center">{date}</h6>
                {slots.filter(slot => {
                  const slotData = getSlotData(date, slot.id);
                  if (filterCategory) return slotData?.category?.id == filterCategory;
                  return true;
                })
                  .map(slot => {
                    const slotData = getSlotData(date, slot.id);
                    const isBooked = slotData?.status === 'BOOKED';
                    const selfBooked = slotData?.is_self_booked ;
                    const isPastSlot = () => {
                        if (!slot?.start_time) return true;
                        const slotDateTime = new Date(`${date}T${slot.start_time}`);
                        return slotDateTime < new Date();
                      };

                    const bgColor = selfBooked ? "#a0e895" : isBooked ? '#e69c9c' : slotData?.category ? '#b4e2ed' : '#f8f9fa';

                    return (
                      <Card key={slot.id} className="w-100 mb-2" style={{ backgroundColor: bgColor }}>
                        <Card.Body className="p-2 d-flex justify-content-between align-items-center">
                          <div>
                            <div>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                            <div className="small text-muted">{slotData?.category?.name || 'N/A'}</div>
                            {isBooked && auth?.is_admin && <div className="fw-bold" >Booked by: {slotData.user?.name}</div>}
                          </div>

                          {!isPastSlot() && (
                            <div>
                              {userRole === 'user' ? (
                                !isBooked && slotData?.category ? (
                                  <Plus role="button" size={16} onClick={() =>
                                    handleSlotClick(date, slot.id, slotData?.category?.name, slotData?.category?.id)}
                                    className="text-success"
                                  />
                                ) : null
                              ) : (
                                !isBooked &&
                                <>
                                  <Pencil role="button" size={16} className="me-1 text-primary"
                                    onClick={() =>
                                      handleSlotClick(date, slot.id, slotData?.category?.name, slotData?.category?.id)
                                    } />
                                  {slotData && (
                                    <Trash role="button" size={16} className="text-danger"
                                      onClick={() => {
                                        setSelectedSlot({ date, slot: slot.id });
                                        handleDeleteSlot();
                                      }} />
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton><Modal.Title>Select Category</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Select value={selectedCategory || selectedSlot?.category} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmAvailability}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmModal} onHide={() => setConfirmModal(false)}>
        <Modal.Header closeButton><Modal.Title>Confirm Booking</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to book this slot?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmBooking}>Book</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} bg={toast.variant} delay={3000} autohide>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CalendarSlotManager;