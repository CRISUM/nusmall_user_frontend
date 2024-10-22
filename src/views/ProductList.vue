// src/views/ProductList.vue
<template>
    <div class="product-list">
      <!-- Header Section -->
      <div class="header">
        <h2>{{ pageTitle }}</h2>
        <div class="header-actions" v-if="userRole !== 'CUSTOMER'">
          <button class="primary-btn" @click="showAddProduct = true">
            Add New Product
          </button>
        </div>
      </div>
   
      <!-- Products Grid -->
      <div class="products-grid">
    <div v-for="product in products" :key="product.id" class="product-card">
      <div class="product-image" @click="goToDetail(product.id)">
        <img :src="product.imageUrl" :alt="product.name">
      </div>
      <div class="product-info">
        <h3 @click="goToDetail(product.id)" class="product-title">{{ product.name }}</h3>
        <p class="description">{{ product.description }}</p>
        <p class="category">Category: {{ product.category }}</p>
        <p class="price">¥{{ product.price }}</p>
        <p v-if="showInventory" class="stock">
          Stock: {{ product.availableStock || 0 }}
        </p>
        
        <!-- Customer Actions -->
        <div v-if="userRole === 'CUSTOMER'" class="actions">
          <button 
            class="primary-btn" 
            @click="showAddToCartModal(product)"
            :disabled="!product.availableStock"
          >
            {{ getAddToCartButtonText(product) }}
          </button>
        </div>
      </div>
    </div>
  </div>
   
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading products...
      </div>
   
      <!-- Empty State -->
      <div v-if="!loading && products.length === 0" class="empty-state">
        No products available.
      </div>
   
      <!-- Modals -->
      <transition name="fade">
        <div v-if="showAddProduct || editingProduct || showInventoryModal || showCartModal || showDeleteConfirm" 
             class="modal-container">
          <!-- Add/Edit Product Modal -->
          <div v-if="showAddProduct || editingProduct" class="modal">
            <div class="modal-content">
              <div class="modal-header">
                <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
                <button class="close-btn" @click="closeModal">&times;</button>
              </div>
              
              <form @submit.prevent="handleSubmit" class="product-form">
                <div class="form-group">
                  <label>Product Name</label>
                  <input 
                    v-model="productForm.name"
                    type="text"
                    required
                    placeholder="Enter product name"
                  >
                </div>
   
                <div class="form-group">
                  <label>Description</label>
                  <textarea 
                    v-model="productForm.description"
                    required
                    placeholder="Enter product description"
                  ></textarea>
                </div>
   
                <div class="form-group">
                  <label>Price (¥)</label>
                  <input 
                    v-model.number="productForm.price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter price"
                  >
                </div>
   
                <div class="form-group">
                  <label>Category</label>
                  <input 
                    v-model="productForm.category"
                    type="text"
                    required
                    placeholder="Enter category"
                  >
                </div>
   
                <div class="form-group">
                  <label>Initial Stock</label>
                  <input 
                    v-model.number="productForm.initialStock"
                    type="number"
                    required
                    min="0"
                    placeholder="Enter initial stock"
                  >
                </div>
   
                <div class="form-actions">
                  <button type="button" class="secondary-btn" @click="closeModal">
                    Cancel
                  </button>
                  <button type="submit" class="primary-btn">
                    {{ editingProduct ? 'Update' : 'Add' }} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
   
          <!-- Inventory Management Modal -->
          <div v-if="showInventoryModal" class="modal">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Manage Inventory</h3>
                <button class="close-btn" @click="closeInventoryModal">&times;</button>
              </div>
   
              <div class="inventory-form">
                <p class="current-stock">
                  Current Stock: {{ currentInventory }}
                </p>
                <div class="form-group">
                  <label>New Stock Level</label>
                  <input 
                    v-model.number="newStockLevel"
                    type="number"
                    min="0"
                    required
                  >
                </div>
   
                <div class="form-actions">
                  <button class="secondary-btn" @click="closeInventoryModal">
                    Cancel
                  </button>
                  <button class="primary-btn" @click="updateStockLevel">
                    Update Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
   
          <!-- Delete Confirmation Modal -->
          <div v-if="showDeleteConfirm" class="modal">
            <div class="modal-content confirmation">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this product?</p>
              <div class="confirmation-actions">
                <button class="secondary-btn" @click="showDeleteConfirm = false">
                  Cancel
                </button>
                <button class="danger-btn" @click="deleteProduct">
                  Delete
                </button>
              </div>
            </div>
          </div>
   
          <!-- Add to Cart Modal -->
          <div v-if="showCartModal" class="modal">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Add to Cart</h3>
                <button class="close-btn" @click="closeCartModal">&times;</button>
              </div>
              
              <div class="modal-body">
                <div class="product-info">
                  <h4>{{ selectedProduct?.name }}</h4>
                  <p>Price: ¥{{ selectedProduct?.price }}</p>
                  <p>Available Stock: {{ selectedProduct?.availableStock }}</p>
                </div>
                
                <div class="quantity-control">
                  <label>Quantity:</label>
                  <div class="quantity-input">
                    <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                    <input 
                      type="number" 
                      v-model.number="quantity"
                      :min="1"
                      :max="selectedProduct?.availableStock"
                    >
                    <button @click="increaseQuantity" 
                            :disabled="quantity >= selectedProduct?.availableStock">+</button>
                  </div>
                </div>
              </div>
   
              <div class="modal-footer">
                <button class="secondary-btn" @click="closeCartModal">Cancel</button>
                <button class="primary-btn" @click="confirmAddToCart">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
   </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { addToCart as addToCartApi } from '@/service/cart'
import { UserRoles } from '@/constants/authTypes'  
import { useAuth } from '@/composables/useAuth'

import { 
  getAllProducts,
  getProductsByMerchant,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  getInventory,
  updateInventory,
  uploadImage,
  checkStock
} from '@/service/product'
import { permissionService } from '@/service/permission' // Add this import

// Auth
const { userRole, isAdmin, isSeller } = useAuth()

// Store
const store = useStore()

// State
const products = ref([])
const loading = ref(true)
const showAddProduct = ref(false)
const showInventoryModal = ref(false)
const showDeleteConfirm = ref(false)
const editingProduct = ref(null)
const currentInventory = ref(0)
const newStockLevel = ref(0)
const productToDelete = ref(null)
const showCartModal = ref(false)
const selectedProduct = ref(null)
const quantity = ref(1)
const router = useRouter();

const goToDetail = (productId) => {
  router.push(`/api/product/${productId}`);
};

const productForm = ref({
  name: '',
  description: '',
  price: '',
  category: '',
  initialStock: 0,
  imageUrl: '/api/placeholder/400/320' // 默认图片
})

const pageTitle = computed(() => {
  switch (userRole.value) {
    case 'SELLER':
      return 'My Products'
    case 'ADMIN':
      return 'All Products'
    default:
      return 'Products'
  }
})

const showInventory = computed(() => {
  return userRole.value !== 'CUSTOMER'
})

// Methods for cart
const getAddToCartButtonText = (product) => {
  const cartItem = store.state.cart.cartItems.find(item => item.cartItemId === product.id)
  if (!product.availableStock) return 'Out of Stock'
  return cartItem ? `In Cart (${cartItem.goodsCount})` : 'Add to Cart'
}

const showAddToCartModal = (product) => {
  selectedProduct.value = product
  quantity.value = 1
  showCartModal.value = true
}

const closeCartModal = () => {
  showCartModal.value = false
  selectedProduct.value = null
  quantity.value = 1
}

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

const increaseQuantity = () => {
  if (selectedProduct.value && quantity.value < selectedProduct.value.availableStock) {
    quantity.value++
  }
}

const confirmAddToCart = async () => {
  if (!selectedProduct.value) return;
  
  try {
    const cartItem = {
      cartItemId: selectedProduct.value.id,
      goodsName: selectedProduct.value.name,
      goodsCount: quantity.value,
      sellingPrice: selectedProduct.value.price,
      goodsCoverImg: selectedProduct.value.imageUrl
    };

    // 使用 addToCartApi 添加到购物车
    await addToCartApi(cartItem);
    
    // 更新 Vuex store 中的购物车数据
    await store.dispatch('cart/fetchCartItems');
    
    closeCartModal();
  } catch (error) {
    console.error('Failed to add to cart:', error);
    alert(error.message || 'Failed to add item to cart');
  }
};

// Methods for product management
const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token');
    const productData = { ...productForm.value };
    
    // 检查权限
    const hasPermission = await permissionService.checkPermission(
      '/api/products',
      editingProduct.value ? 'PUT' : 'POST'
    );
    
    if (!hasPermission) {
      throw new Error('You do not have permission to perform this action');
    }

    if (editingProduct.value) {
      await updateProduct(token, editingProduct.value.id, productData);
      // 同时更新库存
      if (productData.initialStock !== undefined) {
        await updateInventory(token, editingProduct.value.id, productData.initialStock);
      }
    } else {
      const newProduct = await createProduct(token, productData);
      // 设置初始库存
      await updateInventory(token, newProduct.id, productData.initialStock || 0);
    }
    
    closeModal();
    await loadProducts();
  } catch (error) {
    console.error('Failed to save product:', error);
    alert(error.message || 'Failed to save product');
  }
};

const editProduct = (product) => {
  editingProduct.value = product
  productForm.value = { ...product }
  showAddProduct.value = true
}

const closeModal = () => {
  showAddProduct.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    description: '',
    price: '',
    category: '',
    initialStock: 0,
    imageUrl: '/api/placeholder/400/320'
  }
}

// Methods for inventory management
const manageInventory = async (product) => {
  try {
    editingProduct.value = product
    const token = localStorage.getItem('token')
    const stock = await getInventory(token, product.id)
    currentInventory.value = stock
    newStockLevel.value = stock
    showInventoryModal.value = true
  } catch (error) {
    console.error('Failed to get inventory:', error)
    alert('Failed to get inventory: ' + error.message)
  }
}

const updateStockLevel = async () => {
  try {
    if (newStockLevel.value < 0) {
      throw new Error('Stock level cannot be negative')
    }

    const token = localStorage.getItem('token')
    await updateInventory(token, editingProduct.value.id, newStockLevel.value)
    await loadProducts()
    closeInventoryModal()
  } catch (error) {
    console.error('Failed to update inventory:', error)
    alert('Failed to update inventory: ' + error.message)
  }
}

const closeInventoryModal = () => {
  showInventoryModal.value = false
  editingProduct.value = null
  currentInventory.value = 0
  newStockLevel.value = 0
}

// Methods for product deletion
const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteConfirm.value = true
}

const deleteProduct = async () => {
  if (!productToDelete.value) return
  
  try {
    const token = localStorage.getItem('token')
    await deleteProductApi(token, productToDelete.value.id)
    await loadProducts()
    showDeleteConfirm.value = false
    productToDelete.value = null
  } catch (error) {
    console.error('Failed to delete product:', error)
    alert('Failed to delete product: ' + error.message)
  }
}

// Load products
const loadProducts = async () => {
  try {
    loading.value = true
    let result

    if (isSeller.value) {
      result = await getProductsByMerchant(localStorage.getItem('token'))
    } else {
      result = await getAllProducts()
    }
    
    // 加载每个产品的库存信息
    const productsWithStock = await Promise.all(
      result.map(async product => {
        const stock = await getInventory(
          localStorage.getItem('token'), 
          product.id
        );
        return {
          ...product,
          availableStock: stock
        };
      })
    );
    
    products.value = productsWithStock;
  } catch (error) {
    console.error('Failed to load products:', error);
    error.value = error.message || 'Failed to load products';
  } finally {
    loading.value = false;
  }
};

// Initialize
onMounted(async () => {
  await store.dispatch('cart/fetchCartItems')
  await loadProducts()
})
</script>
<style scoped>
.product-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 1.2em;
  color: #333;
}

.description {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category {
  color: #888;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.price {
  color: #1baeae;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
}

.stock {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

/* Buttons */
.primary-btn {
  background: #1baeae;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-btn:hover {
  background: #158f8f;
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.secondary-btn {
  background: #fff;
  color: #1baeae;
  border: 1px solid #1baeae;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: #f0f9f9;
}

.danger-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.danger-btn:hover {
  background: #cc0000;
}

/* Modal */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
}

/* Forms */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Inventory Management */
.inventory-form {
  padding: 20px;
}

.current-stock {
  font-size: 1.1em;
  margin-bottom: 15px;
  color: #333;
}

/* Confirmation Dialog */
.confirmation {
  text-align: center;
  padding: 20px;
}

.confirmation p {
  margin: 15px 0;
  color: #666;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

/* Loading & Empty States */
.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .modal-content {
    min-width: 90%;
    margin: 20px;
  }

  .product-image img {
    height: 150px;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  .quantity-control {
    margin: 20px 0;
  }

.quantity-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-input input {
  width: 60px;
  text-align: center;
  padding: 5px;
}

.quantity-input button {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.quantity-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.product-title {
  cursor: pointer;
  transition: color 0.3s ease;
}

.product-title:hover {
  color: #1baeae;
}

.product-image {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.product-image:hover {
  opacity: 0.8;
}

}
</style>