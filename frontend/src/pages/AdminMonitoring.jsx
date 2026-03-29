import React, { useState, useEffect } from 'react';
import { electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import MonitoringTab from '../components/MonitoringTab';

export default function AdminMonitoring() {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const response = await electionAPI.list();
            setElections(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load elections',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">📡 Real-Time Monitoring</h1>
                    <p className="text-green-100 text-lg">Live election activity and system metrics</p>
                </div>

                {/* Alert */}
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Monitoring Component */}
                <div className="bg-slate-800 rounded-lg p-6">
                    <MonitoringTab elections={elections} />
                </div>
            </div>
        </MainLayout>
    );
}
