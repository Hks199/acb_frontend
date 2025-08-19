import { useState } from 'react'
import { useNavigate } from 'react-router'
import InfoComponent from './InfoComponent'
import { forgotAccount } from '../../api/authentication'


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    const reqBody = { email }

    try {
      const response = await forgotAccount(reqBody);
      if(response && response.data && response.data.success){
        navigate('/verify-otp', { state: {email, signup: false}});
      }
    } catch (err) {
      // console.log(err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 min-h-[90vh] flex">
      {/* Left Side: Intro */}
      <InfoComponent />

      {/* Right Side: Login Form */}
      <div className="w-full md:w-[53%] md:p-16 flex flex-col">
        <h2 className="my-4 md:my-8 text-3xl md:text-[40px] font-bold text-[#F75E69]">Forgot Password</h2>

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

          <button type="submit" disabled={loading} onClick={handleVerify}
            className="w-full py-3 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:shadow-md text-white rounded-lg font-semibold"
          >
            {loading ? "..." : "Forgot password"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
