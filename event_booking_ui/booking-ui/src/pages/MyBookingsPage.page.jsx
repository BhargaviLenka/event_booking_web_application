// src/pages/MyBookingsPage.jsx

import React, { useEffect, useState } from 'react';
import useAxios from '../useAxios';
import { Card, Spinner, Badge } from 'react-bootstrap';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [bookingResp, , loading, fetchBookings] = useAxios();

  useEffect(() => {
    fetchBookings({ method: 'GET', url: '/api/my-bookings/' });
  }, []);

  useEffect(() => {
    if (bookingResp?.result === 'Success') {
      setBookings(bookingResp.data);
      // setLoading(false);
    }
  }, [bookingResp]);

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formatted = `${hour % 12 || 12}:${m} ${ampm}`;
    return formatted;
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4">My Bookings</h4>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-muted text-center">You have no bookings yet.</p>
      ) : (
        <div className="row">
          {bookings.map((booking, idx) => (
            <div className="col-md-6 mb-4" key={idx}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <Card.Title className="mb-2 d-flex justify-content-between align-items-center">
                    <span>{booking.category?.name || 'Uncategorized'}</span>
                    <Badge bg="info">{booking.status}</Badge>
                  </Card.Title>
                  <Card.Text>
                    <strong>Date:</strong> {booking.date}<br />
                    <strong>Time:</strong> {formatTime(booking.time_slot?.start_time)} - {formatTime(booking.time_slot?.end_time)}<br />
                    <strong>Location:</strong> {booking.location || 'N/A'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
