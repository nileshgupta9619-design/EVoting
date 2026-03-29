import React from 'react'

const AuditLogTab = ({ logs }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">📜 Audit Logs</h2>
            <div className="space-y-3">
                {logs && logs.length > 0 ? (
                    logs.map((log) => (
                        <div key={log._id} className="bg-slate-600/50 p-4 rounded border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/40 text-blue-200">
                                            {log.action}
                                        </span>
                                        <span className="text-xs text-slate-400">Target: {log.targetType}</span>
                                    </div>
                                    <p className="text-white font-medium">By: {log.adminId?.fullName || 'Admin'} ({log.adminId?.email})</p>
                                    {log.details && (
                                        <p className="text-sm text-slate-300 mt-1">
                                            Details: {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-slate-400 font-mono">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-600/30 rounded border border-purple-500/20">
                        <p className="text-slate-400 text-lg">No audit logs available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuditLogTab