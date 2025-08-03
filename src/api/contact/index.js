import { axiosClient } from '../../utils/axiosClient';

export const contact = async (payload) => {
  try {
    const response = await axiosClient.post("contact/contact-form", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};
