import { axiosClient } from '../../utils/axiosClient';

export const getUserById = async(userId) => {
  try {
    const response = await axiosClient.post("users/getuser-byid/" + userId, {});
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};

export const getUserByAuthToken = async() => {
  try {
    const response = await axiosClient.get("users/getUserByAuthToken");
    return response;
  } catch (error) {
    console.log('Failed to signup:', error);
    // throw error;
  }
};

export const updateUser = async(userId, payload) => {
  try {
    const response = await axiosClient.patch("users/update-user/" + userId, payload);
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};

