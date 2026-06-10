import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PersonalInfo } from '../types'
import { useVCare } from '../context/VCareContext'
import { api } from '../services/api'

interface Props { personal: PersonalInfo }

const australianStates = [
  'Australian Capital Territory',
  'New South Wales',
  'Northern Territory',
  'Queensland',
  'South Australia',
  'Tasmania',
  'Victoria',
  'Western Australia',
]

const citiesByState: Record<string, string[]> = {
  'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Geelong'],
  'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Parramatta', 'Penrith'],
  'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
  'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Port Augusta'],
  'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Geraldton'],
  'Tasmania': ['Hobart', 'Launceston', 'Devonport', 'Burnie'],
  'Northern Territory': ['Darwin', 'Alice Springs', 'Katherine'],
  'Australian Capital Territory': ['Canberra', 'Belconnen', 'Tuggeranong'],
}

const pharmacies = [
  { name: 'Priceline Pharmacy', address: '300 Bourke St', distance: '0.4 km', phone: '03 9650 1234', open: true },
  { name: 'Chemist Warehouse', address: '181 Flinders Lane', distance: '0.8 km', phone: '03 9654 5678', open: true },
  { name: 'Terry White Chemmart', address: '3 Southgate Ave', distance: '1.2 km', phone: '03 9682 9012', open: false },
  { name: 'Blooms The Chemist', address: '234 Lygon St', distance: '2.1 km', phone: '03 9347 3456', open: true },
]

export function NearbyPharmacyPage({ personal }: Props) {
  const navigate = useNavigate()
  const { setState } = useVCare()  // ← REMOVE 'state'
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [pincode, setPincode] = useState(personal.pincode || '')
  const [searched, setSearched] = useState(false)
  const [selectedPharmacy, setSelectedPharmacy] = useState('')

  const cities = selectedState ? (citiesByState[selectedState] || []) : []

  const handleSearch = () => {
    if (selectedState && selectedCity) {
      setSearched(true)
      setSelectedPharmacy('')
    }
  }

  const handleConfirm = async (pharmacyName: string) => {
    try {
      // Create telehealth booking
      const bookingResponse = await api.createTelehealthBooking({
        pharmacy_name: pharmacyName,
        location_city: selectedCity,
        location_state: selectedState,
        postcode: pincode || '',
      })

      // Store booking ID in context
      setState(p => ({ ...p, telehealthBookingId: bookingResponse.id }))

      setSelectedPharmacy(pharmacyName)
    } catch (error: any) {
      console.error('Error creating telehealth booking:', error)
      alert('Failed to book telehealth appointment. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-lg mx-auto pt-6">

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🩺 V-Care
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Telehealth Booking</h1>
          <p className="text-slate-500 mt-1">Select your location to book telehealth appointment</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <p className="font-bold text-slate-700 mb-4 text-base">📍 Select Your Location</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">State / Territory <span className="text-red-500">*</span></label>
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity(''); setSearched(false); }} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-300 transition-all">
              <option value="">-- Select State --</option>
              {australianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">City / Suburb <span className="text-red-500">*</span></label>
            <select value={selectedCity} onChange={e => { setSelectedCity(e.target.value); setSearched(false); }} disabled={!selectedState} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-300 transition-all disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">-- Select City --</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Postcode</label>
            <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 3000" maxLength={4} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-300 transition-all" />
          </div>

          <button onClick={handleSearch} disabled={!selectedState || !selectedCity} className={`w-full py-3 rounded-xl font-bold text-base transition-all ${selectedState && selectedCity ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            🔍 Find Pharmacies Near Me
          </button>
        </div>

        {searched && (
          <>
            <div className="flex items-center gap-2 p-4 bg-blue-600 text-white rounded-2xl mb-4 shadow">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold">Showing pharmacies in {selectedCity}, {selectedState}</p>
                {pincode && <p className="text-blue-100 text-sm">Postcode: {pincode}</p>}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {pharmacies.map(p => (
                <div key={p.name} className={`bg-white rounded-2xl shadow p-4 border-2 transition-all ${selectedPharmacy === p.name ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 text-base">{p.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.open ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.open ? '🟢 Open Now' : '🔴 Closed'}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-1">📍 {p.address}, {selectedCity} {pincode}</p>
                  <p className="text-slate-500 text-sm mb-3">🚶 {p.distance} away</p>
                  <div className="flex justify-between items-center">
                    <a href={`tel:${p.phone}`} className="text-sm text-blue-600 font-medium hover:underline">📞 {p.phone}</a>
                    <div className="flex gap-2">
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(p.name + ' ' + p.address + ' ' + selectedCity)}`} target="_blank" rel="noreferrer" className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg">🗺️ Directions</a>
                      <button onClick={() => handleConfirm(p.name)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg">✓ Select</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/confirmation', { state: { selectedPharmacy, city: selectedCity, state: selectedState } })} 
              disabled={!selectedPharmacy}
              className={`w-full py-3 rounded-xl font-bold text-base transition-all ${selectedPharmacy ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              Next →
            </button>
          </>
        )}
      </div>
    </div>
  )
}