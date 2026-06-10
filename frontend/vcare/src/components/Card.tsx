import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
}

// A simple card with royal blue border, white background, rounded corners
export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`border border-blue-900 rounded-lg bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}
