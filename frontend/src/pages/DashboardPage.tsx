 
import { useNavigate } from 'react-router-dom'
import type { PersonalInfo, PlanInfo } from '../types'

interface Props {
  personal: PersonalInfo
  plan: PlanInfo
}

export function DashboardPage({ personal, plan }: Props) {
  const navigate = useNavigate()
  const firstName = (personal.name?.split(' ')[0] || 'Member')
  const planLabel = plan.selectedPlan === 'select'
    ? 'V-Care Select · Family Plan'
    : 'V-Care Basic · Single Member'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-lg mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-blue-600 font-bold text-2xl">🩺 V-Care</span>
          <span className={`px-4 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-100`}>
            {planLabel}
          </span>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
          <p className="text-blue-100 text-sm mb-1">Welcome back</p>
          <h2 className="text-4xl font-bold mt-1">{firstName} 👋</h2>
          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1 rounded-full mt-2">
            {planLabel}
          </span>
        </div>

        <div className="space-y-4 mb-5">
          <button
            onClick={() => navigate('/upload')}
            className="bg-white border-2 border-blue-200 rounded-2xl p-0 w-full h-[120px] overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all flex items-center"
          >
            <div className="flex items-center justify-center h-full w-20">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                🏥
              </div>
            </div>
            <div className="flex-1 px-4 text-left">
              <div className="font-bold text-slate-800 text-xl mb-1">Submit a Claim</div>
              <div className="text-slate-500 text-sm">Upload your hospital discharge summary for instant Hospicash payout</div>
            </div>
            <div className="flex items-center justify-center mx-4 w-10 h-10 bg-blue-600 rounded-full text-white font-bold text-lg">→</div>
          </button>

          <button
            onClick={() => navigate('/nearby')}
            className="bg-white border-2 border-blue-200 rounded-2xl p-0 w-full h-[120px] overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all flex items-center"
          >
            <div className="flex items-center justify-center h-full w-20">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                🩺
              </div>
            </div>
            <div className="flex-1 px-4 text-left">
              <div className="font-bold text-slate-800 text-xl mb-1">Book a Consultation</div>
              <div className="text-slate-500 text-sm">Connect with an Australian-registered GP via Phygital consultation in under 5 minutes</div>
            </div>
            <div className="flex items-center justify-center mx-4 w-10 h-10 bg-blue-600 rounded-full text-white font-bold text-lg">→</div>
          </button>
        </div>
      </div>
    </div>
  )
}
export default DashboardPage