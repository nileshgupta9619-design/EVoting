import React from 'react'

const CandidateTab = ({candidates}) => {
  return (
    <div>
          <div>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Manage Candidates</h2>
                  <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition">
                      + Add Candidate
                  </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidates.map((candidate) => (
                      <div key={candidate._id} className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition">
                          <h3 className="text-lg font-semibold text-white mb-2">{candidate.name}</h3>
                          <p className="text-purple-300 text-sm mb-4">{candidate.party}</p>
                          <p className="text-slate-300 text-xs mb-6 line-clamp-3">{candidate.description}</p>
                          <div className="flex gap-2">
                              <button className="flex-1 px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 rounded text-sm transition">
                                  Edit
                              </button>
                              <button className="flex-1 px-3 py-2 bg-red-600/50 hover:bg-red-600/70 text-red-200 rounded text-sm transition">
                                  Delete
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
    </div>
  )
}

export default CandidateTab