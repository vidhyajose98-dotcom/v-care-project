import type { PlanInfo } from '../types'
export function PlanSummaryPage({ plan }: { plan: PlanInfo }) {
  return (
    <div>
      <h2>Plan Summary</h2>
      <p>Selected plan: {plan.selectedPlan ?? 'none'}</p>
      <p>Daily rate: {plan.dailyRate}</p>
      <p>Max days: {plan.maxDays}</p>
      <p>Annual cost: {plan.annualCost}</p>
    </div>
  )
}
export default PlanSummaryPage