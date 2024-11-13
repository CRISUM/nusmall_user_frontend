// src/store/cart.js
import { getCart, updateItemQuantity, removeItemFromCart, clearCart, 
    updateItemSelected, getSelectedItems, removeSelectedItems } from '@/service/cart';
import { addToCart as addToCartService } from '@/service/cart';
import { getAllProducts } from '@/service/product'; 
  
  const state = {
    cart: {
      cartId: null,
      userId: null,
      cartItems: []
    },
    cartItems: [],
    selectedItems: [],
    loading: false,
    error: null,
    hasChanges: false
  };
    
  
  const mutations = {
    SET_CART(state, cart) {
      state.cart = cart || {
        cartId: Date.now(), // Generate temporary cartId if none exists
        userId: null,
        cartItems: []
      };
    },
    SET_CART_ITEMS(state, items) {
      // 确保items是数组
      const cartItems = Array.isArray(items) ? items : [];
      
      // 为每个item设置完整的信息
      state.cartItems = cartItems.map(item => {
        const storedItem = state.cartItems.find(i => i.productId === item.productId);
        return {
          ...item,
          cartItemId: item.cartItemId,
          productId: item.productId,
          name: item.name || storedItem?.name || 'Product',
          productName: item.productName || item.name || storedItem?.name || 'Product',
          imageUrl: item.imageUrl || storedItem?.imageUrl || '/api/placeholder/400/320',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          isSelected: item.isSelected ?? false
        };
      });
    },
    SET_SELECTED_ITEMS(state, items) {
      state.selectedItems = Array.isArray(items) ? items : [];
    },  
    UPDATE_ITEM_QUANTITY(state, { cartItemId, quantity }) {
      const item = state.cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.quantity = quantity;
        state.hasChanges = true;
      }
    },
    UPDATE_ITEM_SELECTED(state, { cartItemId, isSelected }) {
      const item = state.cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.isSelected = isSelected;
      }
    },
  
    SET_CART_ITEMS(state, items) {
      // 确保每个item都有正确的属性
      state.cartItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        name: item.name || item.productName,
        imageUrl: item.imageUrl || '/api/placeholder/400/320',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })) : [];
    },
    ADD_CART_ITEM(state, item) {
      const existingIndex = state.cartItems.findIndex(i => i.productId === item.productId);
      
      if (existingIndex !== -1) {
        // Update existing item
        state.cartItems[existingIndex] = {
          ...state.cartItems[existingIndex],
          quantity: state.cartItems[existingIndex].quantity + item.quantity,
          name: item.name || state.cartItems[existingIndex].name,
          imageUrl: item.imageUrl || state.cartItems[existingIndex].imageUrl,
          price: Number(item.price) || state.cartItems[existingIndex].price
        };
      } else {
        // Add new item
        state.cartItems.push({
          ...item,
          cartItemId: Date.now(), // 临时ID
          name: item.name || 'Product',
          imageUrl: item.imageUrl || '/api/placeholder/400/320',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          isSelected: item.isSelected ?? false
        });
      }
    },
    UPDATE_ITEM_SELECTED(state, { cartItemId, isSelected }) {
      const item = state.cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.isSelected = isSelected;
      }
    },
    REMOVE_CART_ITEM(state, cartItemId) {
      state.cartItems = state.cartItems.filter(item => item.cartItemId !== cartItemId);
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_CART(state) {
      state.cartItems = [];
      state.selectedItems = [];
      state.hasChanges = false;
    }
  };
  
  const actions = {
    async initializeCart({ commit, dispatch }) {
      try {
        // 1. 获取购物车数据
        const cartResponse = await getCart();
        
        if (!Array.isArray(cartResponse)) {
          throw new Error('Invalid cart data');
        }
  
        // 2. 获取所有商品信息，使用现有的getAllProducts方法
        let productsDetails = [];
        try {
          // 不传任何查询参数，获取所有商品
          const productsResponse = await getAllProducts();
          
          if (productsResponse?.data?.records) {
            productsDetails = productsResponse.data.records;
          }
        } catch (error) {
          console.error('Failed to fetch product details:', error);
        }
  
        // 3. 合并购物车数据和商品详情
        const enrichedCartItems = cartResponse.map(cartItem => {
          // 从所有商品中找到对应的商品详情
          const productDetail = productsDetails.find(p => 
            p.productId === cartItem.productId || p.id === cartItem.productId
          );
          
          return {
            ...cartItem,
            name: productDetail?.name || cartItem.productName || 'Unknown Product',
            productName: productDetail?.name || cartItem.productName || 'Unknown Product',
            imageUrl: productDetail?.imageUrl || 
                     productDetail?.productImages?.[0]?.imageUrl || 
                     cartItem.imageUrl || 
                     '/api/placeholder/400/320',
            price: Number(cartItem.price) || 0,
            quantity: Number(cartItem.quantity) || 1,
          };
        });
  
        // 4. 更新state
        commit('SET_CART_ITEMS', enrichedCartItems);
      } catch (error) {
        console.error('Failed to initialize cart:', error);
        commit('SET_CART_ITEMS', []);
      }
    },
    // async initializeCart({ commit }) {
    //   commit('SET_LOADING', true);
    //   try {
    //     // 直接调用获取购物车项目的API
    //     const cartItems = await getCart();
        
    //     // 确保接收到的是数组
    //     if (Array.isArray(cartItems)) {
    //       commit('SET_CART_ITEMS', cartItems);
    //       // 设置选中的商品
    //       const selectedItems = cartItems.filter(item => item.isSelected);
    //       commit('SET_SELECTED_ITEMS', selectedItems);
    //     } else {
    //       console.error('Invalid cart items format:', cartItems);
    //       commit('SET_CART_ITEMS', []);
    //       commit('SET_SELECTED_ITEMS', []);
    //     }
    //   } catch (error) {
    //     console.error('Failed to initialize cart:', error);
    //     commit('SET_ERROR', error.message);
    //   } finally {
    //     commit('SET_LOADING', false);
    //   }
    // },
    async addToCart({ commit, dispatch }, cartItem) {
      commit('SET_LOADING', true);
      try {
        // 确保调用正确的API endpoint
        commit('ADD_CART_ITEM', cartItem);

        await addToCartService({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.price,
          imageUrl: cartItem.imageUrl
        });
        
        // 重新获取购物车数据
        await dispatch('initializeCart');
      } catch (error) {
        console.error('Failed to add to cart:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchCartItems({ commit }) {
      try {
        const items = await getCart();
        commit('SET_CART_ITEMS', items?.cartItems || []);
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
        // 不要在这里设置全局错误状态
        commit('SET_CART_ITEMS', []); // 设置空数组作为默认值
      }
    },
  
    async updateQuantity({ commit }, { cartItemId, quantity }) {
      if (!cartItemId || quantity < 1) {
        throw new Error('Invalid parameters');
      }
    
      commit('SET_LOADING', true);
      try {
        // 直接调用API更新数量
        await updateItemQuantity(cartItemId, quantity);
        commit('UPDATE_ITEM_QUANTITY', { cartItemId, quantity });
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateSelected({ commit }, { cartItemId, isSelected }) {
      if (!cartItemId) {
        throw new Error('Invalid cart item ID');
      }
      
      commit('SET_LOADING', true);
      try {
        await updateItemSelected(cartItemId, isSelected);
        commit('UPDATE_ITEM_SELECTED', { cartItemId, isSelected });
        
        // 更新选中的商品列表
        const selectedItems = await getSelectedItems();
        commit('SET_SELECTED_ITEMS', selectedItems);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async removeItem({ commit }, cartItemId) {
      if (!cartItemId) {
        throw new Error('Invalid cart item ID');
      }
  
      commit('SET_LOADING', true);
      try {
        await removeItemFromCart(cartItemId);
        commit('REMOVE_CART_ITEM', cartItemId);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  
    async clearCart({ commit, state }) {
      commit('SET_LOADING', true);
      try {
        await clearCart(state.cart.cartId);
        commit('CLEAR_CART');
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  
    async removeSelectedItems({ commit, state }) {
      commit('SET_LOADING', true);
      try {
        // Call API to remove selected items
        await removeSelectedItems();
        
        // Update local state
        const remainingItems = state.cartItems.filter(item => !item.isSelected);
        commit('SET_CART_ITEMS', remainingItems);
        commit('SET_SELECTED_ITEMS', []);
        
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateSelected({ commit }, { cartItemId, isSelected }) {
      commit('SET_LOADING', true);
      try {
        // Call API to update item selection
        await updateItemSelected(cartItemId, isSelected);
        
        // Update local state
        commit('UPDATE_ITEM_SELECTED', { cartItemId, isSelected });
        
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  };
  
  const getters = {
    cartTotal: state => {
      return state.cartItems.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
    },
    
    selectedItemsTotal: state => {
      return state.selectedItems.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
    },
    
    cartItemCount: state => state.cartItems.length,
    
    getCartItemById: state => productId => {
      return state.cartItems.find(item => item.productId === productId);
    },

    getCartItemQuantity: (state) => (productId) => {
      // Ensure we're working with an array
      const items = Array.isArray(state.cartItems) ? state.cartItems : [];
      const item = items.find(item => item.productId === productId);
      return item ? item.quantity : 0;
    },

    hasSelectedItems: state => {
      // 确保cartItems是数组并且检查是否有选中的项目
      return Array.isArray(state.cartItems) && 
             state.cartItems.some(item => item.isSelected);
    },
  
    getSelectedItems: state => {
      return Array.isArray(state.cartItems) ? 
             state.cartItems.filter(item => item.isSelected) : 
             [];
    }
  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  };