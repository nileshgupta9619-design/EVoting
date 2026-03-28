import React from 'react'

const AdminHeader = ({admin,handleLogout}) => {
  return (
    <div>
          <header className="bg-slate-800/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                      </div>
                      <div>
                          <h1 className="text-2xl font-bold text-white">E-Voting Admin</h1>
                          <p className="text-purple-300 text-xs">Control Panel</p>
                      </div>
                  </div>

                  <div className="flex items-center space-x-6">
                      <div className="hidden sm:block text-right">
                          <p className="text-white font-medium">{admin?.email}</p>
                          <p className="text-purple-300 text-xs">Administrator</p>
                      </div>
                      <button
                          onClick={handleLogout}
                          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition border border-red-500/50"
                      >
                          Logout
                      </button>
                  </div>
              </div>
          </header>
    </div>
  )
}

export default AdminHeader