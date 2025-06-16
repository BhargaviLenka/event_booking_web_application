import React, { useEffect, useState } from 'react';
import useAxios from '../useAxios';
import { Card, Spinner, Badge, Button } from 'react-bootstrap';
import moment from 'moment';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingResp, , loading, fetchBookings] = useAxios();
  const [, , , deleteBooking] = useAxios(); // for cancel/delete

  useEffect(() => {
    fetchBookings({ method: 'GET', url: '/api/my-bookings/' });
  }, []);

  useEffect(() => {
    if (bookingResp?.result === 'Success') {
      setBookings(bookingResp.data);
    }
  }, [bookingResp]);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const formatDate = (dateStr) => moment(dateStr).format('ddd, MMM D, YYYY');
  const formatBookedAt = (timestamp) => moment(timestamp).format('MMM D [at] h:mm A');
  const isFutureDate = (dateStr) => moment(dateStr).isAfter(moment(), 'day');

  const handleCancel = async (id) => {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      await deleteBooking({ method: 'DELETE', url: `/api/my-bookings/${id}/` });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  return (
    <div className=" mt-4">
      <h3 className="mb-4 text-center">📅 My Bookings</h3>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-muted text-center">You have no bookings yet.</p>
      ) : (
        <div className="d-flex flex-column align-items-center gap-4">
  {bookings.map((booking, idx) => (
    <Card
      key={idx}
      className="shadow-sm border-0 " 
      style={{ minWidth: '1000px' }}
    >
      <div className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
        <strong className="text-primary">{formatDate(booking.date)}</strong>
        <Badge bg={(booking.status === 'ACTIVE' && isFutureDate(booking.date)) ? 'success' : 'secondary'}>
          {booking.status === 'ACTIVE' && isFutureDate(booking.date) ? 'Upcoming' : (booking?.status === 'CANCELLED' ? 'Cancelled': 'Completed')}
        </Badge>
      </div>

      <Card.Body>
        <h5 className="text-dark mb-3">
          {booking.category || 'Uncategorized'}
        </h5>

        <Card.Text className="mb-2">
          <strong>⏰ Time:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
        </Card.Text>

        <Card.Text className="text-muted small">
           Booked on {formatBookedAt(booking.booked_at)}
        </Card.Text>
        {booking?.status === 'CANCELLED' &&
        <Card.Text className="text-muted small">
           Cancelled on {formatBookedAt(booking.cancelled_at)}
        </Card.Text>}
        {booking.status === 'ACTIVE' && isFutureDate(booking.date) && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleCancel(booking.id)}
            className="mt-3"
          >
            ❌ Cancel Booking
          </Button>
        )}
      </Card.Body>
    </Card>
  ))}
</div>

      )}
    </div>
  );
};

export default MyBookingsPage;
