// src/views/UserSettings.vue
<template>
  <div class="settings-container">
    <h1>Account Settings</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading settings...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="loadUserData" class="retry-btn">Retry</button>
    </div>

    <!-- Settings Form -->
    <form v-if="!loading" @submit.prevent="handleSubmit" class="settings-form">
      <div class="form-section">
        <h2>Basic Information</h2>
        
        <div class="form-group">
          <label>Username</label>
          <input 
            v-model="formData.username"
            type="text"
            disabled
          >
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="formData.email"
            type="email"
            required
          >
        </div>
      </div>

      <div class="form-section">
        <h2>Change Password</h2>
        <div class="form-group">
          <label>Current Password</label>
          <input 
            v-model="formData.currentPassword"
            type="password"
          >
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input 
            v-model="formData.newPassword"
            type="password"
            :minlength="6"
          >
        </div>

        <div class="form-group">
          <label>Confirm New Password</label>
          <input 
            v-model="formData.confirmPassword"
            type="password"
            :minlength="6"
          >
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          type="button" 
          class="secondary-btn"
          @click="resetForm"
        >
          Reset
        </button>
        <button 
          type="submit" 
          class="primary-btn"
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUserInfo, updateUser } from '@/service/user';
import { showMessage } from '@/utils/message';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const isProcessing = ref(false);

const formData = ref({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const loadUserData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await getCurrentUserInfo(token);
    if (response.success && response.data) {
      formData.value.username = response.data.username;
      formData.value.email = response.data.email;
    } else {
      throw new Error(response.message || 'Failed to load user data');
    }
  } catch (err) {
    error.value = err.message;
    showMessage(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value.currentPassword = '';
  formData.value.newPassword = '';
  formData.value.confirmPassword = '';
  loadUserData();
};

const validateForm = () => {
  if (formData.value.newPassword || formData.value.confirmPassword) {
    if (!formData.value.currentPassword) {
      throw new Error('Current password is required to change password');
    }
    if (formData.value.newPassword !== formData.value.confirmPassword) {
      throw new Error('New passwords do not match');
    }
    if (formData.value.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }
};

const handleSubmit = async () => {
  try {
    isProcessing.value = true;
    validateForm();

    const userData = {
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.newPassword || undefined,
      currentPassword: formData.value.currentPassword || undefined,
      updateDatetime: new Date().toISOString()
    };

    const response = await updateUser(userData);
    if (response.success) {
      showMessage('Settings updated successfully', 'success');
      resetForm();
    } else {
      throw new Error(response.message || 'Failed to update settings');
    }
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.settings-form {
  margin-top: 20px;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section h2 {
  margin: 0 0 20px;
  font-size: 1.2em;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.primary-btn,
.secondary-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.primary-btn {
  background: #1baeae;
  color: white;
  border: none;
}

.secondary-btn {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1baeae;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error-message {
  color: #ff4d4f;
  padding: 10px;
  margin: 10px 0;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>