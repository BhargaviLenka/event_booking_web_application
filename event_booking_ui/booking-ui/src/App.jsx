import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.page';
import Home from './pages/Home';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login.page';
import CalendarSlotManager from './pages/AdminPages/AddOrEditEvent.page';
import BookingHistory from './pages/AdminPages/BookingHistory.page';
import DashboardLayout from './pages/Dashboard.page';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/availability" element={<CalendarSlotManager />} />
        {/* <Route path="/my-bookings" element={<MyBookingsPage />} /> */}
        <Route path="/booking-history" element={<BookingHistory />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
