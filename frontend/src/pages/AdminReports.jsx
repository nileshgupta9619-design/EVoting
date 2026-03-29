import React, { useState, useEffect } from 'react';
import { adminAPI, electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import ReportTab from '../components/ReportTab';

export default function AdminReports() {
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
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">📊 Reports & Analytics</h1>
                    <p className="text-blue-100 text-lg">System-wide and election-specific reports</p>
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

                {/* Reports Component */}
                <div className="bg-slate-800 rounded-lg p-6">
                    <ReportTab elections={elections} />
                </div>
            </div>
        </MainLayout>
    );
}
