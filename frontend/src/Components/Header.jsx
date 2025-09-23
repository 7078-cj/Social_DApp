import React from 'react'
import { useNavigate } from 'react-router-dom'

function Header() {
    const nav = useNavigate()
  return (
    <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Social App</h1>
            <button onClick={()=> nav('/profile')} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Profile
            </button>
    </header>
  )
}

export default Header