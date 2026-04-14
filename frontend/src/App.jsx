import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FindAccount from './pages/FindAccount';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import PostWrite from './pages/PostWrite';
import Calendar from './pages/Calendar';
import ActivityWrite from './pages/ActivityWrite';
import MyPage from './pages/MyPage';
import ActivityDetail from './pages/ActivityDetail';
import Attendance from './pages/admin/Attendance';
import SeatAssignment from './pages/admin/SeatAssignment';
import ScrollToTop from './components/ScrollToTop';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/find-account" element={<FindAccount />} />
      <Route 
        path="/home" 
        element={
          <PrivateRoute>
            <Layout><Home /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/community" 
        element={
          <PrivateRoute>
            <Layout><Community /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/community/:postNum" 
        element={
          <PrivateRoute>
            <Layout><PostDetail /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/community/write" 
        element={
          <PrivateRoute>
            <Layout><PostWrite /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/calendar/write" 
        element={
          <PrivateRoute>
            <Layout><ActivityWrite /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <PrivateRoute>
            <Layout><Calendar /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/activity/:actNum" 
        element={
          <PrivateRoute>
            <Layout><ActivityDetail /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/mypage" 
        element={
          <PrivateRoute>
            <Layout><MyPage /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/activity/:actNum/admin/attendance" 
        element={
          <PrivateRoute>
            <Layout><Attendance /></Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/activity/:actNum/admin/seat" 
        element={
          <PrivateRoute>
            <Layout><SeatAssignment /></Layout>
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;
