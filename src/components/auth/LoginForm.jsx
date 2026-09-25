import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AuthForm.css'

/**
 * Sign-in UI only. There is no authentication backend yet — submitting
 * simply prevents the page reload and reports a "not available" state so
 * this component can be wired up to a real auth provider later without
 * changing its shape.
 */
function LoginForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span className="auth-label">Email</span>
        <input type="email" name="email" autoComplete="email" required className="auth-input" />
      </label>

      <label className="auth-field">
        <span className="auth-label">Password</span>
        <input type="password" name="password" autoComplete="current-password" required className="auth-input" />
      </label>

      <button type="submit" className="auth-submit">
        Sign In
      </button>

      {submitted && (
        <p className="auth-note">
          Tower accounts aren&rsquo;t live yet — this form is a UI placeholder until a real
          authentication backend is connected.
        </p>
      )}

      <Link to="#" className="auth-link-muted" onClick={(event) => event.preventDefault()}>
        Forgot Password?
      </Link>

      <p className="auth-footer-line">
        Don&rsquo;t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </form>
  )
}

export default LoginForm
