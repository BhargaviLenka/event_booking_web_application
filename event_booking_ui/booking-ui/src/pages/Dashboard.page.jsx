import React from 'react';
import Header from '../components/header';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <>
     <div style={{ height: '60px', width: '100%' ,   backgroundColor: 'yellow' }} />
      <Header />
      <div className="container mt-4">
        <Outlet />
      </div>
      
    </>
  );
};

export default DashboardLayout;
