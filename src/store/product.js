// src/store/product.js
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
      async fetchProducts({ commit }, { role, token } = {}) {
        commit('SET_LOADING', true)
        try {
          const products = role === 'SELLER' 
            ? await getProductsByMerchant(token)
            : await getAllProducts()
          commit('SET_PRODUCTS', products)
        } catch (error) {
          commit('SET_ERROR', error.message)
        } finally {
          commit('SET_LOADING', false)
        }
      },
      setSearchQuery({ commit }, query) {
        commit('SET_SEARCH_QUERY', query)
      },
      setFilters({ commit }, filters) {
        commit('SET_FILTERS', filters)
      }
    },
    getters: {
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
  