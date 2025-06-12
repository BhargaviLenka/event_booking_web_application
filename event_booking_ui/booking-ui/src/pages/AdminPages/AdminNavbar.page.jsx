import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <Link className="navbar-brand" to="/admin">Admin Panel</Link>
    <div className="collapse navbar-collapse">
      <ul className="navbar-nav ms-auto">
        <li className="nav-item"><Link className="nav-link" to="/admin/bookings">Bookings</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/admin/category">Categories</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/admin/availability">Availability</Link></li>
      </ul>
    </div>
  </nav>
);

export default AdminNavbar;
