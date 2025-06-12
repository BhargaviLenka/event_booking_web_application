// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import EventBookingApp from './EventBookingApp';
import Login from './pages/Login.page';
import Register from './pages/Register.page';
import AdminDashboard from './pages/AdminPages/AdminDashboard.page';
import BookingHistory  from './pages/AdminPages/BookingHistory.page';
import EventCategoryForm from './pages/AdminPages/AddOrEditEventCategory.page';
import EventAvailabilityForm from './pages/AdminPages/AddOrEditEvent.page';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/calendar" element={<EventBookingApp />} /> */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<BookingHistory />} />
        <Route path="/admin/category" element={<EventCategoryForm />} />
        <Route path="/admin/availability" element={<EventAvailabilityForm />} />
      </Routes>
  );
}

export default App;
