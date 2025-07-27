import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import InfoComponent from './InfoComponent'
import { verifyAccount } from '../../api/authentication'
import OtpInput from 'react-otp-input';


const VerifyScreen = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const { state } = useLocation();
  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    const reqBody = { email: state.email, otp }

    try {
      const response = await verifyAccount(reqBody);
      // console.log("Resp:", response.data);
      if(response && response.data && response.data.success){
        if(state.signup){
          navigate('/login');
        }
        else{
          navigate('/update-password', { state: state.email});
        }
      }
      else{
        alert("Wrong OTP!")
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 min-h-[90vh] flex">
      {/* Left Side: Intro */}
      <InfoComponent />

      {/* Right Side: Login Form */}
      <div className="md:w-[53%] md:p-16 flex flex-col">
        <h2 className="my-4 md:my-8 text-3xl md:text-[40px] font-bold text-[#F75E69]">Verify OTP</h2>

        <div className="space-y-6 md:w-[95%]">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderInput={(props) => <input {...props} />}
            inputStyle={{border:"2px solid #F75E69", outline:"none", borderRadius:5, marginLeft:10, marginRight:10, padding:"13px 10px", width:"20%"}}
          />

          <button type="submit" disabled={loading} onClick={handleVerify}
            className="w-full py-3 md:mt-4 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:shadow-md text-white rounded-lg font-semibold"
          >
            Verify OTP
          </button>
        </div>

      </div>
    </div>
  )
}

export default VerifyScreen
