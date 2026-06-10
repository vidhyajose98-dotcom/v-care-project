import React from 'react'
import { Card } from '../components/Card'
// Removed BrandHeader to avoid duplicate top headers across pages

// Global layout wrapper for all screens: header, gradient background, and a centered card
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="min-h-screen bg-primary-500 flex items-center justify-center p-4">
        <Card className="bg-blue-50 w-full max-w-2xl">
          {children}
        </Card>
      </div>
    </>
  )
}

export default MainLayout
