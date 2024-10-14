<template>
  <div class="cart-box">
    <h2>Shopping Cart</h2>
    <div v-if="cartItems.length > 0" class="cart-items">
      <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
        <img :src="item.goodsCoverImg" alt="Product Image" class="product-img" />
        <div class="product-info">
          <h3>{{ item.goodsName }}</h3>
          <p>Price: ¥{{ item.sellingPrice }}</p>
          <div class="quantity-control">
            <button @click="updateItemQuantity(item.cartItemId, item.goodsCount - 1)" :disabled="item.goodsCount <= 1">-</button>
            <span>{{ item.goodsCount }}</span>
            <button @click="updateItemQuantity(item.cartItemId, item.goodsCount + 1)" :disabled="item.goodsCount >= 5">+</button>
          </div>
        </div>
        <!-- 新增 Delete 按钮 -->
        <div class="delete-control">
          <button @click="deleteItem(item.cartItemId)" class="delete-button">Delete</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-cart">
      <p>Your cart is empty.</p>
    </div>

    <div class="cart-footer" v-if="cartItems.length > 0">
      <p>Total: ¥{{ total }}</p>
      <button @click="checkout" class="checkout-button">Checkout</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  store.dispatch('cart/fetchCartItems');
});

const cartItems = computed(() => store.state.cart.cartItems);
const total = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.goodsCount * item.sellingPrice, 0);
});

const updateItemQuantity = (cartItemId, newQuantity) => {
  if (newQuantity > 0 && newQuantity <= 5) {
    store.dispatch('cart/modifyCartItem', { cartItemId, goodsCount: newQuantity });
  }
};

// 删除商品的逻辑
const deleteItem = (cartItemId) => {
  store.dispatch('cart/deleteCartItem', cartItemId);
};

const checkout = () => {
  alert('Proceeding to checkout...');
};
</script>

<style scoped>
.cart-box {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.cart-items {
  margin-bottom: 20px;
}
.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.product-img {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}
.product-info {
  flex-grow: 1;
}
.quantity-control {
  display: flex;
  align-items: center;
}
.quantity-control button {
  margin: 0 10px;
  padding: 5px 10px;
}
.delete-control {
  margin-left: 20px;
}
.delete-button {
  padding: 5px 10px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
}
.cart-footer {
  text-align: right;
  margin-top: 20px;
}
.checkout-button {
  padding: 10px 20px;
  background-color: #1baeae;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
