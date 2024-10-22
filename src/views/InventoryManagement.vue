// src/views/InventoryManagement.vue
<template>
  <div class="inventory-management">
    <h2>Inventory Management</h2>
    
    <div v-if="loading" class="loading">
      Loading inventory...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="inventory-list">
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Current Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ getProductStock(product.id) }}</td>
            <td>
              <button 
                class="update-btn"
                @click="openUpdateModal(product)"
              >
                Update Stock
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stock Update Modal -->
    <div v-if="showUpdateModal" class="modal">
      <div class="modal-content">
        <h3>Update Stock for {{ selectedProduct?.name }}</h3>
        <div class="form-group">
          <label>Current Stock: {{ currentStock }}</label>
          <input 
            type="number" 
            v-model.number="newStockLevel"
            min="0"
            class="stock-input"
          >
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button class="update-btn" @click="updateStock">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'  // Add onMounted import
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { permissionService } from '@/service/permission'
import { UserRoles } from '@/constants/authTypes'  
import { useAuth } from '@/composables/useAuth'

const store = useStore()
const router = useRouter()
const loading = ref(false)
const error = ref(null)
const showUpdateModal = ref(false)
const selectedProduct = ref(null)
const newStockLevel = ref(0)
const currentStock = ref(0)
// 从 product store 获取产品列表
const products = computed(() => store.state.product.products);

const { userRole, isAdmin, isSeller } = useAuth()

// 获取特定产品的库存
const getProductStock = (productId) => {
  return store.getters['inventory/getProductStock'](productId);
};

const checkPermissions = async () => {
  if (!isSeller.value && !isAdmin.value) {
    router.push('/403')
    return false
  }
  return true
}

const loadInventory = async () => {
  try {
    loading.value = true;
    // 检查权限
    const hasPermission = await permissionService.checkPermission(
      '/api/inventory', 
      'GET'
    );
    
    if (!hasPermission) {
      error.value = 'You do not have permission to view inventory';
      return;
    }

    // 加载所有产品
    await store.dispatch('product/fetchProducts', {
      role: userRole.value,
      token: localStorage.getItem('token')
    });
    
    // 为每个产品加载库存信息
    for (const product of products.value) {
      await store.dispatch('inventory/fetchInventory', { 
        productId: product.id 
      });
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openUpdateModal = async (product) => {
  try {
    selectedProduct.value = product;
    const stock = await store.dispatch('inventory/fetchInventory', { 
      productId: product.id 
    });
    currentStock.value = stock;
    newStockLevel.value = stock;
    showUpdateModal.value = true;
  } catch (err) {
    error.value = err.message;
  }
};

const closeModal = () => {
  showUpdateModal.value = false;
  selectedProduct.value = null;
  newStockLevel.value = 0;
  currentStock.value = 0;
};

const updateStock = async () => {
  if (!selectedProduct.value) return;
  
  try {
    // 检查权限
    const hasPermission = await permissionService.checkPermission(
      '/api/inventory', 
      'PUT'
    );
    
    if (!hasPermission) {
      throw new Error('You do not have permission to update inventory');
    }

    await store.dispatch('inventory/updateStock', {
      productId: selectedProduct.value.id,
      quantity: newStockLevel.value
    });
    
    closeModal();
    await loadInventory(); // 重新加载数据
  } catch (err) {
    error.value = err.message;
  }
};

// 初始化
onMounted(async () => {
  if (await checkPermissions()) {
    await loadInventory()
  }
})
</script>

<style scoped>
.inventory-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.inventory-list table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.inventory-list th,
.inventory-list td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.inventory-list th {
  background-color: #f5f5f5;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
}

.error {
  color: #ff4444;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin: 20px 0;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
}

.stock-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.update-btn {
  background: #1baeae;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.update-btn:hover {
  background: #158f8f;
}

.cancel-btn {
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f5f5f5;
}
</style>