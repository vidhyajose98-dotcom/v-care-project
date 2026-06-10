import React from 'react'
import { useLocation } from 'react-router-dom'

export default function ConfirmationPage(): React.ReactElement {
  const location = useLocation()
  const state = (location.state as { selectedPharmacy?: string } | undefined) ?? {}
  const pharmacy = state.selectedPharmacy ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 text-left">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-blue-600 text-2xl">🩺</div>
          <h1 className="text-3xl font-bold text-slate-800">Confirmation Sent!</h1>
        </div>
        <p className="text-slate-600 mb-4">A confirmation has been sent to your email.</p>
        <div className="border rounded-xl p-4 bg-blue-50 border-blue-200 w-full mb-4">
          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">Selected pharmacy: {pharmacy ? pharmacy : '(none)'}</span>
        </div>
        <p className="text-slate-500 text-sm">This screen confirms your selection. You can proceed to the dashboard to continue exploring plans.</p>
      </div>
    </div>
  )
}
