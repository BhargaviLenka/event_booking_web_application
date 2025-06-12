// Admin UI - View Bookings, Add/Edit Category, Manage Availability
// Best UI using React + Bootstrap + Toast + Validation

import React, { useEffect, useState } from 'react';
import { Button, Form, Table, Modal, Toast, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

// Booking History
const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/bookings/');
        setBookings(res.data.bookings);
      } catch (err) {
        setError('Failed to load bookings');
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Booking History</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Spinner animation="border" /> : (
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table">
            <tr>
              <th>User</th>
              <th>Category</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Cancelled At</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map(b => (
              <tr key={b.id}>
                <td>{b.user.username}</td>
                <td>{b.event.category.name}</td>
                <td>{b.event.time_slot.start_time}</td>
                <td>{b.event.time_slot.end_time}</td>
                <td>{b.status}</td>
                <td>{b.cancelled_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

// Add/Edit Category
export const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [showToast, setShowToast] = useState(false);

  const fetchCategories = async () => {
    const res = await axios.get('/api/admin/categories/');
    setCategories(res.data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCat) return;
    try {
      await axios.post('/api/admin/category/', { name: newCat });
      setShowToast(true);
      setNewCat('');
      fetchCategories();
    } catch (err) {
      alert('Error adding category.');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Manage Event Categories</h3>
      <Form className="my-3 d-flex">
        <Form.Control
          type="text"
          placeholder="New Category"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
        />
        <Button onClick={handleAddCategory} className="ms-2">Add</Button>
      </Form>
      <ul className="list-group">
        {categories.map(cat => (
          <li className="list-group-item" key={cat.id}>{cat.name}</li>
        ))}
      </ul>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Toast.Body>Category added successfully!</Toast.Body>
      </Toast>
    </div>
  );
};

export default BookingHistory;

// You can similarly add UI + logic for Event Availability with modals and dropdowns for categories + timeslots
