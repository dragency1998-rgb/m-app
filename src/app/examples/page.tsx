// src/app/examples/page.tsx
'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import FormExample from '@/components/examples/FormExample'
import DataTableExample from '@/components/examples/DataTableExample'

export default function ExamplesPage() {
  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h1 className="h2 fw-bold mb-5">Component Examples</h1>

        <div className="row">
          <div className="col-lg-6 mb-5">
            <div className="card">
              <div className="card-body">
                <FormExample />
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-5">
            <div className="card">
              <div className="card-body">
                <h3 className="h5 fw-bold mb-4">Feature List</h3>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <strong>Form Validation</strong> - Email & password validation
                  </li>
                  <li className="list-group-item">
                    <strong>Firestore CRUD</strong> - Database operations
                  </li>
                  <li className="list-group-item">
                    <strong>Authentication</strong> - Firebase auth
                  </li>
                  <li className="list-group-item">
                    <strong>API Routes</strong> - Next.js API endpoints
                  </li>
                  <li className="list-group-item">
                    <strong>Tailwind CSS</strong> - Utility-first styling
                  </li>
                  <li className="list-group-item">
                    <strong>Bootstrap 5</strong> - Component library
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 mb-5">
            <div className="card">
              <div className="card-body">
                <DataTableExample />
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippets */}
        <div className="row">
          <div className="col-12 mb-5">
            <div className="card">
              <div className="card-body">
                <h3 className="h5 fw-bold mb-4">Usage Examples</h3>

                <h5 className="mt-4 mb-3">Using useAuth Hook</h5>
                <pre className="bg-light p-3 rounded">
{`import { useAuth } from '@/lib/hooks/useAuth'

export default function MyComponent() {
  const { user, login, logout } = useAuth()

  return (
    &lt;div&gt;
      {user && &lt;p&gt;Welcome {user.email}&lt;/p&gt;}
      &lt;button onClick={() => login(email, password)}&gt;
        Login
      &lt;/button&gt;
    &lt;/div&gt;
  )
}`}
                </pre>

                <h5 className="mt-4 mb-3">Using useFirestore Hook</h5>
                <pre className="bg-light p-3 rounded">
{`import { useFirestore } from '@/lib/hooks/useFirestore'

export default function UsersList() {
  const { data, create, read } = useFirestore('users')

  useEffect(() => {
    read() // Fetch all users
  }, [])

  return (
    &lt;ul&gt;
      {data.map(user =&gt; (
        &lt;li key={user.id}&gt;{user.name}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  )
}`}
                </pre>

                <h5 className="mt-4 mb-3">Form Validation</h5>
                <pre className="bg-light p-3 rounded">
{`import { isEmail, isStrongPassword } from '@/utils/validators'

if (!isEmail(email)) {
  setError('Invalid email')
}

if (!isStrongPassword(password)) {
  setError('Password too weak')
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
