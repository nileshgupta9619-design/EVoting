import React from 'react'

const AuditLogTab = ({logs}) => {
  return (
    <div>
          <div>
              <h2 className="text-2xl font-bold text-white mb-6">Audit Logs</h2>
              <div className="space-y-3">
                  {logs.map((log) => (
                      <div key={log._id} className="bg-slate-600/50 p-3 rounded border border-purple-500/10">
                          <div className="flex justify-between">
                              <div>
                                  <p className="text-white font-medium">{log.action}</p>
                                  <p className="text-purple-300 text-sm">By: {log.adminId?.fullName} ({log.adminId?.email})</p>
                              </div>
                              <div className="text-sm text-slate-300">{new Date(log.createdAt).toLocaleString()}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
    </div>
  )
}

export default AuditLogTab