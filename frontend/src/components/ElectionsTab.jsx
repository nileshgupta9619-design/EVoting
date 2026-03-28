import React from 'react'

const ElectionsTab = ({elections}) => {
  return (
    <div>
          <div>
              <h2 className="text-2xl font-bold text-white mb-6">Elections</h2>
              <div className="grid md:grid-cols-2 gap-4">
                  {elections.map((el) => (
                      <div key={el._id} className="bg-slate-600/50 p-4 rounded-lg border border-purple-500/20">
                          <div className="flex justify-between items-center">
                              <div>
                                  <h3 className="text-white font-semibold">{el.title}</h3>
                                  <p className="text-purple-300 text-sm">{el.description}</p>
                              </div>
                              <div className="space-x-2">
                                  <span className={`px-3 py-1 rounded-full text-sm ${el.isActive ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'}`}>{el.isActive ? 'Active' : 'Inactive'}</span>
                                  {el.isActive ? (
                                      <button onClick={() => stopElection(el._id)} className="px-4 py-2 bg-red-600/40 text-red-200 rounded">Stop</button>
                                  ) : (
                                      <button onClick={() => startElection(el._id)} className="px-4 py-2 bg-green-600/40 text-green-200 rounded">Start</button>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
    </div>
  )
}

export default ElectionsTab