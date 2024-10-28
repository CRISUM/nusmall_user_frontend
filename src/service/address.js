// src/service/address.js
import { userService } from '@/utils/axios';

const addressApi = {
  createAddress: async (addressData) => {
    try {
      const response = await userService.post('/api/addresses', addressData);
      return response;
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  },

  getAddressesByUserId: async (userId) => {
    try {
      const response = await userService.get(`/api/addresses/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to get addresses:', error);
      throw error;
    }
  },
  updateAddress: async (addressData) => {
    try {
      const response = await userService.put(`/api/addresses/${addressData.addressId}`, addressData);
      return response;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  },
  
  deleteAddress: async (addressId) => {
    try {
      const response = await userService.delete(`/api/addresses/${addressId}`);
      return response;
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  }
};

export const {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressesByUserId
} = addressApi;