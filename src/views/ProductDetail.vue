<!-- src/views/ProductDetail.vue -->
<template>
  <div class="product-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      {{ error }}
      <button @click="loadProduct" class="retry-btn">Retry</button>
    </div>

    <!-- Product Content -->
    <div v-if="product && !loading" class="product-container">
      <!-- Left Section - Product Images -->
      <div class="product-images">
        <div class="main-image">
          <img :src="product.imageUrl" :alt="product.name">
        </div>
        <div v-if="product.productImages?.length" class="image-thumbnails">
          <div 
            v-for="image in product.productImages" 
            :key="image.imageUrl"
            class="thumbnail"
            @click="product.imageUrl = image.imageUrl"
          >
            <img :src="image.imageUrl" :alt="product.name">
          </div>
        </div>
      </div>

      <!-- Right Section - Product Info -->
      <div class="product-info">
        <div class="product-header">
          <h1>{{ product.name }}</h1>
          <div class="category">
            Category: 
            <router-link :to="`/api/products?category=${product.categoryId}`">
              {{ categoryName }}
            </router-link>
          </div>
        </div>

        <div class="price-section">
          <div class="current-price">¥{{ product.price.toFixed(2) }}</div>
        </div>

        <!-- 只在卖家/管理员角色下显示库存信息 -->
        <div class="stock-status">
          <span :class="stockStatusClass">
            {{ stockStatusText }}
          </span>
        </div>

        <!-- 用户角色只需要显示是否有货即可 -->
        <div class="stock-status">
          <span :class="product.availableStock > 0 ? 'in-stock' : 'out-of-stock'">
            {{ product.availableStock > 0 ? `In Stock (${product.availableStock})` : 'Out of Stock' }}
          </span>
        </div>

            <!-- 商品管理相关功能只对卖家和管理员显示 -->
        <div v-if="['SELLER', 'ADMIN'].includes(userRole)" class="management-actions">
          <!-- 库存管理等功能 -->
        </div>

        <div class="description-section">
          <h3>Product Description</h3>
          <p>{{ product.description }}</p>
        </div>

        <!-- Specifications -->
        <div v-if="product?.specifications" class="specifications">
          <h3>Specifications</h3>
          <ul>
            <li v-for="spec in formattedSpecifications" :key="spec.label">
              <span class="spec-label">{{ spec.label }}:</span>
              <span class="spec-value">{{ spec.value }}</span>
            </li>
          </ul>
        </div>

        <!-- Add to Cart Section (Only for CUSTOMER role) -->
        <div v-if="userRole === 'CUSTOMER'" class="cart-actions">
          <div class="quantity-control">
            <button 
              @click="decreaseQuantity" 
              :disabled="quantity <= 1 || !product.availableStock"
            >-</button>
            <input 
              type="number" 
              v-model.number="quantity"
              min="1"
              :max="product.availableStock"
              :disabled="!product.availableStock"
            >
            <button 
              @click="increaseQuantity"
              :disabled="quantity >= product.availableStock || !product.availableStock"
            >+</button>
          </div>

          <button 
            @click="handleAddToCart"
            class="add-to-cart-btn"
            :disabled="!product?.availableStock"
          >
            {{ addToCartButtonText }}
          </button>
        </div>

        <!-- Seller Info (if available) -->
        <div v-if="product.createUser" class="seller-info">
          <h3>Seller Information</h3>
          <p>Sold by: {{ product.createUser }}</p>
          <p>Listed on: {{ formatDate(product.createDatetime) }}</p>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div v-if="relatedProducts.length" class="related-products-section">
      <h2>Related Products</h2>
      <div class="related-products-grid">
        <div 
          v-for="relatedProduct in relatedProducts" 
          :key="relatedProduct.productId"
          class="related-product-card"
          @click="navigateToProduct(relatedProduct.productId)"
        >
          <img :src="relatedProduct.imageUrl" :alt="relatedProduct.name">
          <div class="related-product-info">
            <h3>{{ relatedProduct.name }}</h3>
            <p class="price">¥{{ relatedProduct.price.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Cart Success Modal -->
    <div v-if="showSuccessModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Added to Cart</h3>
          <button @click="showSuccessModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Product has been added to your cart successfully!</p>
          <div class="modal-actions">
            <button @click="continueShoppingHandler" class="secondary-btn">
              Continue Shopping
            </button>
            <button @click="goToCart" class="primary-btn">
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useStore } from 'vuex';
  import { addToCart as addToCartService } from '@/service/cart';
  import { useAuth } from '@/composables/useAuth';
  import { checkStock } from '@/service/inventory';
  import { 
  getProductById,  // 确保导入这个方法
  getAllProducts 
} from '@/service/product';
import { getInventory } from '@/service/inventory';

  const store = useStore();
  const { user } = useAuth();

  const route = useRoute();
  const router = useRouter();
  const product = ref(null);
  const loading = ref(true);
  const quantity = ref(1);
  const relatedProducts = ref([]);
  const categoryName = ref('');
  const error = ref(null);
  const showSuccessModal = ref(false);
  
  const { userRole } = useAuth()

  const hasRelatedProducts = computed(() => {
    return relatedProducts.value && relatedProducts.value.length > 0;
  });

  const formatSpecKey = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const stockStatusClass = computed(() => {
    if (!product.value?.availableStock) return 'out-of-stock';
    if (product.value.availableStock < 10) return 'low-stock';
    return 'in-stock';
  });

  const stockStatusText = computed(() => {
    if (!product.value?.availableStock) return 'Out of Stock';
    if (product.value.availableStock < 10) 
      return `Low Stock (${product.value.availableStock} left)`;
    return `In Stock (${product.value.availableStock} available)`;
  });
    
  const loadProductDetails = async () => {
    try {
      loading.value = true;
      const productId = parseInt(route.params.id);
      
      // 加载商品信息
      const [productData, stock] = await Promise.all([
        getProductById(productId),
        getInventory(authToken, productId)
      ]);

      if (productResponse?.success && productResponse?.data) {
        product.value = {
          ...productResponse.data,
          availableStock: stock || 0  // 合并库存信息
        };
      } else {
        throw new Error('Failed to load product details');
      }

      product.value = {
        ...productData,
        availableStock: stock
      };

      // 加载分类信息
      if (product.value.categoryId) {
        const categoryResponse = await pageQuery({
          page: 1,
          pageSize: 1,
          categoryId: product.value.categoryId
        });
        
        if (categoryResponse.records.length > 0) {
          categoryName.value = categoryResponse.records[0].categoryName;
          
          // 加载相关产品
          const relatedResponse = await pageQuery({
            page: 1,
            pageSize: 4,
            categoryId: product.value.categoryId,
            excludeProductId: productId
          });
          
          relatedProducts.value = relatedResponse.records;
        }
      }
    } catch (error) {
      console.error('Failed to load product details:', error);
      error.value = error.message;
    } finally {
      loading.value = false;
    }
  };

  const addToCartButtonText = computed(() => {
    if (!product.value?.availableStock) return 'Out of Stock';
    const quantity = cartQuantity.value;
    return quantity > 0 ? `In Cart (${quantity})` : 'Add to Cart';
  });

  const formatKey = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedSpecifications = computed(() => {
    if (!product.value?.specifications) return [];
    
    return Object.entries(product.value.specifications).map(([key, value]) => ({
      label: formatSpecKey(key),
      value: formatValue(value)
    }));
  });
  
  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  const loadProduct = async () => {
    try {
      loading.value = true;
      error.value = null;
      const productId = parseInt(route.params.id);
      
      // 使用 consumer API 获取商品信息(包含库存)
      const response = await getProductById(productId);
      
      if (response.success && response.data) {
        product.value = response.data;

        // 加载相关商品
        if (product.value.categoryId) {
          const relatedResponse = await getAllProducts({
            page: 1,
            pageSize: 4,
            categoryId: product.value.categoryId,
            excludeProductId: productId
          });
          
          if (relatedResponse.success && relatedResponse.data) {
            relatedProducts.value = relatedResponse.data.records.filter(
              p => p.productId !== productId
            );
          }
        }
      } else {
        throw new Error('Failed to load product details');
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity.value > 1) {
      quantity.value--;
    }
  };
  
  const increaseQuantity = () => {
    if (product.value && quantity.value < product.value.availableStock) {
      quantity.value++;
    }
  };

  const goToCart = () => {
    router.push('/api/cart');
  };

  const continueShoppingHandler = () => {
    router.push('/api/products');
  };

  const addToCart = async (product) => {
    if (!product) return;
    
    try {
      const cartItem = {
        productId: product.productId,
        quantity: 1,  // 默认数量为1
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl,
        isSelected: true,
      };

      await store.dispatch('cart/addToCart', cartItem);
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleAddToCart = async () => {
    if (!product.value?.availableStock) return;
    
    try {
      // 直接使用 API 返回的库存信息进行检查
      if (quantity.value > product.value.availableStock) {
        throw new Error('Insufficient stock');
      }

      const currentUser = user.value || JSON.parse(localStorage.getItem('user')) || {};

      const cartItem = {
        productId: product.value.productId,
        quantity: quantity.value,
        price: product.value.price,
        name: product.value.name,
        imageUrl: product.value.imageUrl,
        isSelected: true,
        createUser: currentUser.username || 'system',
        updateUser: currentUser.username || 'system',
        availableStock: product.value.availableStock // 添加库存信息
      };

      await store.dispatch('cart/addToCart', cartItem);
      showSuccessModal.value = true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error.message || 'Failed to add to cart');
    }
  };

  const closeModal = () => {
    showSuccessModal.value = false;
  };
  
  // 监听路由参数变化，重新加载商品信息
  watch(() => route.params.id, (newId) => {
    if (newId) {
      loadProduct();
    }
  });

  watch(() => product.value, (newProduct) => {
    if (newProduct?.productId) {
      const existingQuantity = store.getters['cart/getCartItemQuantity'](newProduct.productId);
      if (existingQuantity > 0) {
        quantity.value = existingQuantity;
      }
    }
  }, { immediate: true });
  
  // 初始化
  onMounted(() => {
    loadProduct();
  });
  </script>
  
  <style scoped>
  .product-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .product-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 20px;
  }
  
  .product-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  .product-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .price {
    font-size: 2em;
    color: #1baeae;
    font-weight: bold;
  }
  
  .category {
    color: #666;
    font-size: 1.1em;
  }
  
  .stock-status {
    padding: 8px 16px;
    border-radius: 4px;
    background: #e8f5e9;
    color: #2e7d32;
    display: inline-block;
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
  
  .cart-actions {
    display: flex;
    gap: 20px;
    align-items: center;
    margin: 20px 0;
  }
  
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .quantity-control button {
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .quantity-control button:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
  
  .quantity-control span {
    min-width: 40px;
    text-align: center;
  }
  
  .add-to-cart-btn {
    flex: 1;
    padding: 12px 24px;
    background: #1baeae;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1em;
  }
  
  .add-to-cart-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .description, .specifications, .features {
    margin-top: 30px;
  }
  
  .description h2, .specifications h2, .features h2 {
    margin-bottom: 15px;
    color: #333;
  }
  
  .specifications ul, .features ul {
    list-style: none;
    padding: 0;
  }
  
  .specifications li, .features li {
    margin-bottom: 10px;
    color: #666;
  }

  .category-link {
  color: #1baeae;
  text-decoration: none;
}

.related-products {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}
  
@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }
  
  .cart-actions {
    flex-direction: column;
  }
  
  .add-to-cart-btn {
    width: 100%;
  }
}

.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.specifications {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.specifications h3 {
  margin-bottom: 16px;
  color: #333;
}

.specifications ul {
  list-style: none;
  padding: 0;
}

.specifications li {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.spec-label {
  font-weight: 600;
  min-width: 150px;
  color: #666;
}

.spec-value {
  color: #333;
  flex: 1;
}

</style>