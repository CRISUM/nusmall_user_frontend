// src/utils/mockService.js

const STORAGE_KEY = 'vue_user_management';
const CART_STORAGE_KEY = 'vue_cart_management';
const PRODUCT_STORAGE_KEY = 'vue_product_management';
const INVENTORY_STORAGE_KEY = 'vue_inventory_management';

// Initialize storage with default users including seller
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: [
        { 
          id: 1, 
          username: 'admin', 
          password: 'admin', 
          email: 'admin@example.com', 
          role: 'ADMIN' 
        },
        { 
          id: 2, 
          username: 'user', 
          password: 'user', 
          email: 'user@example.com', 
          role: 'CUSTOMER' 
        },
        { 
          id: 3, 
          username: 'seller', 
          password: 'seller', 
          email: 'seller@example.com', 
          role: 'SELLER' 
        }
      ]
    }));
  }

  if (!localStorage.getItem(PRODUCT_STORAGE_KEY)) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify({
      products: [
        {
          id: 1,
          name: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation, ' +
                      'featuring 30-hour battery life, premium sound quality, and ' +
                      'comfortable over-ear design. Perfect for music lovers and professionals.',
          price: 299.99,
          category: 'Electronics',
          imageUrl: '/api/placeholder/400/320',
          specifications: {
            brand: 'TechSound',
            color: 'Matte Black',
            connectivity: 'Bluetooth 5.0',
            batteryLife: '30 hours',
            weight: '250g'
          },
          features: [
            'Active Noise Cancellation',
            'Touch Controls',
            'Voice Assistant Compatible',
            'Foldable Design',
            'Quick Charge'
          ],
          sellerId: 3  // Assigned to seller
        },
        {
          id: 2,
          name: 'Designer Winter Jacket',
          description: 'Premium winter jacket made with sustainable materials. ' +
                      'Features waterproof exterior, warm inner lining, and ' +
                      'multiple pockets. Stylish design suitable for both casual ' +
                      'and semi-formal occasions.',
          price: 189.99,
          category: 'Clothing',
          imageUrl: '/api/placeholder/400/320',
          specifications: {
            brand: 'EcoStyle',
            material: 'Recycled Polyester',
            waterproof: 'Yes',
            sizes: ['S', 'M', 'L', 'XL'],
            care: 'Machine Washable'
          },
          features: [
            'Water-Resistant Exterior',
            'Thermal Lining',
            'Adjustable Hood',
            'Multiple Pockets',
            'Sustainable Materials'
          ],
          sellerId: 3  // Assigned to seller
        },
        {
          id: 3,
          name: 'Smart Fitness Watch',
          description: 'Advanced fitness tracker with heart rate monitoring, ' +
                      'GPS tracking, and comprehensive health metrics. ' +
                      'Perfect for athletes and fitness enthusiasts.',
          price: 199.99,
          category: 'Electronics',
          imageUrl: '/api/placeholder/400/320',
          specifications: {
            brand: 'FitTech',
            color: 'Space Gray',
            waterproof: 'Yes (5ATM)',
            batteryLife: '7 days',
            display: 'AMOLED'
          },
          features: [
            '24/7 Heart Rate Monitoring',
            'Built-in GPS',
            'Sleep Tracking',
            'Workout Recognition',
            'Smartphone Notifications'
          ],
          sellerId: 3  // Assigned to seller
        }
      ]
    }));
  }

  if (!localStorage.getItem(INVENTORY_STORAGE_KEY)) {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify({
      inventory: [
        { 
          productId: 1, 
          availableStock: 1,  // First product has 1 in stock
          sellerId: 3 
        },
        { 
          productId: 2, 
          availableStock: 50,  // Second product has 50 in stock
          sellerId: 3 
        },
        { 
          productId: 3, 
          availableStock: 0,  // Third product is out of stock
          sellerId: 3 
        }
      ],
      inventoryHistory: [
        {
          productId: 1,
          type: 'INITIAL',
          quantity: 1,
          timestamp: new Date().toISOString(),
          sellerId: 3
        },
        {
          productId: 2,
          type: 'INITIAL',
          quantity: 50,
          timestamp: new Date().toISOString(),
          sellerId: 3
        },
        {
          productId: 3,
          type: 'INITIAL',
          quantity: 0,
          timestamp: new Date().toISOString(),
          sellerId: 3
        }
      ]
    }));
  }
};

// Force reinitialize storage (you can call this in development to reset data)
export const resetMockData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PRODUCT_STORAGE_KEY);
  localStorage.removeItem(INVENTORY_STORAGE_KEY);
  initStorage();
};

// 获取购物车数据
const getCartData = () => {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  return JSON.parse(data || '{"cartItems": []}');
};

// 更新购物车存储
const updateCartData = (data) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
};

// 获取购物车
export const getCart = async () => {
  await delay(300);
  const data = getCartData();
  return data.cartItems;
};

// 添加到购物车
export const addToCart = async (newItem) => {
  await delay(300);
  const data = getCartData();
  const existingItemIndex = data.cartItems.findIndex(
    item => item.cartItemId === newItem.cartItemId
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    data.cartItems[existingItemIndex].goodsCount = newItem.goodsCount;
  } else {
    // Add new item
    data.cartItems.push(newItem);
  }
  
  updateCartData(data);
  return newItem;
};

// 修改购物车
export const modifyCart = async ({ cartItemId, goodsCount }) => {
  await delay(300);
  const data = getCartData();
  const item = data.cartItems.find(item => item.cartItemId === cartItemId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  item.goodsCount = goodsCount;
  updateCartData(data);
  return item;
};

// 删除购物车商品
export const deleteCartItem = async (cartItemId) => {
  await delay(300);
  const data = getCartData();
  data.cartItems = data.cartItems.filter(item => item.cartItemId !== cartItemId);
  updateCartData(data);
  return { message: 'Item deleted successfully' };
};

// 获取存储的数据
const getStorageData = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

// 更新存储的数据
const updateStorageData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟登录
export const login = async (credentials) => {
  await delay(500); // 模拟网络延迟
  const { users } = getStorageData();
  const user = users.find(u => u.username === credentials.username && u.password === credentials.password);
  if (user) {
    return { token: `mock-token-${user.id}`, user: { ...user, password: undefined } };
  } else {
    throw new Error('Invalid credentials');
  }
};

// 模拟注册
export const register = async (userData) => {
  await delay(500);
  const data = getStorageData();
  if (data.users.some(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }
  const newUser = { ...userData, id: data.users.length + 1 };
  data.users.push(newUser);
  updateStorageData(data);
  return { message: 'User registered successfully' };
};

// 获取所有用户
export const getAllUsers = async () => {
  await delay(300);
  const { users } = getStorageData();
  return users.map(u => ({ ...u, password: undefined }));
};

// 根据 ID 获取用户
export const getUserById = async (id) => {
  await delay(300);
  const { users } = getStorageData();
  const user = users.find(u => u.id === parseInt(id));
  if (!user) {
    throw new Error('User not found');
  }
  return { ...user };
};

// 创建用户
export const createUser = async (userData) => {
  await delay(500);
  const data = getStorageData();
  
  // 验证用户名是否存在
  if (data.users.some(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }

  const newUser = {
    ...userData,
    id: Math.max(...data.users.map(u => u.id), 0) + 1
  };

  data.users.push(newUser);
  updateStorageData(data);
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// 更新用户
export const updateUser = async (id, userData) => {
  await delay(500);
  const data = getStorageData();
  const index = data.users.findIndex(u => u.id === parseInt(id));
  
  if (index === -1) {
    throw new Error('User not found');
  }

  // 检查用户名是否与其他用户重复
  if (userData.username && 
      data.users.some(u => u.id !== parseInt(id) && u.username === userData.username)) {
    throw new Error('Username already exists');
  }

  data.users[index] = {
    ...data.users[index],
    ...userData,
    id: parseInt(id)
  };

  updateStorageData(data);
  const { password, ...userWithoutPassword } = data.users[index];
  return userWithoutPassword;
};

// 删除用户
export const deleteUser = async (id) => {
  await delay(500);
  const data = getStorageData();
  const index = data.users.findIndex(u => u.id === parseInt(id));
  if (index !== -1) {
    data.users.splice(index, 1);
    updateStorageData(data);
    return { message: 'User deleted successfully' };
  } else {
    throw new Error('User not found');
  }
};

// 初始化产品和库存数据
// src/utils/mockService.js 中更新初始化产品数据部分

const initProductAndInventory = () => {
  if (!localStorage.getItem(PRODUCT_STORAGE_KEY)) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify({
      products: [
        {
          id: 1,
          name: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation, ' +
                      'featuring 30-hour battery life, premium sound quality, and ' +
                      'comfortable over-ear design. Perfect for music lovers and professionals.',
          price: 299.99,
          category: 'Electronics',
          imageUrl: '/api/placeholder/400/320',
          specifications: {
            brand: 'TechSound',
            color: 'Matte Black',
            connectivity: 'Bluetooth 5.0',
            batteryLife: '30 hours',
            weight: '250g'
          },
          features: [
            'Active Noise Cancellation',
            'Touch Controls',
            'Voice Assistant Compatible',
            'Foldable Design',
            'Quick Charge'
          ],
          sellerId: 1
        },
        {
          id: 2,
          name: 'Designer Winter Jacket',
          description: 'Premium winter jacket made with sustainable materials. ' +
                      'Features waterproof exterior, warm inner lining, and ' +
                      'multiple pockets. Stylish design suitable for both casual ' +
                      'and semi-formal occasions.',
          price: 189.99,
          category: 'Clothing',
          imageUrl: '/api/placeholder/400/320',
          specifications: {
            brand: 'EcoStyle',
            material: 'Recycled Polyester',
            waterproof: 'Yes',
            sizes: ['S', 'M', 'L', 'XL'],
            care: 'Machine Washable'
          },
          features: [
            'Water-Resistant Exterior',
            'Thermal Lining',
            'Adjustable Hood',
            'Multiple Pockets',
            'Sustainable Materials'
          ],
          sellerId: 1
        }
      ]
    }));
  }

  if (!localStorage.getItem(INVENTORY_STORAGE_KEY)) {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify({
      inventory: [
        { productId: 1, availableStock: 100 },
        { productId: 2, availableStock: 50 }
      ]
    }));
  }
};

// 产品相关操作
export const getAllProducts = async () => {
  await delay(300);
  const { products } = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || '{"products": []}');
  const { inventory } = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{"inventory": []}');
  
  return products.map(product => {
    const stockInfo = inventory.find(item => item.productId === product.id);
    return {
      ...product,
      availableStock: stockInfo ? stockInfo.availableStock : 0
    };
  });
};

// Only show products for the seller's own items
export const getProductsByMerchant = async (authToken) => {
  await delay(300);
  const { products } = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY));
  const userData = parseToken(authToken);
  return products.filter(p => p.sellerId === userData.id);
};

// mockService.js
export const createProduct = async (authToken, productData) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || '{"products": []}');
  const userData = parseToken(authToken);
  
  const newProduct = {
    ...productData,
    id: Math.max(...data.products.map(p => p.id), 0) + 1,
    sellerId: userData.id,
    imageUrl: productData.imageUrl || '/api/placeholder/400/320'
  };
  
  data.products.push(newProduct);
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data));
  
  // 同时创建库存记录
  const inventoryData = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{"inventory": []}');
  inventoryData.inventory.push({
    productId: newProduct.id,
    availableStock: productData.initialStock || 0
  });
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventoryData));
  
  return newProduct;
};

export const updateProduct = async (authToken, productId, productData) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY));
  const userData = parseToken(authToken);
  const index = data.products.findIndex(p => p.id === productId && p.sellerId === userData.id);
  if (index === -1) throw new Error('Product not found or unauthorized');
  data.products[index] = { ...data.products[index], ...productData };
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data));
  return data.products[index];
};

export const deleteProduct = async (authToken, productId) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY));
  const userData = parseToken(authToken);
  const index = data.products.findIndex(p => p.id === productId && p.sellerId === userData.id);
  if (index === -1) throw new Error('Product not found or unauthorized');
  data.products.splice(index, 1);
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data));
  return { message: 'Product deleted successfully' };
};

// Add sellerId check for inventory operations
export const getInventory = async (token, productId) => {
  await delay(300);
  const { inventory } = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{"inventory": []}');
  const item = inventory.find(i => i.productId === parseInt(productId));
  
  // Return the actual stock value
  return item ? item.availableStock : 0;
};


export const updateInventory = async (token, productId, availableStock) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{"inventory": []}');
  const index = data.inventory.findIndex(i => i.productId === parseInt(productId));
  
  if (index === -1) {
    data.inventory.push({ productId: parseInt(productId), availableStock });
  } else {
    data.inventory[index].availableStock = availableStock;
  }
  
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
  return { message: 'Inventory updated successfully' };
};

export const checkStock = async (productId, quantity) => {
  await delay(300);
  const { inventory } = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{"inventory": []}');
  const item = inventory.find(i => i.productId === parseInt(productId));
  return item ? item.availableStock >= quantity : false;
};

const parseToken = (token) => {
  if (!token) return null;
  // Extract user ID from token
  const id = parseInt(token.split('-')[2]);
  // Get user data from storage
  const { users } = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"users": []}');
  const user = users.find(u => u.id === id);
  return user ? { id, role: user.role } : null;
};

// 检查产品数据
const checkProductData = () => {
  const productData = localStorage.getItem(PRODUCT_STORAGE_KEY);
  if (!productData) {
    console.log('No product data found, initializing...');
    initProductAndInventory();
  } else {
    console.log('Existing product data:', JSON.parse(productData));
  }
};


// 获取单个产品详情
export const getProductById = async (id) => {
  await delay(300);
  const { products } = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY));
  const product = products.find(p => p.id === parseInt(id));
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

// 上传图片
export const uploadImage = async (token, file) => {
  await delay(500);
  // 模拟上传图片，返回一个模拟的URL
  return {
    data: {
      url: `/api/placeholder/${Math.random().toString(36).substring(7)}`
    }
  };
};

// 初始化库存数据
const initInventoryData = () => {
  if (!localStorage.getItem(INVENTORY_STORAGE_KEY)) {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify({
      inventory: [
        { productId: 1, availableStock: 100 },
        { productId: 2, availableStock: 50 }
      ],
      inventoryHistory: []
    }));
  }
};

// 获取库存历史
export const getInventoryHistory = async (productId) => {
  await delay(300);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY));
  return data.inventoryHistory.filter(record => record.productId === productId);
};

// 批量更新库存
export const batchUpdateInventory = async (updates) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY));
  
  updates.forEach(update => {
    const index = data.inventory.findIndex(item => item.productId === update.productId);
    if (index !== -1) {
      data.inventory[index].availableStock = update.quantity;
    } else {
      data.inventory.push({
        productId: update.productId,
        availableStock: update.quantity
      });
    }
    
    // 添加历史记录
    data.inventoryHistory.push({
      productId: update.productId,
      quantity: update.quantity,
      type: update.type || 'ADJUSTMENT',
      timestamp: new Date().toISOString()
    });
  });
  
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
  return { message: 'Inventory updated successfully' };
};

// 获取低库存警报
export const getLowStockAlerts = async (threshold = 10) => {
  await delay(300);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY));
  return data.inventory.filter(item => item.availableStock <= threshold);
};

export const checkout = async (cartData) => {
  await delay(500);
  try {
    // Validate stock for all items
    for (const item of cartData.items) {
      const stockAvailable = await checkStock(item.cartItemId, item.goodsCount);
      if (!stockAvailable) {
        throw new Error(`Insufficient stock for ${item.goodsName}`);
      }
    }

    // Create mock order
    const orderId = Math.floor(Math.random() * 1000000);
    
    // Clear the cart
    await clearCart();
    
    // Return successful checkout response
    return {
      success: true,
      message: 'Checkout successful',
      data: {
        orderId,
        items: cartData.items,
        total: cartData.total,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error(`Checkout failed: ${error.message}`);
  }
};

export const clearCart = async () => {
  await delay(300);
  const data = getCartData();
  data.cartItems = [];
  updateCartData(data);
  return { message: 'Cart cleared successfully' };
};

// User related mock functions
export const getCurrentUserInfo = async () => {
  await delay(300);
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const userData = JSON.parse(localStorage.getItem('user'));
  if (!userData) {
    throw new Error('User data not found');
  }

  return {
    success: true,
    message: 'User info retrieved successfully',
    data: userData
  };
};

export const validateToken = async (token) => {
  await delay(300);
  // Simple token validation for mock service
  const isValid = token && token.startsWith('mock-token-');
  
  return {
    success: isValid,
    message: isValid ? 'Token is valid' : 'Invalid token',
    data: isValid
  };
};

// 确保初始化执行
initInventoryData();

// 初始化存储
initStorage();

// 初始化存储
initProductAndInventory();