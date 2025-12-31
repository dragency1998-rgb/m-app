// src/components/common/Footer.tsx
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="fw-bold mb-3">About</h5>
            <p className="text-muted">
              Professional Next.js application with modern technologies.
            </p>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-muted hover:text-white">Home</a></li>
              <li><a href="/dashboard" className="text-decoration-none text-muted hover:text-white">Dashboard</a></li>
              <li><a href="/login" className="text-decoration-none text-muted hover:text-white">Login</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Contact</h5>
            <p className="text-muted">
              Email: info@example.com<br />
              Phone: +1 (555) 000-0000
            </p>
          </div>
        </div>
        <hr className="bg-secondary my-4" />
        <div className="text-center text-muted">
          <p className="mb-0">
            &copy; {currentYear} Professional Next.js App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
