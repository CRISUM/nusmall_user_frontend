// src/views/InventoryManagement.vue

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import StockLevel from '@/components/StockLevel.vue';
import { 
  getInventory, 
  updateInventory, 
  checkStock, 
} from '@/service/inventory';
import { getAllProducts, getProductsByMerchant } from '@/service/product';

const router = useRouter();
const store = useStore();
const user = JSON.parse(localStorage.getItem('user'));
const authToken = localStorage.getItem('token');

// State
const products = ref([]);
const loading = ref(false);
const error = ref(null);
const showUpdateModal = ref(false);
const showHistoryModal = ref(false);
const selectedProduct = ref(null);
const currentStock = ref(0);
const newStockLevel = ref(0);
const stockHistory = ref([]);
const lowStockThreshold = ref(10);
const searchQuery = ref('');
const sortBy = ref('name');
const sortOrder = ref('asc');

// Computed
const filteredProducts = computed(() => {
  let result = [...products.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.id.toString().includes(query)
    );
  }
  
  result.sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    return sortOrder.value === 'asc' ? 
      aValue > bValue ? 1 : -1 : 
      aValue < bValue ? 1 : -1;
  });
  
  return result;
});

const lowStockProducts = computed(() => {
  return products.value.filter(p => p.availableStock <= lowStockThreshold.value);
});

// Methods
const loadInventoryData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Get products based on user role
    const productsData = user.role === 'SELLER' ? 
      await getProductsByMerchant(authToken) :
      await getAllProducts();

    // Get inventory for each product
    const productsWithStock = await Promise.all(
      productsData.map(async product => {
        const stock = await getInventory(authToken, product.productId);
        return {
          ...product,
          availableStock: stock
        };
      })
    );

    products.value = productsWithStock;
  } catch (err) {
    error.value = err.message;
    console.error('Failed to load inventory:', err);
  } finally {
    loading.value = false;
  }
};

const openUpdateModal = async (product) => {
  try {
    selectedProduct.value = product;
    const stock = await getInventory(authToken, product.productId);
    currentStock.value = stock;
    newStockLevel.value = stock;
    showUpdateModal.value = true;
  } catch (err) {
    error.value = err.message;
  }
};

const updateStock = async () => {
  try {
    if (!selectedProduct.value) return;
    
    await updateInventory(
      authToken,
      selectedProduct.value.productId, 
      newStockLevel.value
    );
    
    await loadInventoryData();
    showUpdateModal.value = false;
    selectedProduct.value = null;
  } catch (err) {
    error.value = err.message;
  }
};

const viewStockHistory = async (product) => {
  try {
    selectedProduct.value = product;
    stockHistory.value = await getInventoryHistory(product.productId);
    showHistoryModal.value = true;
  } catch (err) {
    error.value = err.message;
  }
};

const closeModals = () => {
  showUpdateModal.value = false;
  showHistoryModal.value = false;
  selectedProduct.value = null;
  currentStock.value = 0;
  newStockLevel.value = 0;
  stockHistory.value = [];
};

const checkStockLevel = async (productId, quantity) => {
  try {
    return await checkStock(productId, quantity);
  } catch (err) {
    console.error('Failed to check stock:', err);
    return false;
  }
};

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

// Initialize
onMounted(async () => {
  await loadInventoryData();
});
</script>

<template>
  <div class="inventory-management">
    <div class="header">
      <h1>Inventory Management</h1>
      <div class="filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="search-input"
        />
        <select v-model="lowStockThreshold" class="threshold-select">
          <option :value="5">5 items</option>
          <option :value="10">10 items</option>
          <option :value="20">20 items</option>
        </select>
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div v-if="lowStockProducts.length > 0" class="low-stock-alert">
      <h3>Low Stock Alert</h3>
      <ul>
        <li v-for="product in lowStockProducts" :key="product.productId">
          {{ product.name }} - Only {{ product.availableStock }} left
        </li>
      </ul>
    </div>

    <!-- Main Inventory Table -->
    <div class="inventory-table">
      <table v-if="!loading">
        <thead>
          <tr>
            <th @click="toggleSort('productId')">Product ID</th>
            <th @click="toggleSort('name')">Product Name</th>
            <th @click="toggleSort('availableStock')">Current Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.productId">
            <td>{{ product.productId }}</td>
            <td>{{ product.name }}</td>
            <td :class="{ 'low-stock': product.availableStock <= lowStockThreshold }">
              {{ product.availableStock }}
            </td>
            <td>
              <StockLevel :productId="product.productId" :threshold="lowStockThreshold" />
            </td>
            <td>
              <button @click="openUpdateModal(product)">Update Stock</button>
              <button @click="viewStockHistory(product)">View History</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading inventory data...
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Update Stock Modal -->
    <div v-if="showUpdateModal" class="modal">
      <div class="modal-content">
        <h2>Update Stock Level</h2>
        <p>Product: {{ selectedProduct?.name }}</p>
        <p>Current Stock: {{ currentStock }}</p>
        <div class="form-group">
          <label>New Stock Level:</label>
          <input 
            v-model.number="newStockLevel"
            type="number"
            min="0"
          />
        </div>
        <div class="modal-actions">
          <button @click="closeModals">Cancel</button>
          <button @click="updateStock" class="primary">Update</button>
        </div>
      </div>
    </div>

    <!-- Stock History Modal -->
    <div v-if="showHistoryModal" class="modal">
      <div class="modal-content">
        <h2>Stock History</h2>
        <p>Product: {{ selectedProduct?.name }}</p>
        <div class="history-list">
          <div v-for="record in stockHistory" :key="record.id" class="history-item">
            <span>{{ new Date(record.timestamp).toLocaleString() }}</span>
            <span>{{ record.type }}</span>
            <span>Quantity: {{ record.quantity }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeModals">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保留原有样式并添加以下新样式 */
.low-stock-alert {
  background-color: #fff3e0;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #ff9800;
}

.low-stock {
  color: #ff4444;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.threshold-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

th {
  cursor: pointer;
  user-select: none;
}

th:hover {
  background-color: #f5f5f5;
}
</style>