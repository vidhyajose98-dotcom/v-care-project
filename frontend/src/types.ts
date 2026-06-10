export interface PersonalInfo {
  name: string;
  dob: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
}

export interface PlanInfo {
  selectedPlan: 'basic' | 'select' | null;
  dailyRate: number;
  maxDays: number;
  annualCost: number;
}

export interface ClaimInfo {
  hospitalName: string;
  admissionDate: string;
  dischargeDate: string;
  documentUploaded: boolean;
  documentName: string;
  claimAmount: number;
  aiVerified: boolean;
}

export interface DecisionState {
  approved: boolean;
  amount: number;
  reason?: string;
}