import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import InfoComponent from './InfoComponent'
import { updateAccountPassword } from '../../api/authentication'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import IconButton from '@mui/material/IconButton';


const UpdatePassword = () => {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setLoading(true);
    const reqBody = { email: state, newPassword, confirmPassword }

    try {
      const response = await updateAccountPassword(reqBody);
      if(response && response.data && response.data.success){
        navigate('/login');
      }
    } catch (err) {
      // console.log(err);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(!state){
      navigate("/login")
    }
  }, [])

  return (
    <div className="p-4 min-h-[90vh] flex">
      {/* Left Side: Intro */}
      <InfoComponent />

      {/* Right Side: Login Form */}
      <div className="w-full md:w-[53%] md:p-16 flex flex-col">
        <h2 className="my-4 md:my-8 text-3xl md:text-[40px] font-bold text-[#F75E69]">Create New Password</h2>

        <div className="space-y-6 md:w-[95%]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>

            <div className='w-full px-4 flex justify-between items-center border border-gray-300 rounded-md'>
              <input
                type={showNewPassword ? 'text': 'password'}
                className="py-3 w-[90%] outline-none"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <IconButton onClick={() => setShowNewPassword(prev => !prev)}>
                {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </IconButton>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>

            <div className='w-full px-4 flex justify-between items-center border border-gray-300 rounded-md'>
              <input
                type={showConfirmPassword ? 'text': 'password'}
                className="py-3 w-[90%] outline-none"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <IconButton onClick={() => setShowConfirmPassword(prev => !prev)}>
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </IconButton>
            </div>
          </div>

          <button type="submit" disabled={loading} onClick={handleUpdate}
            className="w-full py-3 mt-4 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:shadow-md text-white rounded-lg font-semibold"
          >
            {loading ? "..." : "Update Password"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default UpdatePassword
