// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { isEmail } from '@/lib/utils/validators'
import Navbar from '@/components/common/Navbar'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
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
      await login(email, password)
      router.push('/textile-dashboard')
    } catch (err: any) {
      const errorMessage = err.message.includes('Access Denied')
        ? 'Access Denied: You are not authorized to access this application'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many failed login attempts. Please try again later'
        : err.message || 'Failed to login. Please try again'
      setGeneralError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-lg mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">DR Agency</h1>
            <p className="text-slate-300 text-sm">Textile Accounting & Operations</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8">
              {/* Welcome Message */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-600 text-sm mt-1">Sign in to manage your textile operations</p>
              </div>

              {/* Error Alert */}
              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-red-900 text-sm">{generalError}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.email
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-300 bg-white'
                      }`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors({ ...errors, password: '' })
                      }}
                      disabled={loading}
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.password
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-300 bg-white'
                      }`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || Object.keys(errors).length > 0}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">New to DR Agency?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                href="/signup"
                className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition"
              >
                Create an Account
              </Link>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                Protected by enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
