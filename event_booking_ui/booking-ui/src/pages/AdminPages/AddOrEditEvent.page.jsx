import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventAvailabilityForm = () => {
  const [slots, setSlots] = useState(
    [
  { "id": 1, "start_time": "09:00", "end_time": "10:00" },
  { "id": 2, "start_time": "10:00", "end_time": "11:00" },
  { "id": 3, "start_time": "11:00", "end_time": "12:00" },
  { "id": 4, "start_time": "14:00", "end_time": "15:00" }
]

  );
  const [categories, setCategories] = useState(
    [
  { "id": 1, "name": "Cat 1" },
  { "id": 2, "name": "Cat 2" },
  { "id": 3, "name": "Cat 3" }
]

  );
  const [category, setCategory] = useState('');
  const [slot, setSlot] = useState('');
  const [editId, setEditId] = useState(null);
  const [availabilities, setAvailabilities] = useState(
    [
  {
    "id": 1,
    "category": 1,
    "category_name": "Cat 1",
    "slot": 2,
    "slot_time": "10:00 - 11:00",
    "status": "Available"
  },
  {
    "id": 2,
    "category": 2,
    "category_name": "Cat 2",
    "slot": 3,
    "slot_time": "11:00 - 12:00",
    "status": "Booked"
  },
  {
    "id": 3,
    "category": 3,
    "category_name": "Cat 3",
    "slot": 4,
    "slot_time": "14:00 - 15:00",
    "status": "Available"
  }
]

  );

//   useEffect(() => {
//     fetchCategories();
//     fetchSlots();
//     fetchAvailabilities();
//   }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await axios.get('/api/timeslots/');
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    }
  };

  const fetchAvailabilities = async () => {
    try {
      const res = await axios.get('/api/availability/');
      setAvailabilities(res.data);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { category, slot };
    try {
      if (editId) {
        await axios.put(`/api/availability/${editId}/`, payload);
        alert('Availability updated');
      } else {
        await axios.post('/api/availability/', payload);
        alert('Availability saved');
      }
      setCategory('');
      setSlot('');
      setEditId(null);
      fetchAvailabilities();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleEdit = (item) => {
    setCategory(item.category);
    setSlot(item.slot);
    setEditId(item.id);
  };

  const handleAddNew = () => {
    setCategory('');
    setSlot('');
    setEditId(null);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card p-4 shadow" style={{ height: 'fit-content' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">{editId ? 'Edit' : 'Add'} Event Availability</h4>
              {editId && (
                <button className="btn btn-sm btn-outline-primary" onClick={handleAddNew}>Add New</button>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mt-3">
                <label>Time Slot</label>
                <select className="form-control" value={slot} onChange={(e) => setSlot(e.target.value)} required>
                  <option value="">Select</option>
                  {slots?.map(s => (
                    <option key={s.id} value={s.id}>{s.start_time} - {s.end_time}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary mt-3 w-100">{editId ? 'Update' : 'Save'}</button>
            </form>
          </div>
        </div>

        <div className="col-md-6">
          <h5>Existing Availabilities</h5>
          <ul className="list-group">
            {availabilities?.map(item => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                Category {item.category_name} | Slot {item.slot_time}
                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(item)}>Edit</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventAvailabilityForm;
