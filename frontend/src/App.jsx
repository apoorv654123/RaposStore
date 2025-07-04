import { Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import Navbar from './components/Navbar.jsx';
import ProductPage from './pages/ProductPage.jsx';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore.js';

function App() {
  const { theme } = useThemeStore();
  return (
    <div data-theme={theme} className='min-h-screen bg-base-200 transition-colors duration-300'>
      
      <Navbar />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
