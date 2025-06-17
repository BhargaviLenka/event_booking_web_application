import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Spin, Alert } from 'antd';
import useAxios from '../../useAxios';
import moment from 'moment';

const BookingHistory = () => {
  const [response, error, loading, fetchData] = useAxios();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchBookings = (page = 1, pageSize = 10) => {
    fetchData({
      method: 'GET',
      url: `/api/user-bookings/?page=${page}&page_size=${pageSize}`,
    });
  };
  const isFutureDate = (dateStr) => moment(dateStr).isAfter(moment(), 'day');

  useEffect(() => {
    fetchBookings(pagination.current, pagination.pageSize);
  }, []);

  useEffect(() => {
    if (response?.result === 'Success') {
      setBookings(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.count,
      }));
    }
  }, [response]);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
    fetchBookings(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'User',
      dataIndex: ['user', 'first_name' || 'username'],
      render: (text) => text || '-',
    },
    {
      title: 'Category',
      dataIndex: ['event', 'category', 'name'],
      render: (text) => text || '-',
    }, 
    {
      title: 'Date',
      dataIndex: ['event', 'date'],
    },
    {
      title: 'Slot',
      render: (_, record) =>
        record?.event?.time_slot
          ? `${record.event.time_slot.start_time} - ${record.event.time_slot.end_time}`
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => (
        <Tag color={(status === 'ACTIVE' && isFutureDate(record?.event?.date)) ? 'green' : 'grey'}>{status === 'ACTIVE' && !isFutureDate(record?.event?.date) ? 'COMPLETED': status}</Tag>
      ),
    },
    {
      title: 'Booked At',
      dataIndex: 'booked_at',
      render: (text) =>
        text ? new Date(text).toLocaleString() : '-',
    },
  ];

  return (
    <div className="container pt-4">
      <Card title="All Booking History" bordered={false}>
        {loading && <Spin tip="Loading..." />}
        {error && <Alert type="error" message={`Error: ${error.message}`} />}
        {!loading && (
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            onChange={handleTableChange}
          />
        )}
      </Card>
    </div>
  );
};

export default BookingHistory;
