<template>
  <div class="user-list">
    <va-card>
      <va-card-title>User List</va-card-title>
      <va-card-content>
        <va-input
          v-model="searchQuery"
          placeholder="Search users..."
          class="mb-3"
        />
        <va-data-table
          :items="filteredUsers"
          :columns="columns"
          :loading="loading"
        >
          <template #cell(actions)="{ rowData }">
            <va-button
              small
              color="primary"
              class="mr-2"
              @click="editUser(rowData)"
            >
              Edit
            </va-button>
            <va-button
              small
              color="danger"
              @click="deleteUser(rowData)"
            >
              Delete
            </va-button>
          </template>
        </va-data-table>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')

const columns = [
  { key: 'username', sortable: true },
  { key: 'email', sortable: true },
  { key: 'fullName', sortable: true },
  { key: 'country', sortable: true },
  { key: 'actions' }
]

const filteredUsers = computed(() => {
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  try {
    users.value = await userStore.fetchUsers()
    loading.value = false
  } catch (error) {
    console.error('Failed to fetch users', error)
    // Handle error (e.g., show error message)
  }
})

const editUser = (user) => {
  // Implement edit user logic
  console.log('Edit user:', user)
}

const deleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.username}?`)) {
    try {
      await userStore.deleteUser(user.id)
      users.value = users.value.filter(u => u.id !== user.id)
    } catch (error) {
      console.error('Failed to delete user', error)
      // Handle error (e.g., show error message)
    }
  }
}
</script>