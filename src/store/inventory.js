// src/store/inventory.js
import { getInventory, updateInventory, checkStock } from '@/service/inventory';

const state = {
  inventory: {},  // 使用对象存储库存信息，key 为 productId
  loading: false,
  error: null,
  lastUpdate: null,
  lowStockThreshold: 10
};

const mutations = {
  SET_INVENTORY_ITEM(state, { productId, stock }) {
    state.inventory = {
      ...state.inventory,
      [productId]: stock
    };
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_LAST_UPDATE(state) {
    state.lastUpdate = new Date().toISOString();
  },
  CLEAR_ERROR(state) {
    state.error = null;
  },
  SET_LOW_STOCK_THRESHOLD(state, threshold) {
    state.lowStockThreshold = threshold;
  }
};

const actions = {
  // 获取单个产品库存
  async fetchInventory({ commit, state }, { productId }) {
    // 如果最后更新时间在1分钟内，直接返回缓存的数据
    const cachedStock = state.inventory[productId];
    const lastUpdate = state.lastUpdate;
    const now = new Date();
    if (cachedStock !== undefined && lastUpdate && 
        (now - new Date(lastUpdate)) < 60000) {
      return cachedStock;
    }

    commit('SET_LOADING', true);
    try {
      const token = localStorage.getItem('token');
      const stock = await getInventory(token, productId);
      commit('SET_INVENTORY_ITEM', { productId, stock });
      commit('SET_LAST_UPDATE');
      return stock;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 批量获取库存信息
  async fetchInventoryBatch({ commit }, productIds) {
    commit('SET_LOADING', true);
    try {
      const token = localStorage.getItem('token');
      const stocks = await Promise.all(
        productIds.map(id => getInventory(token, id))
      );
      
      productIds.forEach((id, index) => {
        commit('SET_INVENTORY_ITEM', { 
          productId: id, 
          stock: stocks[index] 
        });
      });
      
      commit('SET_LAST_UPDATE');
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 更新库存
  async updateStock({ commit, dispatch }, { productId, quantity }) {
    commit('SET_LOADING', true);
    try {
      const token = localStorage.getItem('token');
      await updateInventory(token, productId, quantity);
      commit('SET_INVENTORY_ITEM', { productId, stock: quantity });
      commit('SET_LAST_UPDATE');
      
      // 更新产品列表中的库存信息
      dispatch('product/fetchProducts', null, { root: true });
      return quantity;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 检查库存是否充足
  async checkStockAvailability({ state, dispatch }, { productId, quantity }) {
    // 先刷新库存信息
    await dispatch('fetchInventory', { productId });
    const currentStock = state.inventory[productId] || 0;
    return currentStock >= quantity;
  },

  // 清除错误
  clearError({ commit }) {
    commit('CLEAR_ERROR');
  },

  // 设置低库存阈值
  setLowStockThreshold({ commit }, threshold) {
    commit('SET_LOW_STOCK_THRESHOLD', threshold);
  }
};

const getters = {
  // 获取产品库存
  getProductStock: (state) => (productId) => {
    return state.inventory[productId] || 0;
  },
  
  // 检查是否低库存
  isLowStock: (state) => (productId) => {
    const stock = state.inventory[productId] || 0;
    return stock <= state.lowStockThreshold;
  },
  
  // 获取所有低库存产品
  getLowStockProducts: (state) => {
    return Object.entries(state.inventory)
      .filter(([_, stock]) => stock <= state.lowStockThreshold)
      .map(([productId]) => parseInt(productId));
  },
  
  // 获取最后更新时间
  getLastUpdate: (state) => state.lastUpdate,
  
  // 获取加载状态
  isLoading: (state) => state.loading,
  
  // 获取错误状态
  getError: (state) => state.error
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};