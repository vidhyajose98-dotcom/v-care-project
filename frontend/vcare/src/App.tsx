import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import type { PersonalInfo, PlanInfo } from './types'
import { GetCoveredPage } from './pages/GetCoveredPage'
import { MainLayout } from './layout/MainLayout'
import { ChoosePlanPage } from './pages/ChoosePlanPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlanSummaryPage } from './pages/PlanSummaryPage'
import UploadDocumentsPage from './pages/UploadDocumentsPage'
import { NearbyPharmacyPage } from './pages/NearbyPharmacyPage'
import { TelehealthBookingPage } from './pages/TelehealthBookingPage'
import ConfirmedPage from './pages/ConfirmedPage'
import ConfirmationPage from './pages/ConfirmationPage'
// Removed duplicate PlanSummaryPage import; using named export only

const initialPersonal: PersonalInfo = {
  name: '', dob: '', mobile: '', email: '', address: '', pincode: ''
}
const initialPlan: PlanInfo = {
  selectedPlan: null, dailyRate: 0, maxDays: 0, annualCost: 0
}
// initialClaim was unused; removed to avoid dead code warnings

export default function App() {
  const [personal] = useState<PersonalInfo>(initialPersonal)
  const [plan] = useState<PlanInfo>(initialPlan)

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<GetCoveredPage />} />
          <Route path="/choose-plan" element={<ChoosePlanPage plan={plan} onComplete={() => {}} />} />
          <Route path="/dashboard" element={<DashboardPage personal={personal} plan={plan} />} />
          <Route path="/upload" element={<UploadDocumentsPage plan={plan} />} />
          <Route path="/nearby" element={<NearbyPharmacyPage personal={personal} />} />
          <Route path="/telehealth" element={<TelehealthBookingPage personal={personal} />} />
          <Route path="/confirmed" element={<ConfirmedPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/plan-summary" element={<PlanSummaryPage plan={plan} />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}
