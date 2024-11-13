// src/views/Login.vue
<template>
  <div class="login">
    <simple-header :name="state.type === 'login' ? 'Login' : 'Register'" :back="'/'" />
    <!-- 修改 logo 样式 -->
    <div class="logo-container">
      <img class="logo" src="/logo.png" alt="Logo">
    </div>
    <div v-if="state.type === 'login'" class="login-body login">
      <form @submit.prevent="onSubmit">
        <input 
          v-model="state.username" 
          type="text" 
          placeholder="Username" 
          required
          maxlength="50"
        >
        <input 
          v-model="state.password" 
          type="password" 
          placeholder="Password" 
          required
          maxlength="50"
        >
        <div class="link-register" @click="toggle('register')">Register now</div>
        <button type="submit">Login</button>
      </form>
    </div>
    <div v-else class="login-body register">
      <form @submit.prevent="onSubmit">
        <input 
          v-model="state.username" 
          type="text" 
          placeholder="Username" 
          required
          maxlength="50"
        >
        <input 
          v-model="state.password" 
          type="password" 
          placeholder="Password" 
          required
          maxlength="50"
        >
        <input 
          v-model="state.email" 
          type="email" 
          placeholder="Email" 
          required
          maxlength="100"
        >
        <div class="link-login" @click="toggle('login')">Already have an account</div>
        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login {
  padding: 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px auto 20px;
}

.logo {
  max-width: 120px;
  max-height: 120px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.login-body form {
  display: flex;
  flex-direction: column;
  max-width: 300px;  /* 限制表单最大宽度 */
  margin: 0 auto;    /* 居中显示 */
}

input {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #1baeae;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #158f8f;
}

.link-register, .link-login {
  color: #1989fa;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: center;
}

/* 添加输入框focus状态的样式 */
input:focus {
  outline: none;
  border-color: #1baeae;
  box-shadow: 0 0 0 2px rgba(27, 174, 174, 0.2);
}
</style>

<script setup>
import { reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import SimpleHeader from '@/components/SimpleHeader.vue'
import { getCurrentUserInfo, login, register } from '@/service/user'
import { useStore } from 'vuex';
const store = useStore();
const router = useRouter()
import { showMessage } from '@/utils/message'
  
const state = reactive({
  username: '',
  password: '',
  email: '',
  type: 'login'
})

const toggle = (v) => {
  state.type = v
  state.username = ''
  state.password = ''
  state.email = ''
}

const onSubmit = async () => {
  try {
    if (state.type === 'login') {
      // Login handling
      const response = await login({
        username: state.username,
        password: state.password
      });

      if (response && response.success) {
        localStorage.setItem('token', response.data);

        try {
          const userInfoResponse = await getCurrentUserInfo(response.data);
          
          if (userInfoResponse && userInfoResponse.success) {
            localStorage.setItem('user', JSON.stringify(userInfoResponse.data));
            await store.dispatch('user/setUser', userInfoResponse.data);
            showMessage('Login successful', 'success');
            router.push('/api/home');
          }
        } catch (userError) {
          console.error('User info error:', userError);
          throw new Error('Failed to get user information');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } else {
      // 添加基本的表单验证
      if (!state.username || !state.password || !state.email) {
        throw new Error('Please fill in all required fields');
      }

      if (state.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.email)) {
        throw new Error('Please enter a valid email address');
      }

      // 注册
      const registerResponse = await register({
        username: state.username,
        password: state.password,
        email: state.email
      });

      if (registerResponse.success) {
        showMessage('Registration successful. Please log in.', 'success');
        // 清空表单
        state.username = '';
        state.password = '';
        state.email = '';
        // 切换到登录界面
        state.type = 'login';
      } else {
        throw new Error(registerResponse.message || 'Registration failed');
      }
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showMessage(error.message || 'An error occurred', 'error');
  }
};

</script>