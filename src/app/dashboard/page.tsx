// src/app/dashboard/page.tsx
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/common/Navbar'

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8">
            <h1 className="h2 fw-bold mb-4">Welcome to Your Dashboard</h1>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold">
                  <i className="bi bi-person-circle me-2"></i>
                  Your Profile
                </h5>
                <p className="card-text">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="card-text">
                  <strong>User ID:</strong> <code className="small">{user.uid}</code>
                </p>
                <p className="card-text text-muted">
                  <strong>Account Created:</strong>{' '}
                  {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold">
                  <i className="bi bi-info-circle me-2"></i>
                  What&apos;s Next?
                </h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Authentication is fully configured
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Firebase integration is active
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Dashboard page is protected
                  </li>
                  <li>
                    <i className="bi bi-arrow-right text-primary me-2"></i>
                    Add your features here!
                  </li>
                </ul>
              </div>
            </div>

            <div className="alert alert-info" role="alert">
              <i className="bi bi-lightbulb me-2"></i>
              <strong>Pro Tip:</strong> Edit this page at{' '}
              <code className="small">src/app/dashboard/page.tsx</code> to customize your dashboard.
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-gear me-2"></i>
                  Account Settings
                </h5>

                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm" disabled>
                    <i className="bi bi-pencil me-2"></i>
                    Edit Profile
                  </button>
                  <button className="btn btn-outline-warning btn-sm" disabled>
                    <i className="bi bi-key me-2"></i>
                    Change Password
                  </button>
                  <hr className="my-3" />
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
