import { axiosClient } from '../../utils/axiosClient';

export const updateCartItem = async (payload) => {
  try {
    const response = await axiosClient.patch("cart/updateCartItem", payload );
    return response;
  } catch (error) {
    throw error;
  }
};



export const addToCart = async (payload) => {
  try {
    const response = await axiosClient.post("cart/addToCart", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const calculateCartTotalAmount = async (userId) => {
  try {
    const response = await axiosClient.post("cart/calculateCartTotalAmount/" + userId, {});
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCartbyId = async (userId) => {
  try {
    const response = await axiosClient.get("cart/getCartbyId/" + userId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const removeCartItem = async (payload) => {
  try {
    const response = await axiosClient.post("cart/removeCartItem", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const clearCartApi = async (userId) => {
  try {
    const response = await axiosClient.delete("cart/clearCart/" + userId);
    return response;
  } catch (error) {
    throw error;
  }
};
