import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlanInfo, ClaimInfo } from '../types'
import { api } from '../services/api'

interface Props {
  plan: PlanInfo
  onComplete?: (data: ClaimInfo) => void
}

function evaluateClaim(amount: number, aiVerified: boolean) {
  if (amount > 3000)
    return { approved: false, reason: 'Claims above $3,000 require manual review by our team.' }
  if (amount <= 500)
    return { approved: true, reason: 'Small claim approved automatically.' }
  if (aiVerified)
    return { approved: true, reason: 'Claim approved after AI document verification.' }
  return { approved: false, reason: 'Manual review required. We will contact you within 2-3 business days.' }
}

export default function UploadDocumentsPage({ plan, onComplete }: Props) {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    hospitalName: '',
    admissionDate: '',
    dischargeDate: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [docName, setDocName] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [aiStatus, setAiStatus] = useState<'idle' | 'verifying' | 'verified'>('idle')

  const days =
    form.admissionDate && form.dischargeDate
      ? Math.max(
          0,
          Math.round(
            (new Date(form.dischargeDate).getTime() -
              new Date(form.admissionDate).getTime()) /
              86400000
          )
        )
      : 0

  const dailyRate = plan.dailyRate || 100
  const amount = days * dailyRate

  const errors: Record<string, string> = {}
  if (!form.hospitalName) errors.hospitalName = 'Hospital name is required'
  if (!form.admissionDate) errors.admissionDate = 'Admission date is required'
  if (!form.dischargeDate) errors.dischargeDate = 'Discharge date is required'
  if (
    form.admissionDate &&
    form.dischargeDate &&
    new Date(form.dischargeDate) <= new Date(form.admissionDate)
  )
    errors.dischargeDate = 'Discharge date must be after admission date'
  if (!docName) errors.doc = 'Please upload your discharge document'

  const isValid = Object.keys(errors).length === 0

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocFile(file)
      setDocName(file.name)
      setAiStatus('verifying')
      setTimeout(() => setAiStatus('verified'), 2500)
    }
  }

  const handleSubmit = async () => {
    try {
      // Create claim in database
      const claimResponse = await api.createClaim({
        hospital_name: form.hospitalName,
        date_of_admission: form.admissionDate,
        date_of_discharge: form.dischargeDate,
      })

      const claimId = claimResponse.id

      // Upload discharge summary file
      if (docFile) {
        await api.uploadDischargeSummary(claimId, docFile)
      }

      // Prepare claim data
      const claimData: ClaimInfo = {
        hospitalName: form.hospitalName,
        admissionDate: form.admissionDate,
        dischargeDate: form.dischargeDate,
        documentUploaded: true,
        documentName: docName,
        claimAmount: amount,
        aiVerified: aiStatus === 'verified',
      }

      onComplete?.(claimData)

      // Evaluate and navigate
      const decision = evaluateClaim(amount, aiStatus === 'verified')
      navigate('/confirmed', { 
        state: { 
          ...decision, 
          amount,
          claimId 
        } 
      })
    } catch (error: any) {
      console.error('Error submitting claim:', error)
      alert('Failed to submit claim. Please try again.')
    }
  }

  const renderField = (
    label: string,
    key: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        onBlur={() => setTouched((p) => ({ ...p, [key]: true }))} 
        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-800
          focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all
          ${
            touched[key] && errors[key]
              ? 'border-red-400 bg-red-50'
              : 'border-slate-200 hover:border-blue-300 bg-white'
          }`}
      />
      {touched[key] && errors[key] && (
        <p className="text-red-500 text-xs mt-1 ml-1">{errors[key]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100
      flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-600
            text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🩺 V-Care
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Submit a Claim</h1>
          <p className="text-slate-500 mt-1">
            Upload your hospital discharge summary for Hospicash payout
          </p>
        </div>

        {renderField('Hospital Name', 'hospitalName', 'text', 'e.g. Royal Melbourne Hospital')}
        {renderField('Date of Admission', 'admissionDate', 'date')}
        {renderField('Date of Discharge', 'dischargeDate', 'date')}

        {days > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-blue-800 font-bold text-lg">
              Estimated Claim: ${amount.toLocaleString()}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              {days} day{days > 1 ? 's' : ''} × ${dailyRate}/day Hospicash payout
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Hospital Discharge Summary <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center
              cursor-pointer transition-all
              ${
                docName
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFile}
            />
            {docName ? (
              <div>
                <p className="text-4xl mb-2">📎</p>
                <p className="text-blue-700 font-semibold text-sm">{docName}</p>
                <p className="text-blue-500 text-xs mt-1">Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-5xl mb-3">📤</p>
                <p className="text-slate-700 font-semibold text-base">
                  Click to upload your discharge summary
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Accepted formats: PDF, JPG, PNG
                </p>
              </div>
            )}
          </div>
          {touched.doc && errors.doc && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors.doc}</p>
          )}
        </div>

        {aiStatus === 'verifying' && (
          <div className="flex items-center gap-3 p-4 bg-amber-50
            border-2 border-amber-200 rounded-xl mb-4">
            <div className="w-6 h-6 border-3 border-amber-500
              border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-amber-700 font-bold text-sm">
                AI Auditor Processing...
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                Verifying your hospital discharge summary
              </p>
            </div>
          </div>
        )}

        {aiStatus === 'verified' && (
          <div className="flex items-center gap-3 p-4 bg-green-50
            border-2 border-green-200 rounded-xl mb-4">
            <span className="text-3xl flex-shrink-0">✅</span>
            <div>
              <p className="text-green-700 font-bold text-sm">
                Document Verified Successfully
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                AI Auditor has confirmed your discharge summary is valid
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2">
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || aiStatus === 'verifying'}
            className={`px-8 py-3 rounded-xl font-bold text-base transition-all
              ${
                isValid && aiStatus !== 'verifying'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {aiStatus === 'verifying' ? 'Verifying...' : 'Submit Claim →'}
          </button>
        </div>

      </div>
    </div>
  )
}