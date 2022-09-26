<script setup lang="ts">
interface Props {
  isGallery?: boolean
  isGrid?: boolean
  isForm?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <div class="h-full flex-1 min-w-0 min-h-0 bg-gray-50">
      <LazySmartsheetGrid v-if="isGrid" />

      <LazySmartsheetGallery v-else-if="isGallery" />

      <LazySmartsheetForm v-else-if="isForm && !$route.query.reload" />
    </div>
  </div>
</template>
