import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import InfoComponent from './InfoComponent'
import { updateAccountPassword } from '../../api/authentication'


const UpdatePassword = () => {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { state } = useLocation();
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setLoading(true);
    // console.log(state)
    const reqBody = { email: state, newPassword, confirmPassword }

    try {
      const response = await updateAccountPassword(reqBody);
      // console.log("Resp:", response.data);
      if(response && response.data && response.data.success){
        navigate('/login');
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
        <h2 className="my-4 md:my-8 text-3xl md:text-[40px] font-bold text-[#F75E69]">Create New Password</h2>

        <div className="space-y-6 md:w-[95%]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} onClick={handleUpdate}
            className="w-full py-3 mt-4 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:shadow-md text-white rounded-lg font-semibold"
          >
            Update Password
          </button>
        </div>

      </div>
    </div>
  )
}

export default UpdatePassword
