// src/views/AddressManagement.vue
<template>
  <div class="address-management">
    <h1>Address Management</h1>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading addresses...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="loadAddresses" class="retry-btn">Retry</button>
    </div>

    <!-- Address List -->
    <div v-if="!loading" class="address-list">
      <div class="address-header">
        <h2>My Addresses</h2>
        <button 
          @click="showAddressModal = true" 
          class="add-btn"
        >
          Add New Address
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="addresses.length === 0" class="empty-state">
        <p>No addresses found</p>
        <button 
          @click="showAddressModal = true"
          class="primary-btn"
        >
          Add Your First Address
        </button>
      </div>

      <!-- Address Cards -->
      <div v-else class="address-grid">
        <div 
          v-for="address in addresses" 
          :key="address.addressId" 
          class="address-card"
        >
          <div class="address-content">
            <p><strong>Street:</strong> {{ address.street }}</p>
            <p><strong>City:</strong> {{ address.city }}</p>
            <p><strong>State:</strong> {{ address.state }}</p>
          </div>
          
          <div class="address-actions">
            <button 
              @click="editAddress(address)"
              class="edit-btn"
            >
              Edit
            </button>
            <button 
              @click="confirmDelete(address)"
              class="delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Modal -->
    <div v-if="showAddressModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Address' : 'Add New Address' }}</h2>
        
        <form @submit.prevent="handleSubmit" class="address-form">
          <div class="form-group">
            <label>Street</label>
            <input 
              v-model="addressForm.street"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label>City</label>
            <input 
              v-model="addressForm.city"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label>State</label>
            <input 
              v-model="addressForm.state"
              type="text"
              required
            >
          </div>

          <div class="modal-actions">
            <button 
              type="button"
              @click="closeModal"
              class="secondary-btn"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="primary-btn"
              :disabled="isProcessing"
            >
              {{ isProcessing ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this address?</p>
        
        <div class="modal-actions">
          <button 
            @click="showDeleteModal = false"
            class="secondary-btn"
          >
            Cancel
          </button>
          <button 
            @click="deleteAddress"
            class="delete-btn"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAddressesByUserId, createAddress, updateAddress, deleteAddress as deleteAddressApi } from '@/service/address';
import { showMessage } from '@/utils/message';

const loading = ref(true);
const error = ref(null);
const addresses = ref([]);
const showAddressModal = ref(false);
const showDeleteModal = ref(false);
const isProcessing = ref(false);
const isEditing = ref(false);
const selectedAddress = ref(null);

const addressForm = ref({
  street: '',
  city: '',
  state: ''
});

const loadAddresses = async () => {
  try {
    loading.value = true;
    error.value = null;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.userId) {
      throw new Error('User not found');
    }

    const response = await getAddressesByUserId(user.userId);
    addresses.value = response || [];
  } catch (err) {
    error.value = err.message;
    showMessage(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  showAddressModal.value = false;
  showDeleteModal.value = false;
  isEditing.value = false;
  selectedAddress.value = null;
  addressForm.value = {
    street: '',
    city: '',
    state: ''
  };
};

const editAddress = (address) => {
  isEditing.value = true;
  selectedAddress.value = address;
  addressForm.value = {
    street: address.street,
    city: address.city,
    state: address.state
  };
  showAddressModal.value = true;
};

const confirmDelete = (address) => {
  selectedAddress.value = address;
  showDeleteModal.value = true;
};

const handleSubmit = async () => {
  try {
    isProcessing.value = true;
    const user = JSON.parse(localStorage.getItem('user'));
    
    const addressData = {
      ...addressForm.value,
      userId: user.userId,
      createUser: user.username,
      updateUser: user.username,
      createDatetime: new Date().toISOString(),
      updateDatetime: new Date().toISOString()
    };

    if (isEditing.value) {
      addressData.addressId = selectedAddress.value.addressId;
      await updateAddress(addressData);
      showMessage('Address updated successfully', 'success');
    } else {
      await createAddress(addressData);
      showMessage('Address added successfully', 'success');
    }

    await loadAddresses();
    closeModal();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

const deleteAddress = async () => {
  if (!selectedAddress.value) return;

  try {
    isProcessing.value = true;
    await deleteAddressApi(selectedAddress.value.addressId);
    showMessage('Address deleted successfully', 'success');
    await loadAddresses();
    closeModal();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  loadAddresses();
});
</script>

<style scoped>
.address-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.address-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.address-content {
  margin-bottom: 15px;
}

.address-content p {
  margin: 5px 0;
}

.address-actions {
  display: flex;
  gap: 10px;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ff4d4f;
  padding: 10px;
  margin: 10px 0;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
}

.address-form {
  margin-top: 20px;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.primary-btn,
.secondary-btn,
.add-btn,
.edit-btn,
.delete-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.primary-btn,
.add-btn {
  background: #1baeae;
  color: white;
  border: none;
}

.secondary-btn {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.edit-btn {
  background: #1890ff;
  color: white;
  border: none;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
  border: none;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .address-grid {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>