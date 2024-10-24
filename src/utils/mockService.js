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

const getCartData = () => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    if (data) {
      const parsedData = JSON.parse(data);
      return {
        cartId: parsedData.cartId || Date.now(),
        userId: parsedData.userId || null,
        cartItems: Array.isArray(parsedData.cartItems) ? parsedData.cartItems : []
      };
    }
  } catch (error) {
    console.error('Error parsing cart data:', error);
  }
  // Return default structure if anything goes wrong
  return {
    cartId: Date.now(),
    userId: null,
    cartItems: []
  };
};

const updateCartData = (data) => {
  try {
    const cartData = {
      cartId: data.cartId || Date.now(),
      userId: data.userId || null,
      cartItems: Array.isArray(data.cartItems) ? data.cartItems : []
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('Error updating cart data:', error);
  }
};

// 获取购物车
export const getCart = async () => {
  await delay(300);
  const data = getCartData();
  return {
    cartId: data.cartId || Date.now(),
    userId: data.userId || null,
    cartItems: Array.isArray(data.cartItems) ? data.cartItems : []
  };
};

// 添加到购物车
export const addToCart = async (cartItem) => {
  await delay(300);
  const data = getCartData();
  
  const newCartItem = {
    cartItemId: Date.now(),
    productId: cartItem.productId,
    quantity: Number(cartItem.quantity) || 1,
    price: Number(cartItem.price) || 0,
    name: cartItem.name || 'Unnamed Product',
    imageUrl: cartItem.imageUrl || '/api/placeholder/400/320',
    isSelected: true,
    createDatetime: new Date().toISOString(),
    updateDatetime: new Date().toISOString(),
    createUser: cartItem.createUser || 'system',
    updateUser: cartItem.updateUser || 'system'
  };

  // Ensure cartItems is an array
  if (!Array.isArray(data.cartItems)) {
    data.cartItems = [];
  }

  // Find existing item
  const existingItemIndex = data.cartItems.findIndex(
    item => item.productId === cartItem.productId
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    data.cartItems[existingItemIndex] = {
      ...data.cartItems[existingItemIndex],
      quantity: cartItem.quantity,
      updateDatetime: new Date().toISOString(),
      updateUser: cartItem.updateUser || 'system'
    };
  } else {
    // Add new item
    data.cartItems.push(newCartItem);
  }

  updateCartData(data);
  return newCartItem;
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
    return {
      success: true,
      data: {
        token: `mock-token-${user.id}`,
        user: { ...user, password: undefined }
      },
      message: 'Login successful'
    };
  } else {
    return {
      success: false,
      message: 'Invalid credentials'
    };
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

export const getAllProducts = async () => {
  await delay(300);
  const { products } = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || '{"products": []}');
  const { inventory } = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{"inventory": []}');
  
  return {
    records: products.map(product => ({
      ...product,
      productId: product.id,  // Ensure productId exists
      name: product.name || 'Unnamed Product',
      description: product.description || 'No description',
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl || '/api/placeholder/400/320',
      availableStock: inventory.find(item => item.productId === product.id)?.availableStock || 0
    })),
    total: products.length
  };
};
export const getProductsByMerchant = async (authToken) => {
  await delay(300);
  const { products } = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY));
  const userData = parseToken(authToken);
  const merchantProducts = products.filter(p => p.sellerId === userData.id);
  
  return {
    records: merchantProducts.map(product => ({
      ...product,
      productId: product.id,  // Ensure productId exists
      availableStock: 0  // Default value
    })),
    total: merchantProducts.length
  };
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
  const { products } = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || '{"products": []}');
  const product = products.find(p => p.productId === parseInt(id) || p.id === parseInt(id));
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return {
    ...product,
    productId: product.productId || product.id  // 确保始终有 productId
  };
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

export const deleteInventory = async (productId) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY));
  const index = data.inventory.findIndex(i => i.productId === parseInt(productId));
  if (index !== -1) {
    data.inventory.splice(index, 1);
  }
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
  return { message: 'Inventory deleted successfully' };
};

export const deductStock = async (productId, quantity) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY));
  const item = data.inventory.find(i => i.productId === parseInt(productId));
  if (item && item.availableStock >= quantity) {
    item.availableStock -= quantity;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
    return true;
  }
  return false;
};

export const addStock = async (productId, quantity) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY));
  const item = data.inventory.find(i => i.productId === parseInt(productId));
  if (item) {
    item.availableStock += quantity;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
    return true;
  }
  return false;
};

export const addOrder = async (order) => {
  await delay(500);
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const newOrder = { ...order, orderId: Date.now() };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder.orderId;
};

export const submitOrder = async (submitOrderParam) => {
  await delay(500);
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const newOrder = {
    ...submitOrderParam,
    orderId: Date.now(),
    status: 'PENDING',
    orderDate: new Date().toISOString()
  };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder.orderId;
};

export const paySuccess = async (orderId) => {
  await delay(500);
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = 'PAID';
    localStorage.setItem('orders', JSON.stringify(orders));
  }
  return true;
};

export const updateItemQuantity = async (cartId, cartItemId, quantity) => {
  await delay(300);
  const data = getCartData();
  const items = Array.isArray(data.cartItems) ? data.cartItems : [];
  const item = items.find(i => i.cartItemId === cartItemId);
  
  if (item) {
    item.quantity = quantity;
    item.updateDatetime = new Date().toISOString();
    updateCartData(data);
  }
  return true;
};

export const updateItemSelected = async (cartId, itemId, isSelected) => {
  await delay(500);
  const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{"cartItems": []}');
  const item = cart.cartItems.find(i => i.cartItemId === itemId);
  if (item) {
    item.isSelected = isSelected;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
  return true;
};

export const getSelectedItems = async (cartId) => {
  await delay(300);
  const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{"cartItems": []}');
  return cart.cartItems.filter(item => item.isSelected);
};

export const removeSelectedItems = async (cartId) => {
  await delay(500);
  const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{"cartItems": []}');
  cart.cartItems = cart.cartItems.filter(item => !item.isSelected);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return true;
};

export const getOrderByUserId = async (userId) => {
  await delay(300);
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  return orders.filter(order => order.userId === userId);
};

// 确保初始化执行
initInventoryData();

// 初始化存储
initStorage();

// 初始化存储
initProductAndInventory();

const CATEGORY_STORAGE_KEY = 'vue_category_management';

// 初始化分类数据
const initCategoryData = () => {
  if (!localStorage.getItem(CATEGORY_STORAGE_KEY)) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify({
      categories: [
        { categoryId: 1, categoryName: 'Electronics', description: 'Electronic items' },
        { categoryId: 2, categoryName: 'Clothing', description: 'Clothing and apparel' },
        { categoryId: 3, categoryName: 'Accessories', description: 'Fashion accessories' }
      ]
    }));
  }
};

// 查询分类（分页）
export const queryCategoryPage = async ({ page, pageSize }) => {
  await delay(300);
  const data = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedCategories = data.categories.slice(start, end);

  return {
    records: paginatedCategories,
    total: data.categories.length
  };
};

// 添加分类
export const saveCategory = async (categoryDTO) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
  const newCategory = {
    ...categoryDTO,
    categoryId: Math.max(...data.categories.map(c => c.categoryId), 0) + 1
  };
  data.categories.push(newCategory);
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(data));
  return newCategory;
};

// 删除分类
export const deleteCategory = async (categoryId) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
  const index = data.categories.findIndex(c => c.categoryId === categoryId);
  if (index !== -1) {
    data.categories.splice(index, 1);
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(data));
    return { message: 'Category deleted successfully' };
  } else {
    throw new Error('Category not found');
  }
};

// 更新分类
export const updateCategory = async (categoryDTO) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
  const index = data.categories.findIndex(c => c.categoryId === categoryDTO.categoryId);
  if (index !== -1) {
    data.categories[index] = { ...data.categories[index], ...categoryDTO };
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(data));
    return data.categories[index];
  } else {
    throw new Error('Category not found');
  }
};

// 根据 categoryId 获取分类名称
export const getCategoryName = (categoryId) => {
  const data = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
  const category = data.categories.find(c => c.categoryId === categoryId);
  return category ? category.categoryName : 'Unknown Category';
};

// 初始化分类数据
initCategoryData();