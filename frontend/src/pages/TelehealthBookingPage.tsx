import React, { useState } from 'react'
import { NearbyPharmacyPage } from './NearbyPharmacyPage'
import { Dropdown } from '../components/Dropdown'
import { Card } from '../components/Card'
import type { PersonalInfo } from '../types'

interface Props {
  personal: PersonalInfo
}

// Telehealth Booking page wrapper with explicit header and embedded NearbyPharmacyPage
export function TelehealthBookingPage({ personal }: Props) {
  const [location, setLocation] = useState<string>('')
  const locations = [
    { value: 'melbourne', label: 'Melbourne Clinic' },
    { value: 'sydney', label: 'Sydney Telehealth Hub' },
    { value: 'adelaide', label: 'Adelaide Health Centre' },
  ]
  return (
    <div>
      <Card className="mx-auto max-w-2xl p-4">
        <Dropdown label="Location" value={location} onChange={setLocation} options={locations} />
        <NearbyPharmacyPage personal={personal} />
      </Card>
    </div>
  )
}
export default TelehealthBookingPage
