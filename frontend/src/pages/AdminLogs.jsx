import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import AuditLogTab from '../components/AuditLogTab';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filterAction, setFilterAction] = useState('all');

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
                message: error.response?.data?.message || 'Failed to load audit logs',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = filterAction === 'all' ? logs : logs.filter((log) => log.action === filterAction);

    if (loading) return <Loading fullScreen />;

    // Get unique actions for filter
    const uniqueActions = [...new Set(logs.map((log) => log.action))];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-slate-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">📜 Audit Logs</h1>
                    <p className="text-gray-300 text-lg">System activity and security logs</p>
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

                {/* Controls */}
                <Card className="bg-gray-50">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="font-semibold text-gray-700">Filter by Action:</label>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                            >
                                <option value="all">All Actions</option>
                                {uniqueActions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="ml-auto text-sm text-gray-600 font-medium">
                            Showing {filteredLogs.length} of {logs.length} logs
                        </div>
                    </div>
                </Card>

                {/* Audit Logs Tab Component */}
                <div className="bg-slate-800 rounded-lg p-6">
                    <AuditLogTab logs={filteredLogs} />
                </div>

                {/* Empty State */}
                {filteredLogs.length === 0 && (
                    <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-6xl mb-4">📜</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Logs Found</h3>
                        <p className="text-gray-600">
                            {filterAction === 'all'
                                ? 'No audit logs have been recorded yet'
                                : `No logs found for action: ${filterAction}`}
                        </p>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}

