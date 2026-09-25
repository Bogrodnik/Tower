import SignupForm from '../../components/auth/SignupForm.jsx'

function Signup() {
  return (
    <div className="auth-page">
      <span className="page-eyebrow">Tower Account</span>
      <h1 className="page-title">Create Your Tower Account</h1>
      <div className="auth-panel">
        <SignupForm />
      </div>
    </div>
  )
}

export default Signup
