import React from 'react'

type Button3DProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

// 3D button with press effect using Tailwind shadows
export const Button3D: React.FC<Button3DProps> = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-md bg-blue-700 text-white shadow-md transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-inner ${className}`}
    >
      {children}
    </button>
  )
}
