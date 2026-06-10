import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button3D } from '../components/Button3D'
import type { PersonalInfo } from '../types'
import type { PlanInfo } from '../types'

interface Props {
  personal: PersonalInfo
  plan: PlanInfo
}

// Simple Claim/Consultation page scaffold
export function ClaimConsultationPage({ personal, plan }: Props) {
  const navigate = useNavigate()
  const [type, setType] = React.useState<'claim'|'consult'>('claim')
  const [notes, setNotes] = React.useState('')

  const handleSubmit = () => {
    // In a full flow, we would call the AI auditor here
    // For now, proceed to Telehealth booking step
    navigate('/telehealth', { state: { personal, plan } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
          <select className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl" value={type} onChange={e => setType(e.target.value as any)}>
            <option value="claim">Claim</option>
            <option value="consult">Consultation</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
          <textarea className="w-full h-28 px-4 py-2 border-2 border-slate-200 rounded-xl" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Provide details..." />
        </div>
        <div className="flex justify-end">
          <Button3D onClick={handleSubmit}>Next →</Button3D>
        </div>
      </div>
    </div>
  )
}

export default ClaimConsultationPage
