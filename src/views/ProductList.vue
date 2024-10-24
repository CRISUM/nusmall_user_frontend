// src/views/ProductList.vue
<!-- src/views/ProductList.vue -->
<template>
    <div class="product-list">
      <!-- Page Header -->
      <div class="page-header">
        <h2>{{ pageTitle }}</h2>
        <!-- Add Product Button (Seller/Admin only) -->
        <div v-if="userRole !== 'CUSTOMER'" class="header-actions">
          <button class="primary-btn" @click="showAddProduct = true">
            <i class="plus-icon"></i> Add New Product
          </button>
        </div>
      </div>
  
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-filters">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="search-input"
          />
          <select 
            v-model="selectedCategory"
            @change="handleCategoryChange"
            class="category-select"
          >
            <option value="">All Categories</option>
            <option 
              v-for="category in categories" 
              :key="category.categoryId"
              :value="category.categoryId"
            >
              {{ category.categoryName }}
            </option>
          </select>
          <select v-model="sortBy" class="sort-select">
            <option value="newest">Newest First</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
          </select>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="loadProducts" class="retry-btn">Retry</button>
      </div>
  
      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="empty-state">
        <p>No products found</p>
        <div v-if="userRole !== 'CUSTOMER'" class="empty-actions">
          <button @click="showAddProduct = true" class="primary-btn">
            Add Your First Product
          </button>
        </div>
      </div>
  
      <!-- Products Grid -->
      <div v-else class="products-grid">
    <div 
      v-for="product in filteredProducts" 
      :key="product?.productId || Math.random()" 
      class="product-card"
    >
      <!-- Product Image -->
      <div class="product-image" @click="goToDetail(product?.productId)">
        <img :src="product?.imageUrl || '/api/placeholder/400/320'" :alt="product?.name">
        <div v-if="!product?.availableStock" class="out-of-stock-overlay">
          Out of Stock
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h3 @click="goToDetail(product?.productId)" class="product-title">
          {{ product?.name }}
        </h3>
        <p class="description">{{ product?.description }}</p>
        <p class="category">
          Category: 
          <span @click="filterByCategory(product?.categoryId)">
            {{ getCategoryName(product?.categoryId) }}
          </span>
        </p>
        <p class="price">¥{{ product?.price ? Number(product.price).toFixed(2) : 'N/A' }}</p>

        <!-- Stock Level - Add default value -->
        <StockLevel 
          :productId="Number(product?.productId) || 0"
          :showCount="userRole !== 'CUSTOMER'"
        />

        <!-- Actions -->
        <div class="product-actions">
          <!-- Customer Actions -->
          <div v-if="userRole === 'CUSTOMER'" class="customer-actions">
            <button 
              class="add-to-cart-btn" 
              @click="showAddToCartModal(product)"
              :disabled="!product.availableStock"
            >
              {{ getCartButtonText(product) }}
            </button>
          </div>

          <!-- Seller/Admin Actions -->
          <div v-else class="management-actions">
            <button 
              class="edit-btn" 
              @click="editProduct(product)"
              :disabled="!product?.productId"
              title="Edit product"
            >
              <i class="edit-icon"></i>
            </button>
            <button 
              class="manage-stock-btn"
              @click="manageInventory(product)"
              :disabled="!product?.productId"
              title="Manage inventory"
            >
              <i class="inventory-icon"></i>
            </button>
            <button 
              class="delete-btn"
              @click="confirmDelete(product)"
              :disabled="!product?.productId"
              title="Delete product"
            >
              <i class="delete-icon"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
      <!-- Pagination -->
      <div v-if="products.length > 0" class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Next
        </button>
      </div>
  
      <!-- Add/Edit Product Modal -->
      <div v-if="showAddProduct || editingProduct" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="product-form">
            <div class="form-group">
              <label>Product Name *</label>
              <input 
                v-model="productForm.name"
                type="text"
                required
                maxlength="100"
              />
            </div>
  
            <div class="form-group">
              <label>Description *</label>
              <textarea 
                v-model="productForm.description"
                required
                rows="4"
                maxlength="500"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>Category *</label>
              <select v-model="productForm.categoryId" required>
                <option value="">Select Category</option>
                <option 
                  v-for="category in categories"
                  :key="category.categoryId"
                  :value="category.categoryId"
                >
                  {{ category.categoryName }}
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Price (¥) *</label>
              <input 
                v-model.number="productForm.price"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
  
            <div class="form-group">
              <label>Initial Stock *</label>
              <input 
                v-model.number="productForm.initialStock"
                type="number"
                min="0"
                required
              />
            </div>
  
            <div class="form-group">
              <label>Product Images</label>
              <div class="image-upload-area">
                <input 
                  type="file" 
                  @change="handleImageUpload" 
                  multiple 
                  accept="image/*"
                />
                <div class="image-preview">
                  <div 
                    v-for="(url, index) in productForm.imageUrls"
                    :key="index"
                    class="image-preview-item"
                  >
                    <img :src="url" alt="Preview">
                    <button 
                      type="button" 
                      @click="removeImage(index)"
                      class="remove-image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="primary-btn">
                {{ editingProduct ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button @click="closeDeleteModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this product?</p>
            <div class="product-info">
              <p><strong>Name:</strong> {{ productToDelete?.name }}</p>
              <p><strong>Category:</strong> {{ getCategoryName(productToDelete?.categoryId) }}</p>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="cancel-btn">Cancel</button>
            <button @click="deleteProduct" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
  
      <!-- Add to Cart Modal -->
      <div v-if="showCartModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add to Cart</h3>
            <button @click="closeCartModal" class="close-btn">&times;</button>
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
                <button 
                  @click="decreaseQuantity" 
                  :disabled="quantity <= 1"
                >-</button>
                <input 
                  type="number" 
                  v-model.number="quantity"
                  :min="1"
                  :max="selectedProduct?.availableStock"
                >
                <button 
                  @click="increaseQuantity" 
                  :disabled="quantity >= selectedProduct?.availableStock"
                >+</button>
              </div>
            </div>
          </div>
  
          <div class="modal-actions">
            <button @click="closeCartModal" class="cancel-btn">Cancel</button>
            <button @click="confirmAddToCart" class="primary-btn">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserRoles } from '@/constants/authTypes'  
import { useAuth } from '@/composables/useAuth'
import StockLevel from '@/components/StockLevel.vue';
import { 
  getAllProducts,
  getProductsByMerchant,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  getInventory,
  getProductById, 
  updateInventory,
  uploadImage,
} from '@/service/product'
import { checkStock } from '@/service/inventory';
import { permissionService } from '@/service/permission' 
import { pageQuery } from '@/service/category';
import { getCategoryName } from '@/utils/mockService';
import { useStore } from 'vuex';
import { addToCart as addToCartService } from '@/service/cart';

// Auth
const { userRole, isAdmin, isSeller } = useAuth()

// Store
const store = useStore()
const route = useRoute();
const router = useRouter();
const { user } = useAuth();

// State
const relatedProducts = ref([]); // 初始化为空数组
const categoryName = ref('');
const showSuccessModal = ref(false);
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
const categories = ref([]);
const selectedCategory = ref('');
const total = ref(0);
const totalPages = ref(0);  // 总页数
const searchQuery = ref('');  // 用于搜索框的输入
const sortBy = ref('newest');  // 默认排序方式
const error = ref(null);  // 用于错误状态的处理
const currentPage = ref(1);  // 当前页面，默认为第一页
const pageSize = ref(10);  // 每页显示的产品数量
const loadCategories = async () => {
  try {
    const response = await pageQuery({
      page: 1,
      pageSize: 100
    });
    categories.value = response.records;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

const hasRelatedProducts = computed(() => {
  return relatedProducts.value && relatedProducts.value.length > 0;
});

const filteredProducts = computed(() => {
  if (!products.value) return [];
  let result = [...products.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }
  
  if (selectedCategory.value) {
    result = result.filter(product => 
      product.categoryId === parseInt(selectedCategory.value)
    );
  }
  
  return result;
});


const goToDetail = (productId) => {
  if (productId) {
    router.push(`/api/product/${productId}`);
  }
};

const productForm = ref({
  name: '',
  description: '',
  price: '',
  categoryId: '', 
  availableStock: 0,
  imageUrls: [], 
  createUser: '',
  updateUser: ''
});

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
  selectedProduct.value = product;
  // Set initial quantity based on what's already in cart
  const cartQuantity = store.getters['cart/getCartItemQuantity'](product.productId);
  quantity.value = cartQuantity > 0 ? cartQuantity : 1;
  showCartModal.value = true;
};

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
    // Check stock availability
    const stockAvailable = await checkStock(
      selectedProduct.value.productId, 
      quantity.value
    );
    
    if (!stockAvailable) {
      throw new Error('Insufficient stock');
    }

    const currentUser = user.value || JSON.parse(localStorage.getItem('user')) || {};

    const cartItem = {
      productId: selectedProduct.value.productId,
      quantity: quantity.value,
      price: selectedProduct.value.price,
      name: selectedProduct.value.name,
      imageUrl: selectedProduct.value.imageUrl,
      isSelected: true,
      createUser: currentUser.username || 'system',
      updateUser: currentUser.username || 'system'
    };

    await store.dispatch('cart/addToCart', cartItem);
    showCartModal.value = false;
    alert('Added to cart successfully!');
  } catch (error) {
    console.error('Failed to add to cart:', error);
    alert(error.message || 'Failed to add to cart');
  }
};

// Methods for product management
const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // 按后端 DTO 格式构造数据
    Object.keys(productForm.value).forEach(key => {
      if (key === 'imageUrls') {
        productForm.value.imageUrls.forEach(url => {
          formData.append('imageUrls', url);
        });
      } else {
        formData.append(key, productForm.value[key]);
      }
    });

    if (editingProduct.value) {
      await updateProduct(token, formData);
    } else {
      await save(token, formData);
    }
    
    closeModal();
    await loadProducts();
  } catch (error) {
    console.error('Failed to save product:', error);
    alert(error.message);
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

// Add computed property for cart status
const getCartButtonText = computed(() => (product) => {
  const quantity = store.getters['cart/getCartItemQuantity'](product.productId);
  if (!product.availableStock) {
    return 'Out of Stock';
  }
  return quantity > 0 ? `In Cart (${quantity})` : 'Add to Cart';
});

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
  if (!productToDelete.value) return;
  
  try {
    await deleteById(productToDelete.value.id);
    await loadProducts();
    showDeleteConfirm.value = false;
    productToDelete.value = null;
  } catch (error) {
    if (error.message.includes('DeletionNotAllowedException')) {
      alert('Cannot delete product as it is associated with orders');
    } else {
      alert('Failed to delete product: ' + error.message);
    }
  }
};

const handleImageUpload = async (file) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await upload(formData);
    productForm.value.imageUrls.push(response.url);
  } catch (error) {
    console.error('Failed to upload image:', error);
    alert('Failed to upload image');
  }
};

// Load products
const loadProducts = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    let result;

    if (userRole.value === 'SELLER') {
      // For sellers, get their own products
      result = await getProductsByMerchant(token);
    } else {
      // For others (admin/customer), get all products
      result = await getAllProducts();
    }
    
    // Transform data to ensure consistent structure
    if (result && result.records) {
      products.value = result.records.map(product => ({
        ...product,
        productId: product.productId || product.id, // Ensure productId exists
        price: Number(product.price) || 0,
        availableStock: Number(product.availableStock) || 0,
        imageUrl: product.imageUrl || '/api/placeholder/400/320',
        name: product.name || 'Unnamed Product',
        description: product.description || 'No description available'
      }));
      total.value = result.total || products.value.length;
    }
  } catch (error) {
    console.error('Failed to load products:', error);
    error.value = error.message;
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

.category-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

}
</style>