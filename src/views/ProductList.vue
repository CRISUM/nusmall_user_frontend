// src/views/ProductList.vue
<!-- src/views/ProductList.vue -->
<template>

  <ProductForm
    v-if="showProductForm"
    :product="selectedProduct"
    @close="showProductForm = false"
    @saved="loadProducts"
  />

  <div v-if="showCartModal" class="modal">
    <div class="modal-content">
      <h3>Add to Cart</h3>
      <div class="product-info">
        <h4>{{ selectedProduct?.name }}</h4>
        <p>Price: ¥{{ formatPrice(selectedProduct?.price) }}</p>
      </div>
      
      <div class="quantity-control">
        <button 
          @click="quantity > 1 && quantity--"
          :disabled="quantity <= 1"
        >-</button>
        <input 
          type="number" 
          v-model.number="quantity"
          min="1"
          :max="selectedProduct?.availableStock"
        >
        <button 
          @click="quantity < selectedProduct?.availableStock && quantity++"
          :disabled="quantity >= selectedProduct?.availableStock"
        >+</button>
      </div>
      
      <div class="modal-actions">
        <button class="secondary-btn" @click="closeCartModal">Cancel</button>
        <button 
          class="primary-btn" 
          @click="confirmAddToCart"
          :disabled="!quantity || quantity > selectedProduct?.availableStock"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>

  <div class="product-list">
    <!-- Page Header 保持不变 -->
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
      <!-- Add Product Button (Seller/Admin only) -->
      <div v-if="userRole !== 'CUSTOMER'" class="header-actions">
        <button class="primary-btn" @click="addNewProduct">
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
          :placeholder="userRole === 'SELLER' ? 'Search by name...' : 'Search by name or description...'"
          @input="handleSearch"
        />
        
        <select 
          v-model="selectedCategory"
          @change="handleCategoryChange"
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
        <button @click="addNewProduct" class="primary-btn">
          Add Your First Product
        </button>
      </div>
    </div>

    <!-- Products Grid - 修改这部分 -->
    <div v-else class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.productId" 
        class="product-card"
      >
        <!-- Product Image -->
        <div class="product-image" @click="goToDetail(product.productId)">
          <img 
            :src="product.productImages?.[0]?.imageUrl || '/api/placeholder/400/320'" 
            :alt="product.name"
          >
          <!-- 使用API返回的库存信息
          <div v-if="!product.availableStock" class="out-of-stock-overlay">
            Out of Stock
          </div> -->
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h3 @click="goToDetail(product.productId)" class="product-title">
            {{ product.name }}
          </h3>
          <p class="description">{{ product.description }}</p>
          <p class="category">
            Category: 
            <span @click="filterByCategory(product.categoryId)">
              {{ product.categoryName }}
            </span>
          </p>
          <p class="price">¥{{ formatPrice(product.price) }}</p>

          <!-- 库存状态显示 -->
          <div class="stock-status" :class="getStockStatusClass(product)">
            {{ getStockStatusText(product) }}
          </div>

          <!-- Actions -->
          <div class="product-actions">
            <!-- Customer Actions -->
            <div v-if="userRole === 'CUSTOMER'" class="customer-actions">
              <button 
                @click="handleAddToCart(product)"
                :disabled="!product.availableStock"
                class="add-to-cart-btn"
              >
                {{ product.availableStock > 0 ? 'Add to Cart' : 'Out of Stock' }}
              </button>
            </div>

            <!-- Seller/Admin Actions -->
            <div v-if="['SELLER', 'ADMIN'].includes(userRole)" class="management-actions">
              <button 
                class="edit-btn" 
                @click="editProduct(product)"
                title="Edit product"
                style="background-color: #1baeae; color: white;"
              >
                Edit
              </button>
              <button 
                class="delete-btn"
                @click="deleteProduct(product)"
                title="Delete product"
                style="background-color: #ff4d4f; color: white;"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页部分保持不变 -->
    <div v-if="total > 0" class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ Math.ceil(total / pageSize) }}
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage >= Math.ceil(total / pageSize)"
        class="page-btn"
      >
        Next
      </button>
    </div>

    <!-- Modals 保持不变 -->
    <!-- ... 其他模态框代码 ... -->
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ProductForm from '@/components/product/ProductForm.vue';
import { useAuth } from '@/composables/useAuth'
import { 
  getAllProducts,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
  uploadImage,
} from '@/service/product';

import { getInventory, updateInventory } from '@/service/inventory';
import { checkStock } from '@/service/inventory';
import { permissionService } from '@/service/permission' 
import { pageQuery } from '@/service/category';
import { getCategoryName } from '@/utils/mockService';
import { useStore } from 'vuex';
import { addToCart as addToCartService } from '@/service/cart';
import { showMessage } from '@/utils/message';

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
const showInventoryModal = ref(false)
const showDeleteConfirm = ref(false)
const editingProduct = ref(null)
const currentInventory = ref(0)
const newStockLevel = ref(0)
const productToDelete = ref(null)
const showCartModal = ref(false)
const showProductForm = ref(false);
const selectedProduct = ref(null);
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
const showAddModal = ref(false);
const productForm = ref({
  name: '',
  description: '',
  price: '',
  categoryId: '',
  initialStock: 0,
  imageUrl: '/api/placeholder/400/320'
});

// const productForm = ref({
//   name: '',
//   description: '',
//   price: '',
//   categoryId: '', 
//   availableStock: 0,
//   imageUrls: [], 
//   createUser: '',
//   updateUser: ''
// });

const showAddProductModal = ref(false);

const addNewProduct = () => {
  selectedProduct.value = null;
  showProductForm.value = true;
};


// 在 script setup 中修改 handleAddToCart 方法
const handleAddToCart = (product) => {
  selectedProduct.value = product;
  quantity.value = 1;
  showCartModal.value = true;
};

const handleSubmitProduct = async () => {
  try {
    const token = localStorage.getItem('token');
    await createProduct(token, productForm.value);
    showMessage('Product created successfully', 'success');
    showAddProductModal.value = false;
    await loadProducts();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

// 添加确认加入购物车的方法
const confirmAddToCart = async () => {
  if (!selectedProduct.value) return;
  
  try {
    const cartItem = {
      productId: selectedProduct.value.productId,
      quantity: quantity.value,
      price: selectedProduct.value.price,
      name: selectedProduct.value.name,
      productName: selectedProduct.value.name,
      imageUrl: selectedProduct.value.imageUrl || selectedProduct.value.productImages?.[0]?.imageUrl || '/api/placeholder/400/320',
      isSelected: true
    };

    // 直接调用添加到购物车的action，后端会处理库存检查
    await store.dispatch('cart/addToCart', cartItem);
    
    showMessage('Added to cart successfully', 'success');
    closeCartModal();
    
    // 可选：刷新商品列表以获取最新状态
    await loadProducts();
  } catch (error) {
    console.error('Failed to add to cart:', error);
    showMessage(error.message || 'Failed to add to cart', 'error');
  }
};

const closeCartModal = () => {
  showCartModal.value = false;
  selectedProduct.value = null;
  quantity.value = 1;
};

const showAddProduct = ref(false);  

const validateForm = () => {
  if (!productForm.value.categoryId) {
    showMessage('Please select a category', 'error');
    return false;
  }
  return true;
};

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

const getStockStatusClass = (product) => {
  if (!product.availableStock) return 'out-of-stock';
  if (product.availableStock < 10) return 'low-stock';
  return 'in-stock';
};

const getStockStatusText = (product) => {
  if (!product.availableStock) return 'Out of Stock';
  if (product.availableStock < 10) return `Low Stock (${product.availableStock} left)`;
  return `In Stock (${product.availableStock})`;
};

const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

const editProduct = (product) => {
  selectedProduct.value = product;
  showProductForm.value = true;
};

const deleteProduct = async (product) => {
  try {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const token = localStorage.getItem('token');
    await deleteProductApi(token, product.productId);
    showMessage('Product deleted successfully', 'success');
    await loadProducts();
  } catch (error) {
    console.error('Failed to delete product:', error);
    showMessage(error.message || 'Failed to delete product', 'error');
  }
};

// 确保 closeModal 方法存在并正确实现
const closeModal = () => {
  showAddProduct.value = false;
  showAddModal.value = false;
  editingProduct.value = null;
  productForm.value = {
    name: '',
    description: '',
    price: '',
    categoryId: '',
    initialStock: 0,
    imageUrl: '/api/placeholder/400/320'
  };
  error.value = null;
};

const handleModalClick = (event) => {
  // 只有点击遮罩层才关闭
  if (event.target.classList.contains('modal')) {
    closeModal();
  }
};

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

const updateStock = async (product) => {
  try {
    const token = localStorage.getItem('token');
    await updateInventory(token, product.productId, product.availableStock);
    showMessage('Stock updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update stock:', error);
    showMessage(error.message, 'error');
  }
};

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
    error.value = null;

    // 构造查询参数
    const queryParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchQuery.value || undefined,
      categoryId: selectedCategory.value || undefined
    };

    const response = await getAllProducts(queryParams);
    
    // 检查响应格式
    if (response?.success && response?.data) {
      products.value = response.data.records.map(product => ({
        ...product,
        productId: product.productId || product.id,
        imageUrl: product.imageUrl || product.productImages?.[0]?.imageUrl || '/api/placeholder/400/320'
      }));
      total.value = response.data.total;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    error.value = err.message;
  } finally {
    loading.value = false;  // 确保loading状态被重置
  }
};

// 加载分类
const loadCategories = async () => {
  try {
    const response = await pageQuery({
      page: 1,
      pageSize: 100  // 获取所有分类
    });
    
    if (response?.records) {
      categories.value = response.records;
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

// 处理分类变化
const handleCategoryChange = () => {
  currentPage.value = 1; // 重置页码
  loadProducts();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置页码
  loadProducts();
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
  loadProducts();
};

// 初始化
onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories()]);
});

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
  max-width: 500px;
  width: 90%;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.primary-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
}

.primary-btn {
  background: #1baeae;
  color: white;
  border: none;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  color: #666;
  transition: color 0.3s;
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
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.quantity-control button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control input {
  width: 60px;
  text-align: center;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.quantity-control button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
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

.stock-status {
  padding: 4px 8px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 0.9em;
}

.out-of-stock {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.low-stock {
  background-color: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.in-stock {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.management-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.edit-btn:hover, .delete-btn:hover {
  opacity: 0.8;
}

}
</style>