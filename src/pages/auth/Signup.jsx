import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import InfoComponent from './InfoComponent';
import { signupAccount } from '../../api/authentication';
import { notifyToaster } from '../../components/notifyToaster';

const Signup = () => {
    const [form, setForm] = useState({ first_name: '', email: '', mobile_number: '', password: '', role: "Customer" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSignup = async () => {
        setLoading(true);

        try {
            const response = await signupAccount(form);
            if (response && response.data && response.data.success) {
                navigate('/verify-otp', { state: {email: form.email, signup: true}});
            }
        } catch (err) {
            notifyToaster(err?.response?.data?.message);
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="p-4 min-h-[90vh] flex">
            {/* Left Side: Intro */}
            <InfoComponent />

            {/* Right Side: Signup Form */}
            <div className="w-full md:w-[53%] md:p-16 flex flex-col">
                <h2 className="my-4 md:my-8 text-3xl md:text-[40px] font-bold text-[#F75E69]">Create your account</h2>

                <div className="space-y-6 md:w-[95%]">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="Ex - John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile_number"
                            placeholder="+91-xxxx xxx xxx"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                            value={form.mobile_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="**********"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <p className="mt-[-15px] ml-2 text-xs text-gray-500 mt-4 italic">Note: Our ecommerce service is currently available in <span className="font-semibold text-black">India only</span>.</p>

                    <button type="submit" disabled={loading} onClick={handleSignup}
                        className="w-full py-3 mt-4 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:shadow-md text-white rounded-lg font-semibold"
                    >
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </div>

                <p className="text-sm text-gray-600 mt-3 md:mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#FF5E5E] hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup