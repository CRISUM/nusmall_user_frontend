// src/views/CategoryManagement.vue
<script setup>
import { ref, onMounted } from 'vue'; // 添加这行，引入ref
import { useRouter } from 'vue-router';
import { 
  saveCategory, 
  pageQuery,
  deleteCategory as deleteCategoryApi, 
  updateCategory 
} from '@/service/category';
import { showMessage } from '@/utils/message';

const router = useRouter();

// State declarations
const loading = ref(false);
const categories = ref([]);
const showAddModal = ref(false);
const editingCategory = ref(null);
const categoryToDelete = ref(null);
const showDeleteConfirm = ref(false);

const categoryForm = ref({
  categoryName: '',
  description: ''
});

// Methods
const loadCategories = async () => {
  if (!categories.value.length) {  // 只在需要时加载
    try {
      loading.value = true;
      const response = await pageQuery({
        page: 1,
        pageSize: 100
      });
      if (response?.records) {
        categories.value = response.records;
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      showMessage('Failed to load categories', 'error');
    } finally {
      loading.value = false;
    }
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
    showMessage(`Category ${editingCategory.value ? 'updated' : 'created'} successfully`, 'success');
  } catch (error) {
    console.error('Failed to save category:', error);
    showMessage(error.message || 'Failed to save category', 'error');
  }
};

const handleDeleteCategory = async () => {
  try {
    if (categoryToDelete.value) {
      await deleteCategoryApi(categoryToDelete.value.categoryId);
      await loadCategories();
      showDeleteConfirm.value = false;
      showMessage('Category deleted successfully', 'success');
    }
  } catch (error) {
    if (error.message.includes('DeletionNotAllowedException')) {
      showMessage('Cannot delete category as it is associated with products', 'error');
    } else {
      console.error('Failed to delete category:', error);
      showMessage('Failed to delete category', 'error');
    }
  }
};

const confirmDelete = (category) => {
  categoryToDelete.value = category;
  showDeleteConfirm.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingCategory.value = null;
  categoryForm.value = {
    categoryName: '',
    description: ''
  };
};

// Initialize
onMounted(() => {
  if (router.currentRoute.value.name === 'CategoryManagement') {
    loadCategories();
  }
});
</script>