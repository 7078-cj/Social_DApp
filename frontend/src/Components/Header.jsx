import React from 'react'

function Header() {
  return (
    <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Social App</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Profile
            </button>
    </header>
  )
}

export default Header