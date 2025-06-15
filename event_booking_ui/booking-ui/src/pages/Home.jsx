import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../components/header';
import CalendarSlotManager from './AdminPages/AddOrEditEvent.page';

const Home = () => {
  const auth = useSelector((state) => state.auth);

  return (
    <>
      <CalendarSlotManager />
    </>
  );
};

export default Home;