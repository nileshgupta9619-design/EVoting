import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import UserProfile from './pages/UserProfile';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />

                        {/* User Protected Routes */}
                        <Route path="/dashboard"    element={<PrivateRoute>  <Dashboard />  </PrivateRoute>}/>
                        <Route path="/profile" element={     <PrivateRoute>         <UserProfile />     </PrivateRoute> }/>
                        <Route path="/change-password" element={     <PrivateRoute>         <ChangePassword />     </PrivateRoute> } />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Admin Routes - Hidden and Protected */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={     <AdminRoute>         <AdminDashboard />     </AdminRoute> }/>

                        {/* Catch All */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </Provider>
    );
}

export default App;
