import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.page';
import Home from './pages/Home';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login.page';
import CalendarSlotManager from './pages/AdminPages/AddOrEditEvent.page';
import BookingHistory from './pages/AdminPages/BookingHistory.page';
import DashboardLayout from './pages/Dashboard.page';
import MyBookingsPage from './pages/MyBookingsPage.page';
import EventCategoryForm from './pages/AdminPages/AddOrEditEventCategory.page';
import axios from 'axios';

function App() {
  useEffect(() => {
    const fetchCSRF = async () => {
      try {
        await axios.get('http://localhost:8000/api/csrf/', { withCredentials: true });
        console.log("CSRF cookie set successfully");
      } catch (err) {
        console.error("Failed to set CSRF:", err);
      }
    };

    fetchCSRF();
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/availability" element={<CalendarSlotManager />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/categories" element={<EventCategoryForm />} />

      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
