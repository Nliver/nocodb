<script setup lang="ts">
import { ref, useMetas, useProject, useRoute, useViews, watch } from '#imports'

interface Props {
  isGallery?: boolean
  isGrid?: boolean
  isForm?: boolean
}

defineProps<Props>()

const route = useRoute()

const { meta, getMeta } = useMetas()

const { setActiveView, loadViews } = useViews()

const { tables } = useProject()

const isLoading = ref(true)

watch(
  [meta, tables],
  async () => {
    if (!meta.value && tables.value.length) {
      isLoading.value = true
      console.log('fetching meta')
      await getMeta(route.params.title as string)
      await loadViews()
      await setActiveView(route.params.title as string)
      isLoading.value = false
    }
  },
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <div v-if="isLoading" class="flex items-center justify-center h-full w-full">
      <a-spin size="large" />
    </div>

    <div v-else class="h-full flex-1 min-w-0 min-h-0 bg-gray-50">
      <LazySmartsheetGrid v-if="isGrid" />

      <LazySmartsheetGallery v-else-if="isGallery" />

      <LazySmartsheetForm v-else-if="isForm && !$route.query.reload" />
    </div>
  </div>
</template>
