<template>
  <div class="user-list">
    <simple-header title="User List" />
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button @click="editUser(user.id)">Edit</button>
            <button @click="deleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="router.push('/api/users/new')">Create New User</button>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import SimpleHeader from '@/components/SimpleHeader.vue'
import { getAllUsers, deleteUser as deleteUserApi } from '@/service/user'

const router = useRouter()
const users = ref([])
const showMessage = inject('showMessage')

onMounted(async () => {
  try {
    users.value = await getAllUsers()
  } catch (error) {
    showMessage('Failed to fetch users', 'error')
  }
})

const editUser = (userId) => {
  router.push(`/api/users/${userId}/edit`)
}

const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await deleteUserApi(userId)
      users.value = users.value.filter(user => user.id !== userId)
      showMessage('User deleted successfully', 'success')
    } catch (error) {
      showMessage('Failed to delete user', 'error')
    }
  }
}
</script>


  <style scoped>
  .user-list {
    padding: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  button {
    margin-right: 5px;
    cursor: pointer;
  }
  </style>