import { Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import About from './pages/About';
// import NotFound from './pages/NotFound';
import HomeComponent from './Home.component';


function App() {


  return (
    <Routes>
      <Route path="/" element={<HomeComponent />} />
      {/* <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;