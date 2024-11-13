<!-- src/components/product/ProductForm.vue -->
<template>
    <div class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h2>
        
        <form @submit.prevent="handleSubmit" class="product-form">
          <!-- Basic Information -->
          <div class="form-section">
            <div class="form-group">
              <label>Product Name</label>
              <input 
                v-model="formData.name"
                type="text"
                required
                placeholder="Enter product name"
              >
            </div>
  
            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="formData.description"
                required
                placeholder="Enter product description"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>Price</label>
              <input 
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                step="0.01"
              >
            </div>
  
            <div class="form-group">
                <label>Category</label>
                <div class="category-input">
                    <select 
                    v-model="formData.categoryId"
                    v-if="!isAddingCategory"
                    required
                    >
                        <option value="">Select category</option>
                        <!-- 使用特殊值标识添加新分类的选项 -->
                        <option value="new">+ Add New Category</option>
                        <option 
                            v-for="category in categories" 
                            :key="category.categoryId"
                            :value="category.categoryId"
                        >
                            {{ category.categoryName }}
                        </option>
                    </select>
                    
                    <!-- 新增分类的输入框 -->
                    <div v-else class="new-category-input">
                    <input 
                        v-model="newCategoryName"
                        type="text"
                        placeholder="Enter new category name"
                        @keyup.enter="saveNewCategory"
                    >
                    <div class="category-actions">
                        <button 
                        type="button"
                        class="cancel-btn"
                        @click="cancelAddCategory"
                        >
                        Cancel
                        </button>
                        <button 
                        type="button"
                        class="save-btn"
                        @click="saveNewCategory"
                        :disabled="!newCategoryName.trim()"
                        >
                        Save
                        </button>
                    </div>
                    </div>
                </div>
                </div>
  
            <div class="form-group">
              <label>Stock</label>
              <input 
                v-model.number="formData.availableStock"
                type="number"
                required
                min="0"
              >
            </div>
          </div>
  
          <!-- Image Upload - For future implementation -->
          <div class="form-section">
            <div class="form-group">
              <label>Image URL</label>
              <input 
                v-model="formData.imageUrl"
                type="text"
                placeholder="Enter image URL"
              >
            </div>
          </div>
  
          <!-- Form Actions -->
          <div class="form-actions">
            <button 
              type="button" 
              class="secondary-btn"
              @click="closeModal"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="primary-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { pageQuery as getCategories } from '@/service/category';
  import { 
    createProduct,
    updateProduct,
  } from '@/service/product';
  import { showMessage } from '@/utils/message';
  
  const props = defineProps({
    product: {
      type: Object,
      default: () => null
    },
    show: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close', 'saved']);
  
  // State
  const categories = ref([]);
  const isSubmitting = ref(false);
  const isAddingCategory = ref(false);
  const newCategoryName = ref('');

  // 监听 categoryId 变化
  watch(() => formData.value.categoryId, (newValue) => {
  if (newValue === 'new') {
    // 不要设置 categoryId 为 'new'，而是直接清空
    formData.value.categoryId = '';
    isAddingCategory.value = true;
  }
});

// 新增处理方法
const saveNewCategory = async () => {
  try {
    if (!newCategoryName.value) {
      throw new Error('Category name is required');
    }

    const token = localStorage.getItem('token');
    // 先创建新分类
    const response = await saveCategory(token, {
      categoryName: newCategoryName.value
    });

    if (response.success) {
      showMessage('Category created successfully', 'success');
      
      // 重新加载分类列表
      await loadCategories();
      
      // 找到新创建的分类并设置为当前选中的分类
      const newCategory = categories.value.find(
        c => c.categoryName === newCategoryName.value
      );
      if (newCategory) {
        formData.value.categoryId = newCategory.categoryId;
      }
      
      // 重置状态
      isAddingCategory.value = false;
      newCategoryName.value = '';
    } else {
      throw new Error(response.message || 'Failed to create category');
    }
  } catch (error) {
    console.error('Failed to create category:', error);
    showMessage(error.message || 'Failed to create category', 'error');
  }
};

const cancelAddCategory = () => {
  isAddingCategory.value = false;
  newCategoryName.value = '';
  formData.value.categoryId = '';
};
  
  // Form data with default values
  const formData = ref({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    availableStock: 0,
    imageUrl: '/api/placeholder/400/320',
    // These will be set before submission
    sellerId: null,
    createUser: '',
    updateUser: ''
  });
  
  // Computed
  const isEditing = computed(() => !!props.product);
  
  // Methods
  const loadCategories = async () => {
    try {
      const response = await getCategories({
        page: 1,
        pageSize: 100
      });
      
      if (response?.records) {
        categories.value = response.records;
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      showMessage('Failed to load categories', 'error');
    }
  };
  
  const handleSubmit = async () => {
    try {
        isSubmitting.value = true;

          // 如果未选择分类，使用或创建 N.A. 分类
        if (!formData.value.categoryId) {
        let naCategory = categories.value.find(c => c.categoryName === 'N.A.');
        if (!naCategory) {
            const response = await saveCategory(localStorage.getItem('token'), {
            categoryName: 'N.A.'
            });
            if (response.success && response.data) {
            naCategory = response.data;
            }
        }
        formData.value.categoryId = naCategory?.categoryId;
        }
      
      // Get current user info
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      // Prepare product data
      const productData = {
        ...formData.value,
        sellerId: user.userId,
        createUser: user.username,
        updateUser: user.username,
        productId: props.product?.productId,  // Only included for updates
        createDatetime: new Date().toISOString(),
        updateDatetime: new Date().toISOString()
      };
  
      // Create or update product
      if (isEditing.value) {
        await updateProduct(token, productData);
        showMessage('Product updated successfully', 'success');
      } else {
        await createProduct(token, productData);
        showMessage('Product created successfully', 'success');
      }
      
      emit('saved');
      closeModal();
    } catch (error) {
      console.error('Failed to save product:', error);
      showMessage(error.message || 'Failed to save product', 'error');
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const closeModal = () => {
    emit('close');
  };
  
  // Initialize form if editing
  const initializeForm = () => {
    if (props.product) {
      formData.value = {
        name: props.product.name || '',
        description: props.product.description || '',
        price: props.product.price || 0,
        categoryId: props.product.categoryId || '',
        availableStock: props.product.availableStock || 0,
        imageUrl: props.product.imageUrl || '/api/placeholder/400/320'
      };
    }
  };
  
  // Watch for product changes
  watch(() => props.product, () => {
    if (props.product) {
      initializeForm();
    }
  });
  
  // Initialize
  onMounted(async () => {
    await loadCategories();
    initializeForm();
  });
  </script>
  
  <style scoped>
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
    padding: 24px;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .product-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-section {
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
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
    gap: 12px;
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
  
  .primary-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .secondary-btn {
    background: white;
    border: 1px solid #ddd;
    color: #666;
  }
  </style>