import React from 'react'

const RequestTab = ({ pendingProfiles }) => {
  return (
    <div>
          <div>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Pending Candidate Requests</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingProfiles.map((p) => (
                      <div key={p._id} className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20">
                          <h3 className="text-lg font-semibold text-white mb-2">{p.candidateName}</h3>
                          <p className="text-purple-300 text-sm mb-2">Party: {p.party}</p>
                          <p className="text-slate-300 text-xs mb-4">Submitted by: {p.userId?.fullName} ({p.userId?.email})</p>
                          <div className="flex gap-2">
                              <button onClick={() => approveProfile(p._id)} className="flex-1 px-3 py-2 bg-green-600/50 hover:bg-green-600/70 text-green-200 rounded text-sm transition">Approve</button>
                              <button onClick={() => rejectProfile(p._id)} className="flex-1 px-3 py-2 bg-red-600/50 hover:bg-red-600/70 text-red-200 rounded text-sm transition">Reject</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
    </div>
  )
}

export default RequestTab