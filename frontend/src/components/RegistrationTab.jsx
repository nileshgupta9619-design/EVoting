import React from 'react'

const RegistrationTab = ({ pendingRegistrations }) => {
  return (
    <div>
          <div>
              <h2 className="text-2xl font-bold text-white mb-6">Pending User Registrations</h2>
              {pendingRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                      <p className="text-slate-300 text-lg">No pending registrations</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {pendingRegistrations.map((user) => (
                          <div key={user._id} className="bg-slate-600/50 border border-purple-500/20 rounded-lg overflow-hidden">
                              <div className="p-6">
                                  <div className="grid md:grid-cols-2 gap-6">
                                      {/* User Info */}
                                      <div>
                                          <h3 className="text-lg font-semibold text-white mb-3">User Information</h3>
                                          <div className="space-y-2 text-sm">
                                              <div>
                                                  <span className="text-purple-300">Name:</span>
                                                  <span className="ml-2 text-white">{user.fullName}</span>
                                              </div>
                                              <div>
                                                  <span className="text-purple-300">Email:</span>
                                                  <span className="ml-2 text-white">{user.email}</span>
                                              </div>
                                              <div>
                                                  <span className="text-purple-300">Phone:</span>
                                                  <span className="ml-2 text-white">{user.phone}</span>
                                              </div>
                                              <div>
                                                  <span className="text-purple-300">Email Verified:</span>
                                                  <span className={`ml-2 font-semibold ${user.isEmailVerified ? 'text-green-400' : 'text-red-400'}`}>
                                                      {user.isEmailVerified ? '✓ Yes' : '✗ No'}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>

                                      {/* Government ID Info */}
                                      <div>
                                          <h3 className="text-lg font-semibold text-white mb-3">Government ID</h3>
                                          <div className="space-y-2 text-sm">
                                              <div>
                                                  <span className="text-purple-300">ID Type:</span>
                                                  <span className="ml-2 text-white capitalize">{user.governmentIdType}</span>
                                              </div>
                                              <div>
                                                  <span className="text-purple-300">ID Number:</span>
                                                  <span className="ml-2 text-white">{user.governmentIdNumber}</span>
                                              </div>
                                              <div className="mt-4">
                                                  <p className="text-purple-300 text-xs mb-2">ID Document:</p>
                                                  {user.govermentIdDocumentUrl && (
                                                      <div className="border border-purple-500/30 rounded p-2 bg-slate-700/40">
                                                          {user.govermentIdDocumentUrl.startsWith('data:') ? (
                                                              <img
                                                                  src={user.govermentIdDocumentUrl}
                                                                  alt="ID Document"
                                                                  className="w-full h-32 object-cover rounded"
                                                              />
                                                          ) : (
                                                              <a href={user.govermentIdDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                                  View Document
                                                              </a>
                                                          )}
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="mt-6 flex gap-3 pt-4 border-t border-purple-500/20">
                                      <button
                                          onClick={() => approveRegistration(user._id)}
                                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition"
                                      >
                                          ✓ Approve Registration
                                      </button>
                                      <button
                                          onClick={() => rejectRegistration(user._id)}
                                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition"
                                      >
                                          ✗ Reject Registration
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
    </div>
  )
}

export default RegistrationTab