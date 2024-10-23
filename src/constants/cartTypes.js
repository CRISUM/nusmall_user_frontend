// src/constants/cartTypes.js

/**
 * Cart item status constants
 */
export const CartItemStatus = {
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED',
    SELECTED: 'SELECTED',
    PROCESSING: 'PROCESSING'
  };
  
  /**
   * Inventory status constants
   */
  export const InventoryStatus = {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock'
  };
  
  /**
   * Cart operation types
   */
  export const CartOperation = {
    ADD: 'ADD',
    UPDATE: 'UPDATE',
    REMOVE: 'REMOVE',
    SELECT: 'SELECT',
    DESELECT: 'DESELECT',
    CLEAR: 'CLEAR'
  };
  
  /**
   * Cart error types
   */
  export const CartErrorType = {
    STOCK_ERROR: 'STOCK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR'
  };
  
  /**
   * Cart item interface
   * @typedef {Object} CartItem
   * @property {number} cartItemId - Cart item ID
   * @property {number} productId - Product ID
   * @property {string} name - Product name
   * @property {number} price - Product price
   * @property {number} quantity - Quantity
   * @property {boolean} isSelected - Selection status
   * @property {string} imageUrl - Product image URL
   * @property {string} status - Item status
   */
  
  /**
   * Cart interface
   * @typedef {Object} Cart
   * @property {number} cartId - Cart ID
   * @property {number} userId - User ID
   * @property {Array<CartItem>} cartItems - Cart items
   * @property {Date} createDatetime - Creation date
   * @property {Date} updateDatetime - Last update date
   * @property {string} createUser - Creator
   * @property {string} updateUser - Last updater
   */
  
  /**
   * Cart validation rules
   */
  export const CartValidation = {
    MAX_QUANTITY: 99,
    MIN_QUANTITY: 1,
    MAX_ITEMS: 100
  };
  
  /**
   * Cart events for component communication
   */
  export const CartEvents = {
    ITEM_ADDED: 'cart-item-added',
    ITEM_UPDATED: 'cart-item-updated',
    ITEM_REMOVED: 'cart-item-removed',
    CART_CLEARED: 'cart-cleared',
    CHECKOUT_STARTED: 'checkout-started',
    CHECKOUT_COMPLETED: 'checkout-completed',
    CHECKOUT_FAILED: 'checkout-failed'
  };
  
  /**
   * Error messages
   */
  export const CartErrorMessages = {
    STOCK_INSUFFICIENT: 'Insufficient stock available',
    INVALID_QUANTITY: 'Invalid quantity specified',
    MAX_ITEMS_EXCEEDED: 'Maximum number of items in cart exceeded',
    ITEM_NOT_FOUND: 'Cart item not found',
    CART_NOT_FOUND: 'Shopping cart not found',
    NETWORK_ERROR: 'Network error occurred while processing your request',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    SESSION_EXPIRED: 'Your session has expired, please login again',
    CHECKOUT_FAILED: 'Checkout process failed',
    VALIDATION_FAILED: 'Cart validation failed'
  };
  
  /**
   * Cart state machine definition
   */
  export const CartStateMachine = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    PROCESSING: 'PROCESSING',
    CHECKING_OUT: 'CHECKING_OUT',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
  };
  
  /**
   * Cart item state machine definition
   */
  export const CartItemStateMachine = {
    IDLE: 'IDLE',
    UPDATING: 'UPDATING',
    REMOVING: 'REMOVING',
    SELECTING: 'SELECTING',
    ERROR: 'ERROR'
  };
  
  /**
   * Cart item validation rules
   */
  export const validateCartItem = (item) => {
    const errors = [];
  
    if (!item.productId) {
      errors.push('Product ID is required');
    }
  
    if (!item.quantity || item.quantity < CartValidation.MIN_QUANTITY) {
      errors.push(`Quantity must be at least ${CartValidation.MIN_QUANTITY}`);
    }
  
    if (item.quantity > CartValidation.MAX_QUANTITY) {
      errors.push(`Quantity cannot exceed ${CartValidation.MAX_QUANTITY}`);
    }
  
    if (!item.price || item.price <= 0) {
      errors.push('Price must be greater than 0');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Format price utility
   * @param {number} price 
   * @returns {string}
   */
  export const formatPrice = (price) => {
    return `¥${price.toFixed(2)}`;
  };
  
  /**
   * Calculate subtotal utility
   * @param {CartItem} item 
   * @returns {number}
   */
  export const calculateSubtotal = (item) => {
    return item.price * item.quantity;
  };
  
  /**
   * Calculate total amount utility
   * @param {Array<CartItem>} items 
   * @returns {number}
   */
  export const calculateTotal = (items) => {
    return items.reduce((total, item) => total + calculateSubtotal(item), 0);
  };