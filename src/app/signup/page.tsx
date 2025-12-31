// src/app/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { isEmail } from '@/lib/utils/validators'
import Navbar from '@/components/common/Navbar'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await signup(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak'
        : err.message || 'Failed to create account. Please try again'
      setGeneralError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-vh-100 d-flex align-items-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <h2 className="card-title h3 fw-bold mb-1 text-center">Create Account</h2>
                  <p className="text-center text-muted mb-4 small">Join us today</p>

                  {generalError && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="bi bi-exclamation-circle"></i> {generalError}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setGeneralError('')}
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-500">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (errors.email) setErrors({ ...errors, email: '' })
                        }}
                        disabled={loading}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <div className="invalid-feedback d-block">{errors.email}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-500">
                        Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (errors.password) setErrors({ ...errors, password: '' })
                          }}
                          disabled={loading}
                          autoComplete="new-password"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label fw-500">
                        Confirm Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                          }}
                          disabled={loading}
                          autoComplete="new-password"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-bold"
                      disabled={loading || Object.keys(errors).length > 0}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>

                  <hr className="my-4" />

                  <div className="text-center">
                    <p className="text-muted mb-2 small">
                      Already have an account?{' '}
                      <Link href="/login" className="text-primary fw-bold text-decoration-none">
                        Login here
                      </Link>
                    </p>
                    <p className="text-muted small">
                      Demo: test@example.com / password
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
