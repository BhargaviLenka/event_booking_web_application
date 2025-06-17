import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.page';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login.page';
import CalendarSlotManager from './pages/AdminPages/AddOrEditEvent.page';
import BookingHistory from './pages/AdminPages/BookingHistory.page';
import DashboardLayout from './pages/Dashboard.page';
import MyBookingsPage from './pages/MyBookingsPage.page';
import EventCategoryForm from './pages/AdminPages/AddOrEditEventCategory.page';
import "antd/dist/reset.css";
import { useSelector } from 'react-redux';


function App() {
  const auth = useSelector((state) => state.auth);
  useEffect(() => {
  fetch("http://127.0.0.1:8000/api/csrf/", {
    method: "GET",
    credentials: "include",  
  })
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch CSRF");
  })
  .catch((err) => console.error(err));
}, []);

 return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          auth?.isAuthenticated ? (
            <Navigate to="/availability" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route path="/availability" element={<CalendarSlotManager />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/categories" element={<EventCategoryForm />} />
      </Route>
      <Route
        path="*"
        element={
          auth?.isAuthenticated ? (
            <Navigate to="/availability" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
