// src/components/examples/DataTableExample.tsx
'use client'

import { useEffect } from 'react'
import { useFirestore } from '@/lib/hooks/useFirestore'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function DataTableExample() {
  const { data, loading, read } = useFirestore('users')

  useEffect(() => {
    // Fetch users on component mount
    read()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="table-responsive">
      <h3 className="h5 fw-bold mb-4">Data Table Example</h3>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-5">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge bg-${user.active ? 'success' : 'secondary'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
