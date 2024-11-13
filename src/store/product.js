// src/store/product.js
import { getAllProducts } from '@/service/product'; 

export default {
    namespaced: true,
    state: {
      products: [],
      loading: false,
      error: null,
      currentProduct: null,
      searchQuery: '',
      filters: {
        category: '',
        priceRange: null
      }
    },
    mutations: {
      SET_PRODUCTS(state, products) {
        state.products = products
      },
      SET_LOADING(state, status) {
        state.loading = status
      },
      SET_ERROR(state, error) {
        state.error = error
      },
      SET_CURRENT_PRODUCT(state, product) {
        state.currentProduct = product
      },
      SET_SEARCH_QUERY(state, query) {
        state.searchQuery = query
      },
      SET_FILTERS(state, filters) {
        state.filters = { ...state.filters, ...filters }
      }
    },
    actions: {
      async fetchProducts({ commit }) {
        try {
          commit('SET_LOADING', true);
          const response = await getAllProducts();
          if (response.success && response.data?.records) {
            commit('SET_PRODUCTS', response.data.records);
          }
        } catch (error) {
          console.error('Failed to fetch products:', error);
          commit('SET_ERROR', error.message);
        } finally {
          commit('SET_LOADING', false);
        }
      },
  
      setCurrentProduct({ commit, state }, productId) {
        const product = state.products.find(p => p.productId === productId);
        if (product) {
          commit('SET_CURRENT_PRODUCT', product);
        }
        return product;
      },
      setSearchQuery({ commit }, query) {
        commit('SET_SEARCH_QUERY', query)
      },
      setFilters({ commit }, filters) {
        commit('SET_FILTERS', filters)
      }
    },
    getters: {
      getProductById: (state) => (productId) => {
        return state.products.find(p => p.productId === parseInt(productId));
      },
      filteredProducts: (state) => {
        let filtered = [...state.products]
        
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
          )
        }
        
        if (state.filters.category) {
          filtered = filtered.filter(product => 
            product.category === state.filters.category
          )
        }
        
        if (state.filters.priceRange) {
          const [min, max] = state.filters.priceRange
          filtered = filtered.filter(product => 
            product.price >= min && product.price <= max
          )
        }
        
        return filtered
      }
    }
  }
  