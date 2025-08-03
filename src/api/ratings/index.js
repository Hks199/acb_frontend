import { axiosClient } from '../../utils/axiosClient';

export const createReview = async(payload) => {
  try {
    const response = await axiosClient.post("review/addReview", payload);
    return response;
  } catch (error) {
    // console.error('Failed to signup:', error);
    throw error;
  }
};

export const getReviewsByProductId = async(productId, payload) => {
  try {
    const response = await axiosClient.post("review/getReviewsByProduct/" + productId, payload);
    return response;
  } catch (error) {
    // console.error('Failed to signup:', error);
    throw error;
  }
};
