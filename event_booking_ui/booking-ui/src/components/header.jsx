import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearUser } from '../store/authSlice';
import useAxios from '../useAxios';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [, , , fetchData] = useAxios();

const handleLogout = async () => {
  try {
    await fetchData({ method: 'POST', url: '/api/logout/' });
    dispatch(clearUser());
    navigate('/login');
  } catch (error) {
    console.error("Logout failed", error);
  }
};
  const isActive = (path) => location.pathname === path ? 'nav-link active fw-bold text-primary' : 'nav-link';
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top" style={{ height: '60px' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/availability">Event Booking</Link>

        <div className="collapse navbar-collapse justify-content-end">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item"><Link className={isActive('/availability')} to="/home">Home</Link></li> 
            {auth.is_admin ? 
            <>
              <li className="nav-item"><Link className={isActive('/booking-history')} to="/booking-history">All Bookings</Link></li>
              <li className="nav-item"><Link className={isActive('/categories')} to="/categories">Categories</Link></li>
            </>
             : null}
            <li className="nav-item"><Link className={isActive('/my-bookings')} to="/my-bookings">My Bookings</Link></li>
            <li className="nav-item"><button className="btn btn-danger btn-sm ms-3" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );  
};

export default Header;
