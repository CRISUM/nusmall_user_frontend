// src/utils/mockService.js

const STORAGE_KEY = 'vue_user_management';
const CART_STORAGE_KEY = 'vue_cart_management';

// 初始化本地存储，包括用户数据和购物车数据
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: [
        { id: 1, username: 'admin', password: 'admin', email: 'admin@example.com', role: 'ADMIN' },
        { id: 2, username: 'user', password: 'user', email: 'user@example.com', role: 'CUSTOMER' }
      ]
    }));
  }

  if (!localStorage.getItem(CART_STORAGE_KEY)) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      cartItems: [
        { cartItemId: 1, goodsName: 'Product A', goodsCount: 2, sellingPrice: 50, goodsCoverImg: '/path/to/img1' },
        { cartItemId: 2, goodsName: 'Product B', goodsCount: 1, sellingPrice: 100, goodsCoverImg: '/path/to/img2' }
      ]
    }));
  }
};

// 获取购物车存储的数据
const getCartData = () => {
  return JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
};

// 更新购物车存储的数据
const updateCartData = (data) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
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
  if (user) {
    return { ...user, password: undefined };
  } else {
    throw new Error('User not found');
  }
};

// 创建用户
export const createUser = async (userData) => {
  await delay(500);
  const data = getStorageData();
  if (data.users.some(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }
  const newUser = { ...userData, id: data.users.length + 1 };
  data.users.push(newUser);
  updateStorageData(data);
  return { message: 'User created successfully', user: { ...newUser, password: undefined } };
};

// 更新用户
export const updateUser = async (id, userData) => {
  await delay(500);
  const data = getStorageData();
  const index = data.users.findIndex(u => u.id === parseInt(id));
  if (index !== -1) {
    data.users[index] = { ...data.users[index], ...userData };
    updateStorageData(data);
    return { message: 'User updated successfully', user: { ...data.users[index], password: undefined } };
  } else {
    throw new Error('User not found');
  }
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

/**
 * Cart 模拟服务
 */

// 获取购物车
export const getCart = async () => {
  await delay(300);
  return [
    { cartItemId: 1, goodsName: 'Product A', goodsCount: 2, sellingPrice: 50, goodsCoverImg: 'img1' },
    { cartItemId: 2, goodsName: 'Product B', goodsCount: 1, sellingPrice: 100, goodsCoverImg: 'img2' }
  ];
};

// 添加商品到购物车
export const addToCart = async (newItem) => {
  await delay(300);
  const data = getCartData();
  const existingItem = data.cartItems.find(item => item.cartItemId === newItem.cartItemId);
  if (existingItem) {
    existingItem.goodsCount += newItem.goodsCount;
  } else {
    data.cartItems.push(newItem);
  }
  updateCartData(data);
  return { message: 'Item added to cart' };
};

// 修改购物车商品数量
export const modifyCart = async ({ cartItemId, goodsCount }) => {
  const data = getCartData();
  const item = data.cartItems.find(item => item.cartItemId === cartItemId);
  if (item) {
    item.goodsCount = goodsCount;
    updateCartData(data);
    return item;
  } else {
    throw new Error('Item not found');
  }
};

// 删除购物车商品
export const deleteCartItem = async (cartItemId) => {
  await delay(300);
  const data = getCartData();
  data.cartItems = data.cartItems.filter(item => item.cartItemId !== cartItemId);
  updateCartData(data);
  return { message: 'Item deleted successfully' };
};

// 初始化存储
initStorage();
