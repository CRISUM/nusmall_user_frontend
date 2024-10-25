// src/store/user.js
export default {
    namespaced: true,
    state: {
      user: null,
      authenticated: false
    },
    mutations: {
      SET_USER(state, user) {
        state.user = user;
        state.authenticated = !!user;
      }
    },
    actions: {
      async initializeUser({ commit }) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            console.log('Initializing user from storage:', {
              userId: user.userId,
              role: user.role
            });
            commit('SET_USER', user);
          }
        } catch (error) {
          console.error('Failed to initialize user:', error);
          localStorage.removeItem('user'); // 清除可能损坏的数据
        }
      },
      setUser({ commit }, user) {
        commit('SET_USER', user);
      },
      clearUser({ commit }) {
        commit('SET_USER', null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
    getters: {
      isAuthenticated: state => state.authenticated,
      userRole: state => state.user?.role,
      user: state => state.user
    }
  };