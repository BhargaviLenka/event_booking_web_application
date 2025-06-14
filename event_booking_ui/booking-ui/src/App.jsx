import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.page';
import Register from './pages/Register.page';
import AdminDashboard from './pages/AdminPages/AdminDashboard.page';
import BookingHistory from './pages/AdminPages/BookingHistory.page';
import EventCategoryForm from './pages/AdminPages/AddOrEditEventCategory.page';
import EventAvailabilityForm from './pages/AdminPages/AddOrEditEvent.page';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/bookings" element={
          <ProtectedRoute>
            <BookingHistory />
          </ProtectedRoute>
        } />

        <Route path="/admin/category" element={
          <ProtectedRoute>
            <EventCategoryForm />
          </ProtectedRoute>
        } />

        <Route path="/admin/availability" element={
          <ProtectedRoute>
            <EventAvailabilityForm />
          </ProtectedRoute>
        } />
      </Routes>
  );
}

export default App;
