import React from 'react'

// Global brand header displayed on every screen
export const BrandHeader: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <span className="text-2xl font-extrabold tracking-tight">V-Care</span>
      </div>
    </header>
  )
}

export default BrandHeader
