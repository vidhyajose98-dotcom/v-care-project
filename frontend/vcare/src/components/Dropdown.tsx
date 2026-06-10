import React from 'react'

type Option = { value: string; label: string }

type DropdownProps = {
  id?: string
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}

export const Dropdown: React.FC<DropdownProps> = ({ id, label, value, onChange, options }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id ?? 'dropdown'} className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <select
        id={id ?? 'dropdown'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
      >
        <option value="">-- Select --</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
