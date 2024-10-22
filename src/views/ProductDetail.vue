<template>
    <div class="product-detail">
      <div v-if="loading" class="loading">
        Loading...
      </div>
      
      <div v-else-if="product" class="product-container">
        <div class="product-image">
          <img :src="product.imageUrl" :alt="product.name">
        </div>
        
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <div class="price">¥{{ product.price }}</div>
          <div class="category">Category: {{ product.category }}</div>
          
          <div class="stock-status" :class="{ 'out-of-stock': !product.availableStock }">
            {{ product.availableStock ? `In Stock (${product.availableStock} available)` : 'Out of Stock' }}
          </div>
          
          <!-- Add to Cart Section -->
          <div v-if="userRole === 'CUSTOMER'" class="cart-actions">
            <div class="quantity-control">
              <button 
                @click="decreaseQuantity" 
                :disabled="quantity <= 1 || !product.availableStock"
              >-</button>
              <span>{{ quantity }}</span>
              <button 
                @click="increaseQuantity"
                :disabled="quantity >= product.availableStock || !product.availableStock"
              >+</button>
            </div>
            
            <button 
              class="add-to-cart-btn"
              @click="addToCart"
              :disabled="!product.availableStock"
            >
              Add to Cart
            </button>
          </div>
          
          <div class="description">
            <h2>Description</h2>
            <p>{{ product.description }}</p>
          </div>
          
          <!-- Specifications -->
          <div v-if="product.specifications" class="specifications">
            <h2>Specifications</h2>
            <ul>
              <li v-for="(value, key) in product.specifications" :key="key">
                <strong>{{ formatKey(key) }}:</strong> {{ formatValue(value) }}
              </li>
            </ul>
          </div>
          
          <!-- Features -->
          <div v-if="product.features" class="features">
            <h2>Key Features</h2>
            <ul>
              <li v-for="feature in product.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div v-else class="error">
        Product not found
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  import { getProductById } from '@/service/product';
  import { addToCart as addToCartApi } from '@/service/cart';
  import { getInventory } from '@/service/product';
  
  const route = useRoute();
  const router = useRouter();
  const store = useStore();
  
  const product = ref(null);
  const loading = ref(true);
  const quantity = ref(1);
  
  const userRole = computed(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || 'CUSTOMER';
  });
  
  const formatKey = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };
  
  const loadProduct = async () => {
  try {
    loading.value = true;
    const productId = parseInt(route.params.id);
    const [productData, stockData] = await Promise.all([
      getProductById(productId),
      getInventory(localStorage.getItem('token'), productId)
    ]);
    
    // 合并商品信息和库存信息
    product.value = {
      ...productData,
      availableStock: stockData
    };
    
    // 重置购买数量为1或0（如果没有库存）
    quantity.value = stockData > 0 ? 1 : 0;
  } catch (error) {
    console.error('Failed to load product:', error);
    alert(error.message || 'Failed to load product');
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
  
  const addToCart = async () => {
  try {
    // 再次检查库存
    const currentStock = await getInventory(
      localStorage.getItem('token'), 
      product.value.id
    );
    
    if (currentStock < quantity.value) {
      throw new Error('Sorry, stock has been updated. Please refresh the page.');
    }

    const cartItem = {
      cartItemId: product.value.id,
      goodsName: product.value.name,
      goodsCount: quantity.value,
      sellingPrice: product.value.price,
      goodsCoverImg: product.value.imageUrl
    };

    await addToCartApi(cartItem);
    await store.dispatch('cart/fetchCartItems');
    
    // 重新加载商品信息以获取最新库存
    await loadProduct();
    
    alert('Added to cart successfully');
    } catch (error) {
        console.error('Failed to add to cart:', error);
        alert(error.message || 'Failed to add to cart');
    }
  };
  
  // 监听路由参数变化，重新加载商品信息
  watch(
    () => route.params.id,
    () => loadProduct()
  );
  
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
  
  .stock-status.out-of-stock {
    background: #ffebee;
    color: #c62828;
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
  </style>