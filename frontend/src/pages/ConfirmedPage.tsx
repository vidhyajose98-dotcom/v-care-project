import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { DecisionState } from '../types'

export function ConfirmedPage(): React.ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const incomingState = (location as any).state as DecisionState | undefined
  const state = (incomingState ?? { approved: false, amount: 0, reason: '' }) as DecisionState

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6">
          🩺 V-Care
        </div>
        {state.approved ? (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">✅</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Claim Under Review</h2>
            <p className="text-slate-500 mb-6">
              Your claim for <span className="font-bold text-teal-600">${state.amount.toLocaleString()}</span> has been submitted successfully
            </p>
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold text-lg hover:bg-teal-600 shadow-lg mb-3">
              Back to Dashboard
            </button>
            <button onClick={() => navigate('/upload')} className="text-teal-600 hover:underline text-sm font-medium">
              Submit Another Claim
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">⏳</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Manual Review Required</h2>
            <p className="text-slate-500 mb-6">{state.reason}</p>
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold text-lg hover:bg-teal-600 shadow-lg">
              Back to Dashboard
            </button>
          </>
        )}
        <p className="text-slate-400 text-xs mt-6">This is a demo application. No real insurance processing occurs.</p>
      </div>
    </div>
  )
}
export default ConfirmedPage
