import { useState, useEffect } from 'react'
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { getUserByAuthToken, updateUser } from '../../api/user';
import useUserHook from '../../context/UserContext';
import statesData from "../../utils/states_array.json"; 
import cityData from "../../utils/cities_by_state_array.json";
import { notifyError, notifyToaster } from '../../components/notifyToaster';
import Loading from '../../components/Loading';

const UserProfile = () => {
  const { user, setUser } = useUserHook();
  const [loading, setLoading] = useState(true);
  const [statesList, setStatesList] = useState(statesData);
  const [cityList, setCityList] = useState([]);

  const [form, setForm] = useState({
    full_name: '',
    role: '',
    email: '',
    mobile_number: '',
    password: '',
    gender: 'Male',
    landmark: '',
    state: '',
    city: '',
    country: 'India',
    pin_code: ''
  });

  useEffect(() => {
    const getUserData = async() => {
      try {
        const response = await getUserByAuthToken();
        if(response && response.data && response.data.status === "success"){
          const { email, firstName, landmark, mobile_number, role, state, city, pin_code } = response.data.userData;
          setForm((prev) => ({...prev, full_name: firstName, email, landmark, mobile_number, role, state, city, pin_code}));
          for(let i = 0; i < cityData.length; i++){
            if(cityData[i].state === state){
              setCityList(cityData[i].cities)
              break;
            }
            else{
              setCityList([]);
            }
          }
        }
        else{
          // console.log(response.data)
        }
      } catch (err) {
        // console.log(err);
      } finally {
        setLoading(false)
      }
    }

    getUserData();
  }, []);

  const handleProfileUpdate = async() => {
    try{
      const response = await updateUser(user.userId, form);
      if(response && response.data){
        notifyToaster("Profile updated successfully.");
        setUser({...user, ...form});
      }
      else{
        notifyError();
      }
    }
    catch(err){
      notifyError();
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }))
    if(name === "state"){
      for(let i = 0; i < cityData.length; i++){
        if(cityData[i].state === value){
          setCityList(cityData[i].cities)
          break;
        }
        else{
          setCityList([]);
        }
      }
    }
  }


  if(loading) return <Loading />;

  return (
    <div className="px-4 py-6 md:p-8 max-w-4xl mx-auto min-h-[95vh]">
      <h2 className="text-2xl md:text-[36px] font-bold text-[#F75E69] mb-8">Update Profile</h2>

      <div className="md:grid grid-cols-2 gap-6 space-y-4 md:space-y-0">
        {/* First Name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Mobile Number</label>
          <input
            type="tel"
            name="mobile_number"
            value={form.mobile_number}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-lg outline-none"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Landmark */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Landmark</label>
          <input
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Postal Code</label>
          <input
            name="pin_code"
            value={form.pin_code}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
          />
        </div>

        {/* Country */}
        <FormControl fullWidth sx={{mb: { xs: 3, md: 0 }}}>
          <InputLabel>Country</InputLabel>
          <Select
            name="country"
            value={form.country}
            onChange={handleChange}
            label="Country"
            disabled
          >
            <MenuItem value="India">India</MenuItem>
          </Select>
        </FormControl>

        {/* State */}
        <FormControl fullWidth sx={{mb: { xs: 3, md: 0 }}}>
          <InputLabel>State</InputLabel>
          <Select
            name="state"
            value={form.state}
            onChange={handleChange}
            label="State"
          >
            {statesList.map((obj) => (
              <MenuItem value={obj.name}>{obj.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City */}
        <FormControl fullWidth sx={{mb: { xs: 3, md: 0 }}}>
          <InputLabel>City</InputLabel>
          <Select
            name="city"
            value={form.city}
            onChange={handleChange}
            label="City"
          >
            {cityList.map((obj) => (
              <MenuItem value={obj.name}>{obj.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Submit Button */}
        <div className="col-span-2">
          <button type="submit" onClick={handleProfileUpdate}
            className="w-full py-3 mt-4 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] text-white rounded-lg font-semibold hover:shadow-md"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

