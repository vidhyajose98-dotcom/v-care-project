import React from 'react'

type InputProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  maxLength?: number
  placeholder?: string
}

export const Input: React.FC<InputProps> = ({ id, label, value, onChange, type = 'text', required = false, maxLength, placeholder }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}{required ? ' *' : ''}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
