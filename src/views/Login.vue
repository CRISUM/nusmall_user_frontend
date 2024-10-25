<template>
  <div class="login">
    <simple-header :name="state.type === 'login' ? 'Login' : 'Register'" :back="'/'" />
    <img class="logo" src="/logo.png" alt="Logo">
    <div v-if="state.type === 'login'" class="login-body login">
      <form @submit.prevent="onSubmit">
        <input v-model="state.username" type="text" placeholder="Username" required>
        <input v-model="state.password" type="password" placeholder="Password" required>
        <div class="link-register" @click="toggle('register')">Register now</div>
        <button type="submit">Login</button>
      </form>
    </div>
    <div v-else class="login-body register">
      <form @submit.prevent="onSubmit">
        <input v-model="state.username" type="text" placeholder="Username" required>
        <input v-model="state.password" type="password" placeholder="Password" required>
        <input v-model="state.email" type="email" placeholder="Email" required>
        <div class="link-login" @click="toggle('login')">Already have an account</div>
        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import SimpleHeader from '@/components/SimpleHeader.vue'
import { getCurrentUserInfo, login, register, getUserRole } from '@/service/user'
import { useStore } from 'vuex';
const store = useStore();
const router = useRouter()
const showMessage = inject('showMessage')

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

      console.log('Login response:', response);

      // Check response directly since axios interceptor already handles the data extraction
      if (response && response.success) {
        // Store token without Bearer prefix - it's added by interceptors
        localStorage.setItem('token', response.data);

        try {
          // Get user info with the new token
          const userInfoResponse = await getCurrentUserInfo(response.data);
          console.log('User info response:', userInfoResponse);
          
          if (userInfoResponse && userInfoResponse.success) {
            
            localStorage.setItem('user', JSON.stringify(userInfoResponse.data));
          
            // 更新store中的用户信息
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
      // Registration handling
      const response = await register({
        username: state.username,
        password: state.password,
        email: state.email,
        role: 'CUSTOMER',
        createUser: 'system',
        updateUser: 'system',
        createDatetime: new Date(),
        updateDatetime: new Date()
      });

      console.log('Register response:', response);

      if (response && response.success) {
        state.type = 'login';
        showMessage('Registration successful. Please log in.', 'success');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage(error.message || 'An error occurred', 'error');
  }
};

</script>

<style scoped>
.login {
  padding: 20px;
}
.logo {
  width: 120px;
  height: 120px;
  display: block;
  margin: 40px auto 20px;
}
.login-body form {
  display: flex;
  flex-direction: column;
}
input {
  margin-bottom: 10px;
  padding: 10px;
}
button {
  background-color: #1baeae;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}
.link-register, .link-login {
  color: #1989fa;
  margin-bottom: 10px;
  cursor: pointer;
}
</style>