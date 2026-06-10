import React from 'react'
import type { PersonalInfo, PlanInfo } from '../types'

type AppState = {
  personal: PersonalInfo
  plan: PlanInfo
  // Optional applicationId assigned after creating an application
  applicationId?: string
}

type VCareContextValue = {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

const initialPersonal: PersonalInfo = {
  name: '', dob: '', mobile: '', email: '', address: '', pincode: ''
}
const initialPlan: PlanInfo = {
  selectedPlan: null, dailyRate: 0, maxDays: 0, annualCost: 0
}

const VCareContext = React.createContext<VCareContextValue | undefined>(undefined)

export const VCareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AppState>({ 
    personal: initialPersonal, 
    plan: initialPlan,
    applicationId: undefined
  })
  return (
    <VCareContext.Provider value={{ state, setState }}>
      {children}
    </VCareContext.Provider>
  )
}

export const useVCare = () => {
  const ctx = React.useContext(VCareContext)
  if (!ctx) {
    throw new Error('useVCare must be used within a VCareProvider')
  }
  return ctx
}

export default VCareContext