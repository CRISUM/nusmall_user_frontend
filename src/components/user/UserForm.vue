<template>
  <va-form @submit.prevent="handleSubmit">
    <va-input
      v-model="formData.username"
      label="Username"
      class="mb-3"
      :readonly="mode === 'edit'"
    />
    <va-input
      v-model="formData.email"
      label="Email"
      type="email"
      class="mb-3"
    />
    <va-input
      v-model="formData.fullName"
      label="Full Name"
      class="mb-3"
    />
    <va-select
      v-model="formData.country"
      label="Country"
      :options="countries"
      class="mb-3"
    />
    <va-button type="submit">{{ submitButtonText }}</va-button>
  </va-form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'create'
  }
})

const emit = defineEmits(['submit'])

const formData = ref({ ...props.initialData })

const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'China']

const submitButtonText = props.mode === 'create' ? 'Create User' : 'Update User'

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>