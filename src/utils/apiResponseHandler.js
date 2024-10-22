// src/utils/apiResponseHandler.js

// Handle successful API response
export const handleApiResponse = (response) => {
    // Check if response matches ApiResponse structure
    if (response.hasOwnProperty('success') && response.hasOwnProperty('message')) {
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    }
    // If response doesn't match ApiResponse structure, return as-is
    return response;
  };
  
  // Format response to match backend ApiResponse structure
  export const createApiResponse = (success, message, data) => {
    return {
      success,
      message,
      data
    };
  };
  
  // Error handler for API calls
  export const handleApiError = (error) => {
    // If error is already in ApiResponse format
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    // Default error message
    throw new Error(error.message || 'An unexpected error occurred');
  };