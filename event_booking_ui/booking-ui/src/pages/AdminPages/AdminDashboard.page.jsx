import React from 'react';
import AdminNavbar from './AdminNavbar.page';

const AdminDashboard = () => {
  return (
    <>
      <AdminNavbar />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Welcome to Admin Dashboard</h2>
        <div className="row text-center">
          <div className="col-md-4">
            <a href="/admin/bookings" className="btn btn-outline-primary w-100 p-4">View All Bookings</a>
          </div>
          <div className="col-md-4">
            <a href="/admin/category" className="btn btn-outline-success w-100 p-4">Add/Edit Categories</a>
          </div>
          <div className="col-md-4">
            <a href="/admin/availability" className="btn btn-outline-warning w-100 p-4">Manage Availability</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
