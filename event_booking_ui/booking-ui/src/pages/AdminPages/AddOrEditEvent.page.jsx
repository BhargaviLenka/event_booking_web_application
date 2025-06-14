// React CalendarSlotManager.jsx
import React, { useEffect, useState } from 'react';
import useAxios from '../../useAxios';
import { Modal, Button, Form } from 'react-bootstrap';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarSlotManager = () => {
  const [weekDates, setWeekDates] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slots, setSlots] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [availResp, availError, , fetchAvailability] = useAxios();
  const [catResp, catError, , fetchCategories] = useAxios();
  const [slotResp, slotError, , fetchSlots] = useAxios();
  const [submitResp, submitError, , submitAvailability] = useAxios();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
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
  }, []);

  useEffect(() => {
    fetchSlots({ method: 'GET', url: '/api/timeslots/' });
  }, []);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    setWeekDates(dates);
    fetchAvailability({ method: 'GET', url: '/api/availability/', params: { dates } });
    fetchCategories({ method: 'GET', url: '/api/categories/' });
    fetchSlots({ method: 'GET', url: '/api/timeslots/' });
  }, []);

  useEffect(() => {
    if (availResp?.result === 'Success') setAvailability(availResp.data);
    if (catResp?.result === 'Success') setCategories(catResp.data);
    if (slotResp?.status === 'Success') setSlots(slotResp?.data);
  }, [availResp, catResp, slotResp]);

  const handleSlotClick = (date, slot) => {
    console.log(slot,'hi')
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) return;
    setSelectedSlot({ date, slot });
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
  };

  const getSlotData = (date, slotId) => {
    return availability.find(a => a.date === date && a.time_slot.id === slotId);
  };

  // const slots = ['Morning', 'Afternoon', 'Evening'];

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

  return (
    <div className="container mt-5">
      <h4 className="mb-4">Weekly Event Availability</h4>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Button variant="outline-primary" size="sm" onClick={handlePrevWeek}>Previous Week</Button>
        <span>
          {weekDates[0]} &ndash; {weekDates[6]}
        </span>
        <Button variant="outline-primary" size="sm" onClick={handleNextWeek}>Next Week</Button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Slot \ Date</th>
              {weekDates.map((d, i) => (
                <th key={i}>{daysOfWeek[i]}<br />{d}</th>
              ))}
            </tr>
          </thead>
         <tbody>
          {slots.map(slot => (
            <tr key={slot.id}>
              <td>
                <strong>
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </strong>
              </td>
              {weekDates.map(date => {
                const slotData = getSlotData(date, slot.id);
                const statusClass = slotData?.status === 'Booked'
                  ? 'btn-success'
                  : (slotData?.category ? 'btn-warning' : 'btn-outline-secondary');
                return (
                  <td key={date}>
                    <button
                      className={`btn btn-sm ${statusClass} w-100`}
                      onClick={() => handleSlotClick(date, slot.id)}
                      disabled={new Date(date) < new Date().setHours(0, 0, 0, 0)}
                    >
                      {slotData?.category?.name || 'Add'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        </table>
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
    </div>
  );
};

export default CalendarSlotManager;
