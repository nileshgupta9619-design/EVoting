import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import CandidateLogin from './pages/CandidateLogin';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import UserProfile from './pages/UserProfile';

// Voter Pages
import VoterDashboard from './pages/VoterDashboard';
import ElectionsPage from './pages/ElectionsPage';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import AllElectionsResultsPage from './pages/AllElectionsResultsPage';
import ReceiptPage from './pages/ReceiptPage';
import VotedElectionsPage from './pages/VotedElectionsPage';

// Candidate Pages
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfilePage from './pages/CandidateProfilePage';
import CandidateRegisterPage from './pages/CandidateRegisterPage';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsers from './pages/AdminUsers';
import AdminCandidates from './pages/AdminCandidates';
import AdminElections from './pages/AdminElections';
import AdminReports from './pages/AdminReports';
import AdminMonitoring from './pages/AdminMonitoring';
import AdminLogs from './pages/AdminLogs';

import './App.css';
import VotePage from './pages/votePage';
import AdminElectionCandidate from './pages/AdminElectionCandidate';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* ==================== PUBLIC ROUTES ==================== */}
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/candidate/register" element={<CandidateRegisterPage />} />
                        <Route path="/candidate/login" element={<CandidateLogin />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* ==================== VOTER ROUTES (PROTECTED) ==================== */}
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <VoterDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/elections"
                            element={
                                <PrivateRoute>
                                    <ElectionsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/vote"
                            element={
                                <PrivateRoute>
                                    <VotePage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/vote/:electionId"
                            element={
                                <PrivateRoute>
                                    <VotingPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/results/:electionId"
                            element={
                                <PrivateRoute>
                                    <ResultsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/all-results"
                            element={
                                <PrivateRoute>
                                    <AllElectionsResultsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <UserProfile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/change-password"
                            element={
                                <PrivateRoute>
                                    <ChangePassword />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/voted-elections"
                            element={
                                <PrivateRoute>
                                    <VotedElectionsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/receipt"
                            element={
                                <PrivateRoute>
                                    <ReceiptPage />
                                </PrivateRoute>
                            }
                        />

                        {/* ==================== CANDIDATE ROUTES (PROTECTED) ==================== */}
                        <Route
                            path="/candidate/dashboard"
                            element={
                                <PrivateRoute>
                                    <CandidateDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/candidate/profile"
                            element={
                                <PrivateRoute>
                                    <CandidateProfilePage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/candidate/elections"
                            element={
                                <PrivateRoute>
                                    <ElectionsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/candidate/results/:electionId"
                            element={
                                <PrivateRoute>
                                    <ResultsPage />
                                </PrivateRoute>
                            }
                        />

                        {/* ==================== ADMIN ROUTES ==================== */}
                        <Route path="/admin/login" element={<AdminLogin />} />

                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminRoute>
                                    <AdminDashboardPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <AdminRoute>
                                    <AdminUsers />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/candidates"
                            element={
                                <AdminRoute>
                                    <AdminCandidates />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/elections"
                            element={
                                <AdminRoute>
                                    <AdminElections />
                                </AdminRoute>
                            }
                        />
                        {/* /admin/election/${election._id}/candidates */}
                        <Route
                            path="/admin/elections/:electionId/candidates"
                            element={
                                <AdminRoute>
                                    <AdminElectionCandidate />
                                </AdminRoute>
                            }
                        />
                        
                        <Route
                            path="/admin/registrations"
                            element={
                                <AdminRoute>
                                    <AdminUsers />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/reports"
                            element={
                                <AdminRoute>
                                    <AdminReports />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/monitoring"
                            element={
                                <AdminRoute>
                                    <AdminMonitoring />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/logs"
                            element={
                                <AdminRoute>
                                    <AdminLogs />
                                </AdminRoute>
                            }
                        />

                        {/* ==================== CATCH ALL ==================== */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </Provider>
    );
}

export default App;
