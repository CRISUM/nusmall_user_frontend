<template>
  <div class="login">
    <simple-header :title="state.type === 'login' ? 'Login' : 'Register'" :back="'/'" />
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
import { login, register } from '@/service/user'

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
  console.log('Submit started');
  try {
    if (state.type === 'login') {
      console.log('Attempting login');
      const { token, user } = await login({
        username: state.username,
        password: state.password
      });
      console.log('Login successful', token, user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      showMessage('Login successful', 'success');
      console.log('About to navigate');
      router.push('/api/user');
    } else {
      await register({
        username: state.username,
        password: state.password,
        email: state.email,
        role: 'CUSTOMER' // 默认注册为普通用户
      })
      state.type = 'login'
      showMessage('Registration successful. Please log in.', 'success')
    }
  } catch (error) {
    console.error('Error in onSubmit', error);
    showMessage(error.message || 'An error occurred', 'error');
  }
}
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