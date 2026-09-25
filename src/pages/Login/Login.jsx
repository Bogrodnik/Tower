import LoginForm from '../../components/auth/LoginForm.jsx'

function Login() {
  return (
    <div className="auth-page">
      <span className="page-eyebrow">Tower Account</span>
      <h1 className="page-title">Tower Account</h1>
      <div className="auth-panel">
        <LoginForm />
      </div>
    </div>
  )
}

export default Login
