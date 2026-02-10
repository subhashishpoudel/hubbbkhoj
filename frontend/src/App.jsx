import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ShopDetailsPage from './pages/ShopDetailsPage.jsx';
import CategoryMapPage from './pages/CategoryMapPage.jsx';
import CategoryMapPageScrollable from './pages/CategoryMapPageScrollable.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shop/:id" element={<ShopDetailsPage />} />
        <Route path="/category-map" element={<CategoryMapPage />} />
        <Route path="/category-map-scrollable" element={<CategoryMapPageScrollable />} />
      </Routes>
    </Router>
  );
}
