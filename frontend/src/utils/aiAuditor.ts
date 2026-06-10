import type { PersonalInfo } from '../types'

export type AuditResult = {
  ok: boolean
  reasons: string[]
}

// Lightweight AI auditor for personal information submission
export function auditPersonalInfo(data: PersonalInfo): AuditResult {
  const reasons: string[] = []
  if (!data.name || data.name.trim() === '') reasons.push('Name is required')
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) reasons.push('A valid email is required')
  if (!data.mobile || !/^\d{10}$/.test(data.mobile)) reasons.push('Mobile must be exactly 10 digits')
  if (!data.address || data.address.trim() === '') reasons.push('Address is required')
  if (!data.dob || data.dob.trim() === '') reasons.push('Date of birth is required')

  return { ok: reasons.length === 0, reasons }
}
