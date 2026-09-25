import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AuthForm.css'

/**
 * Sign-up UI only — see LoginForm.jsx for why submission is a no-op. Never
 * persists a real password anywhere; this is purely a UI/flow placeholder
 * for a future auth provider.
 */
function SignupForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span className="auth-label">Username</span>
        <input type="text" name="username" autoComplete="username" required className="auth-input" />
      </label>

      <label className="auth-field">
        <span className="auth-label">Email</span>
        <input type="email" name="email" autoComplete="email" required className="auth-input" />
      </label>

      <label className="auth-field">
        <span className="auth-label">Password</span>
        <input type="password" name="password" autoComplete="new-password" required className="auth-input" />
      </label>

      <label className="auth-field">
        <span className="auth-label">Confirm Password</span>
        <input type="password" name="confirmPassword" autoComplete="new-password" required className="auth-input" />
      </label>

      <button type="submit" className="auth-submit">
        Create Account
      </button>

      {submitted && (
        <p className="auth-note">
          Tower accounts aren&rsquo;t live yet — this form is a UI placeholder until a real
          authentication backend is connected.
        </p>
      )}

      <p className="auth-footer-line">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </form>
  )
}

export default SignupForm
