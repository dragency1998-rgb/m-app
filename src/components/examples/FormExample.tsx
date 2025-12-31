// src/components/examples/FormExample.tsx
'use client'

import { useState } from 'react'
import { isEmail } from '@/lib/utils/validators'
import Alert from '@/components/common/Alert'

export default function FormExample() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    if (!isEmail(formData.email)) {
      setAlert({ type: 'danger', message: 'Invalid email address' })
      return
    }

    // Validate password
    if (formData.password.length < 6) {
      setAlert({ type: 'danger', message: 'Password must be at least 6 characters' })
      return
    }

    setAlert({ type: 'success', message: 'Form submitted successfully!' })
    setFormData({ email: '', password: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h3 className="h5 fw-bold mb-4">Form Example</h3>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Submit
      </button>
    </form>
  )
}
