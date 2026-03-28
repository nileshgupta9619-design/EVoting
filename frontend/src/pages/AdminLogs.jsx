import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await adminAPI.getLogs();
            setLogs(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load audit logs',
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
                <div className="bg-gradient-to-r from-gray-600 to-slate-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">📜 Audit Logs</h1>
                    <p className="text-gray-300">System activity and security logs</p>
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

                {/* Logs Table */}
                <Card className="overflow-hidden">
                    {logs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">User</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={log._id || index} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">{log.user?.name || 'System'}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{log.details || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📜</div>
                            <p className="text-gray-600">No audit logs yet</p>
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
}
