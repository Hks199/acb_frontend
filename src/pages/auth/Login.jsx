import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import InfoComponent from './InfoComponent'
import { loginAccount } from '../../api/authentication'
import { setToken } from '../../helper'
import useUserHook from '../../context/UserContext'
import { notifyToaster } from '../../components/notifyToaster'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import IconButton from '@mui/material/IconButton';

const Login = () => {
  const { setIsAuth } = useUserHook();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const reqBody = { email, password }

    try {
      const response = await loginAccount(reqBody);
      if(response && response.data && response.data.success){
        setToken(response.data.token);
        navigate('/');
        window.location.reload();
        setIsAuth(true); //this will automatically call the getUserByAuthToken in app.jsx
        // getUserByAuthToken()
        // .then((resp) => {})
        // .catch((err) => {})
        // .finally(() => {
        //   setLoadingUser(false);
        // })
      }
    } catch (err) {
      notifyToaster(err?.response?.data?.message);
      if(err?.response?.data?.error === "UnverifiedUser"){
        navigate('/verify-otp', { state: {email, signup: true}});
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])

  return (
    <div className="p-4 min-h-[90vh] flex">
      {/* Left Side: Intro */}
      <InfoComponent />

      {/* Right Side: Login Form */}
      <div className="w-full md:w-[53%] md:p-16 flex flex-col">
        <h2 className="my-4 md:my-8 text-3xl md:text-[40px] font-bold text-[#F75E69]">Welcome back!</h2>

        <div className="space-y-6 md:w-[95%]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className='w-full px-4 flex justify-between items-center border border-gray-300 rounded-md'>
              <input
                type={showPassword ? 'text': 'password'}
                className="py-3 w-[90%] outline-none"
                placeholder="•••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <IconButton onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </IconButton>
            </div>
          </div>

          <div onClick={() => navigate("/forgot-password")} className="mt-[-10px] flex items-center justify-end text-sm text-[#FF5E5E] hover:underline cursor-pointer">
            Forgot password?
          </div>

          <button type="submit" disabled={loading} onClick={handleLogin}
            className="w-full py-3 mt-4 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:shadow-md text-white rounded-lg font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-3 md:mt-6">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-[#FF5E5E] hover:underline">
            Create new account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
