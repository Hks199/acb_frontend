import { axiosClient } from '../../utils/axiosClient';

export const getAllVendors = async(payload) => {
  try {
    const response = await axiosClient.post("vendor/getAll-vendor", payload);
    return response;
  } catch (error) {
    console.error('Failed to signup:', error);
    // throw error;
  }
};
