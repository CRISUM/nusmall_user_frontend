// src/views/CategoryManagement.vue
<template>
  <div class="category-management">
    <div class="header">
      <h1>Category Management</h1>
      <button @click="showAddModal = true" class="primary-btn">
        Add Category
      </button>
    </div>

    <!-- Categories Table -->
    <div class="category-table">
      <table v-if="!loading && categories.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.categoryId">
            <td>{{ category.categoryId }}</td>
            <td>{{ category.categoryName }}</td>
            <td>{{ category.description }}</td>
            <td>{{ category.createUser }}</td>
            <td>
              <button @click="editCategory(category)" class="edit-btn">Edit</button>
              <button @click="confirmDelete(category)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingCategory" class="modal">
      <div class="modal-content">
        <h2>{{ editingCategory ? 'Edit' : 'Add' }} Category</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Category Name</label>
            <input v-model="categoryForm.categoryName" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="categoryForm.description" required></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="primary-btn">
              {{ editingCategory ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this category?</p>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="cancel-btn">Cancel</button>
          <button @click="deleteCategory" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { saveCategory, deleteCategory, updateCategory, pageQuery } from '@/service/category';

const categories = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const showDeleteConfirm = ref(false);
const editingCategory = ref(null);
const categoryToDelete = ref(null);

const categoryForm = ref({
  categoryName: '',
  description: '',
});

const loadCategories = async () => {
  try {
    loading.value = true;
    const response = await pageQuery({
      page: 1,
      pageSize: 50
    });
    categories.value = response.records;
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token');
    if (editingCategory.value) {
      await updateCategory(token, {
        ...categoryForm.value,
        categoryId: editingCategory.value.categoryId
      });
    } else {
      await saveCategory(token, categoryForm.value);
    }
    await loadCategories();
    closeModal();
  } catch (error) {
    console.error('Failed to save category:', error);
  }
};

const editCategory = (category) => {
  editingCategory.value = category;
  categoryForm.value = {
    categoryName: category.categoryName,
    description: category.description
  };
};

const confirmDelete = (category) => {
  categoryToDelete.value = category;
  showDeleteConfirm.value = true;
};

const deleteCategory = async () => {
  try {
    if (categoryToDelete.value) {
      await deleteCategory(categoryToDelete.value.categoryId);
      await loadCategories();
      showDeleteConfirm.value = false;
    }
  } catch (error) {
    if (error.message.includes('DeletionNotAllowedException')) {
      alert('Cannot delete category as it is associated with products');
    } else {
      console.error('Failed to delete category:', error);
    }
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingCategory.value = null;
  categoryForm.value = {
    categoryName: '',
    description: ''
  };
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.category-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.category-table th,
.category-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

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
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.primary-btn {
  background: #1baeae;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>