import { axiosClient } from '../../utils/axiosClient';

export const getAllCategories = async () => {
  try {
    const response = await axiosClient.get("category/getAllCategories");
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await axiosClient.get("category/getCategoryById/" + categoryId);
    return response;
  } catch (error) {
    // console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const getAllProducts = async (payload) => {
  try {
    const response = await axiosClient.post("inventory/getProduct-sortedbyReview", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch products:', error);
    throw error;
  }
};

export const getProductsByCategory = async (payload) => {
  try {
    const response = await axiosClient.post("inventory/getProductsByCategoryId", payload);
    return response;
  } catch (error) {
    // console.error('Failed to fetch products:', error);
    throw error;
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await axiosClient.get("inventory/getProductById/" + productId);
    return response;
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    // throw error;
  }
};
