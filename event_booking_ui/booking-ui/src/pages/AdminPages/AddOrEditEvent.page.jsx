// React CalendarSlotManager.jsx
import React, { useEffect, useState } from 'react';
import useAxios from '../../useAxios';
import { Modal, Button, Form, Toast, ToastContainer, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Plus, Trash } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarSlotManager = () => {
  const [weekDates, setWeekDates] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slots, setSlots] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [availResp, availError, , fetchAvailability] = useAxios();
  const [catResp, catError, , fetchCategories] = useAxios();
  const [slotResp, slotError, , fetchSlots] = useAxios();
  const [submitResp, submitError, , submitAvailability] = useAxios();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  });

  useEffect(() => {
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    setWeekDates(dates);
    fetchAvailability({ method: 'GET', url: '/api/availability/', params: { dates } });
  }, [currentWeekStart]);

  useEffect(() => {
    fetchCategories({ method: 'GET', url: '/api/categories/' });
    fetchSlots({ method: 'GET', url: '/api/timeslots/' });
  }, []);

  useEffect(() => {
    if (availResp?.result === 'Success') setAvailability(availResp.data);
    if (catResp?.result === 'Success') setCategories(catResp.data);
    if (slotResp?.status === 'Success') setSlots(slotResp?.data);
  }, [availResp, catResp, slotResp]);

  const handleSlotClick = (date, slotId) => {
    const slotData = getSlotData(date, slotId);
    if (slotData?.status === 'Booked') return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) return;
    setSelectedSlot({ date, slot: slotId });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedSlot || !selectedCategory) return;
    submitAvailability({
      method: 'POST',
      url: '/api/availability/',
      data: {
        date: selectedSlot.date,
        time_slot: selectedSlot.slot,
        category: selectedCategory
      }
    });
    setShowModal(false);
    showToast('Slot saved successfully!', 'success');
  };

  const getSlotData = (date, slotId) => {
    return availability.find(a => a.date === date && a.time_slot.id === slotId);
  };

  const handleDeleteSlot = (date, slotId) => {
    setSelectedSlot({ date, slot: slotId });
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
                const isAvailableWithUser = slotData?.user?.name && !isBooked;
                const isBackDate = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <div key={slot.id} className="position-relative border rounded p-2 mb-2 bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-semibold">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      {!isBooked && !isBackDate && (
                        <div>
                          <Plus role="button" size={16} onClick={() => handleSlotClick(date, slot.id)} className="me-2 text-success" />
                          {slotData && (
                            <Trash role="button" size={16} onClick={() => handleDeleteSlot(date, slot.id)} className="text-danger" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 small text-muted">
                      {isBooked ? (
                        <>
                          <div className="text-success">Booked</div>
                          {slotData?.user?.name && <div className="fw-medium">{slotData.user.name}</div>}
                        </>
                      ) : (
                        <>
                          {slotData?.category?.name && <div className="text-primary">{slotData.category.name}</div>}
                          {slotData?.user?.name && <div className="fw-medium">{slotData.user.name}</div>}
                        </>
                      )}
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
          <Modal.Title>Map Category to Slot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
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