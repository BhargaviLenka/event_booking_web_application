// React CalendarSlotManager.jsx
import React, { useEffect, useState } from 'react';
import useAxios from '../../useAxios';
import { Modal, Button, Form } from 'react-bootstrap';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarSlotManager = () => {
  const [weekDates, setWeekDates] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [availResp, availError, , fetchAvailability] = useAxios();
  const [catResp, catError, , fetchCategories] = useAxios();
  const [submitResp, submitError, , submitAvailability] = useAxios();

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
  }, []);

  useEffect(() => {
    if (availResp?.result === 'Success') setAvailability(availResp.data);
    if (catResp?.result === 'Success') setCategories(catResp.data);
  }, [availResp, catResp]);

  const handleSlotClick = (date, slot) => {
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
        time_slot: selectedSlot.slot_id,
        category: selectedCategory
      }
    });
    setShowModal(false);
  };

  const getSlotData = (date, slotName) => {
    return availability.find(a => a.date === date && a.slot === slotName);
  };

  const slots = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="container mt-5">
      <h4 className="mb-4">Weekly Event Availability</h4>
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
              <tr key={slot}>
                <td><strong>{slot}</strong></td>
                {weekDates.map(date => {
                  const slotData = getSlotData(date, slot);
                  const statusClass = slotData?.status === 'Booked' ? 'btn-success' : (slotData?.category ? 'btn-warning' : 'btn-outline-secondary');
                  return (
                    <td key={date}>
                      <button
                        className={`btn btn-sm ${statusClass} w-100`}
                        onClick={() => handleSlotClick(date, slotData?.slot_id || slot)}
                        disabled={new Date(date) < new Date().setHours(0,0,0,0)}
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
