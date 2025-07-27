import { axiosClient } from '../../utils/axiosClient';

export const updateCartItem = async (payload) => {
  try {
    const response = await axiosClient.patch("cart/updateCartItem", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const getCartbyId = async (userId) => {
  try {
    const response = await axiosClient.get("cart/getCartbyId/" + userId);
    return response;
  } catch (error) {
    // console.error('Failed to fetch product details:', error);
    throw error;
  }
};

export const getUserOrderedProducts = async (payload) => {
  try {
    const response = await axiosClient.post("order/getUserOrderedProducts", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const cancelledOrders = async (payload) => {
  try {
    const response = await axiosClient.post("cancel/user-cancel-order", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const returnedOrders = async (payload) => {
  try {
    const response = await axiosClient.post("return/user-return-item", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const cancelOrReturnOrderItem = async (payload) => {
  try {
    const response = await axiosClient.patch("order/cancelOrReturnOrderItem", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const createOrder = async (payload) => {
  try {
    const response = await axiosClient.post("order/create", payload);
    return response;
  } catch (error) {
    // console.error('Failed to create order:', error);
    throw error;
  }
};

export const paymentVerificationApi = async (payload) => {
  try {
    const response = await axiosClient.post("order/verify", payload);
    return response;
  } catch (error) {
    // console.error('Failed to create order:', error);
    throw error;
  }
};
