// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import Navbar from '@/components/common/Navbar'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Redirect to textile dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/textile-dashboard')
    }
  }, [isAuthenticated, loading, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-5 py-md-8 fade-in">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4 text-dark">
                <span className="text-primary">DR Agency</span> Textile Solutions
              </h1>
              <p className="lead text-muted mb-4">
                Streamline your textile business operations with real-time order tracking, invoice management, ageing analysis, and comprehensive financial insights.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {isAuthenticated ? (
                  <Link href="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/signup" className="btn btn-primary btn-lg">
                      Get Started
                    </Link>
                    <Link href="/login" className="btn btn-outline-primary btn-lg">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white mt-5">
        <div className="container">
          <h2 className="text-center h2 fw-bold mb-5">Features</h2>
          <div className="row g-4">
            {[
              { title: 'Type Safe', desc: 'Full TypeScript support for type safety' },
              { title: 'Responsive', desc: 'Mobile-first responsive design' },
              { title: 'Fast', desc: 'Optimized performance with Next.js 14' },
              { title: 'Offline Ready', desc: 'Works offline with PWA technology' },
              { title: 'Real-time', desc: 'Firebase real-time database' },
              { title: 'Scalable', desc: 'Professional architecture & best practices' },
            ].map((feature) => (
              <div key={feature.title} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm card-custom">
                  <div className="card-body">
                    <h5 className="card-title text-primary">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication Info Section */}
      <section className="py-5 bg-light mt-5">
        <div className="container">
          <h2 className="text-center h2 fw-bold mb-5">Authentication</h2>
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <h5 className="card-title fw-bold mb-3">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    Secure Authentication Enabled
                  </h5>
                  <p className="card-text mb-3">
                    This application includes Firebase Authentication with email/password support. All passwords are securely handled and stored.
                  </p>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Email/Password authentication
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Secure session management
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Protected dashboard routes
                    </li>
                    <li>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Real-time user state management
                    </li>
                  </ul>
                  {!loading && !isAuthenticated && (
                    <div className="mt-4">
                      <p className="text-muted small mb-3">
                        <strong>Demo Account:</strong> Use <code>test@example.com</code> / <code>password</code>
                      </p>
                      <Link href="/signup" className="btn btn-primary me-2">
                        Create Account
                      </Link>
                      <Link href="/login" className="btn btn-outline-primary">
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container">
          <p className="mb-0">&copy; 2025 Next.js Pro App. Built with Next.js and Firebase.</p>
        </div>
      </footer>
    </main>
  )
}
