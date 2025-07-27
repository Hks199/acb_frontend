import { removeToken } from '../../helper';
import { axiosClient } from '../../utils/axiosClient';

export const loginAccount = async(payload) => {
  try {
    const response = await axiosClient.post("users/login", payload);
    return response;
  } catch (error) {
    console.error('Failed to login:', error);
    // throw error;
  }
};

export const signupAccount = async(payload) => {
  try {
    const response = await axiosClient.post("users/register", payload);
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};

export const forgotAccount = async(payload) => {
  try {
    const response = await axiosClient.post("users/forgot-password", payload);
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};

export const verifyAccount = async(payload) => {
  try {
    const response = await axiosClient.post("users/verify-otp", payload);
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};

export const updateAccountPassword = async(payload) => {
  try {
    const response = await axiosClient.post("users/update-password", payload);
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};

export const logoutAccount = async() => {
  try {
    const response = await axiosClient.post("users/logout-user", {});
    removeToken();
    return response;
  } catch (error) {
    console.error('Failed to login:', error);
    // throw error;
  }
};
