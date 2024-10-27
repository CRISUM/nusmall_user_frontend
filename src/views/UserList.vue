<template>
  <div class="user-list">
    <h1>User List</h1>
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
    <button @click="createNewUser" class="create-button">Create New User</button>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUsers, deleteUser as deleteUserApi } from '@/service/user'
import { permissionService } from '@/service/permission'
import { UserRoles } from '@/constants/authTypes';

const router = useRouter()
const users = ref([])
const showMessage = inject('showMessage')
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref('');

onMounted(async () => {
  try {
    users.value = await getAllUsers()
  } catch (error) {
    showMessage('Failed to fetch users', 'error')
  }
})

const loadUsers = async () => {
  try {
    loading.value = true;
    const response = await getAllUsers();
    
    if (response && response.data) {
      users.value = response.data.map(user => ({
        ...user,
        id: user.userId || user.id  // 确保id字段存在
      }));
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    showMessage('Failed to load users: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
};

const editUser = async (userId) => {
  try {
    const hasPermission = await permissionService.checkPermission('/api/users', 'PUT');
    if (hasPermission) {
      router.push(`/api/users/${userId}/edit`);
    } else {
      showMessage('Permission denied', 'error');
    }
  } catch (error) {
    console.error('Permission check failed:', error);
    showMessage(error.message || 'Permission check failed', 'error');
  }
};

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    const hasPermission = await permissionService.checkPermission('/api/users', 'DELETE');
    if (!hasPermission) {
      showMessage('Permission denied', 'error');
      return;
    }

    const response = await deleteUserApi(userId);
    if (response.success) {
      showMessage('User deleted successfully', 'success');
      await loadUsers();
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    showMessage(error.message || 'Failed to delete user', 'error');
  }
};

const createNewUser = async () => {
  try {
    const hasPermission = await permissionService.checkPermission('/api/users', 'POST');
    if (hasPermission || JSON.parse(localStorage.getItem('user'))?.role === UserRoles.ADMIN) {
      router.push('/api/users/new');
    } else {
      showMessage('Permission denied', 'error');
    }
  } catch (error) {
    console.error('Permission check failed:', error);
    showMessage(error.message || 'Permission check failed', 'error');
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadUsers();
};

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role === UserRoles.ADMIN) {
    await loadUsers();
  } else {
    router.push('/403');
  }
});

</script>

<style scoped>
.user-list {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
button {
  margin-right: 5px;
  cursor: pointer;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
}
button:hover {
  opacity: 0.8;
}
.create-button {
  background-color: #008CBA;
  padding: 10px 15px;
  font-size: 16px;
}
</style>