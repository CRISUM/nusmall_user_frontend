// src/store/index.js
import { createStore } from 'vuex';
import { getUserRole } from '@/service/user';
import user from './user';
import cart from './cart';
import product from './product';
import inventory from './inventory';
import { getCurrentUserInfo } from '@/service/user';
const store = createStore({
    state: {
        user: null,
        userRole: null
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user;
            state.userRole = user?.role || null;
        }
    },
    actions: {
        // Add fetchUserInfo action
        async fetchUserInfo({ commit }) {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const userData = localStorage.getItem('user');
                if (!userData) return;
                
                const user = JSON.parse(userData);
                
                const response = await getCurrentUserInfo(token);
                if (response.success && response.data) {
                    // Store user info in localStorage
                    localStorage.setItem('user', JSON.stringify(response.data));
                    commit('SET_USER', response.data);
                }

                if (user && !user.role) {
                    try {
                        const roleResponse = await getUserRole(user.userId);
                        if (roleResponse) {
                        user.role = roleResponse.name;
                        // 更新localStorage中的用户数据
                        localStorage.setItem('user', JSON.stringify(user));
                        }
                    } catch (error) {
                        console.error('Failed to get user role:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
                commit('SET_USER', null);
            }
        }
    },
    modules: {
        user,
        cart,
        product,
        inventory
    }
});


export default store;