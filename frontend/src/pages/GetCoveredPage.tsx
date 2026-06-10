import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '../layout/MainLayout'
import { useVCare } from '../context/VCareContext'
import { api } from '../services/api'
import type { PersonalInfo } from '../types'

export function GetCoveredPage(): React.ReactElement {
  const navigate = useNavigate()
  const { state, setState } = useVCare()
  const [form, setForm] = React.useState<PersonalInfo>(state.personal)
  React.useEffect(() => {
    setForm(state.personal)
  }, [state.personal])
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  const errors: Record<string, string> = {}
  if (!form.name) errors.name = 'Full name is required'
  if (!form.dob) errors.dob = 'Date of birth is required'
  if (!form.mobile || !/^\d{10}$/.test(form.mobile)) errors.mobile = 'Enter a valid 10-digit mobile'
  if (!form.address) errors.address = 'Address is required'

  const isValid = Object.keys(errors).length === 0
const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }))
  const handleContinue = async () => {
    try {
      const applicationData = {
        name: form.name,
        date_of_birth: form.dob,
        mobile_number: form.mobile,
        email_address: form.email,
        address: form.address,
        postcode: form.pincode,
        plan_selected: 'V-Care Basic',
        status: 'pending'
      }

      // Call API to create application
      const response = await api.createApplication(applicationData)
      
      // Store personal info AND applicationId in context
      setState(p => ({ 
        ...p, 
        personal: form,
        applicationId: response.id
      }))
      
      navigate('/choose-plan')
    } catch (error: any) {
      console.error('Error creating application:', error)
      alert('Failed to save application. Please try again.')
    }
  }

  const field = (
    label: string,
    key: keyof PersonalInfo,
    type: string = 'text',
    placeholder = ''
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        value={form[key] as string}
        placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        onBlur={() => touch(String(key))}
        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-800`}
      />
      {touched[String(key)] && errors[String(key)] && (
        <p className="text-red-500 text-xs mt-1 ml-1">{errors[String(key)]}</p>
      )}
    </div>
  )

  return (
    <MainLayout>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🩺 V-Care
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Get Covered Today</h1>
          <p className="text-slate-500 mt-1">Step 1 of 3 — Personal Information</p>
        </div>

        {field('Full Name', 'name', 'text', 'John Smith')}
        {field('Date of Birth', 'dob', 'date')}
        {field('Mobile Number', 'mobile', 'tel', '0412 345 678')}
        {field('Email Address', 'email', 'email', 'john@example.com')}
        {field('Home Address', 'address', 'text', '123 Collins St, Melbourne')}
        {field('Postcode', 'pincode', 'text', '3000')}

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`w-full mt-2 py-4 rounded-xl font-bold text-lg transition-all ${isValid ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}
        >
          Continue →
        </button>
      </div>
    </MainLayout>
  )
}
export default GetCoveredPage