import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVCare } from '../context/VCareContext'
import { api } from '../services/api'

// Plan options (no longer passed as props, read from context or internal const)
const plans = [
  {
    id: 'basic' as const,
    name: 'V-Care Basic',
    price: 600,
    dailyRate: 100,
    maxDays: 30,
    features: [
      'Unlimited 24/7 Telehealth',
      '$100/day Hospicash payout',
      'Policy Tenure for one year',
      'Eligible for Single applicant',
    ],
  },
  {
    id: 'select' as const,
    name: 'V-Care Select',
    price: 1000,
    dailyRate: 100,
    maxDays: 30,
    features: [
      'Unlimited 24/7 Telehealth',
      '$100/day Hospicash payout',
      'Policy Tenure for one year',
      'Eligible for Family',
    ],
  },
]

export function ChoosePlanPage(): React.ReactElement {
  const navigate = useNavigate()
  const { state, setState } = useVCare()
  const [selected, setSelected] = useState<'basic' | 'select' | null>(state.plan.selectedPlan)

  const handleContinue = async () => {
    try {
      const chosen = plans.find(p => p.id === selected) ?? plans[0]
      
      // Update application with selected plan
      const appId = state.applicationId
      if (appId) {
        await api.updateApplication(appId, {
          plan_selected: chosen.name
        })
      }
      
      setState({
        ...state,
        plan: {
          selectedPlan: selected ?? 'basic',
          dailyRate: chosen.dailyRate,
          maxDays: chosen.maxDays,
          annualCost: chosen.price,
        },
      })
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error updating plan:', error)
      alert('Failed to save plan. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 grid place-items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🩺 V-Care
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">Choose Your Plan</h2>
          <p className="text-slate-500">Step 2 of 3 — Coverage Selection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`h-72 border-2 rounded-xl p-4 transition-all relative
                ${selected === p.id
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                  : 'border-slate-300 bg-white hover:border-teal-300'}`}
            >
              {selected === p.id && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
              )}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-600 text-lg">{p.name}</h3>
                  <p className="text-slate-500 text-sm">${p.dailyRate}/day hospital cash</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-teal-500">${p.price.toLocaleString()}</span>
                  <span className="text-slate-500 text-sm">/yr</span>
                </div>
              </div>
              <ul className="space-y-1 mt-2">
                {p.features.map((f) => (
                  <li key={f} className="text-sm text-slate-500">✓ {f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700 font-medium">← Back</button>
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${selected
              ? 'bg-teal-500 hover:bg-teal-600 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}