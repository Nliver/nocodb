<script setup lang="ts">
import type { ColumnType } from 'nocodb-sdk'
import {
  ActiveViewInj,
  FieldsInj,
  IsFormInj,
  IsLockedInj,
  MetaInj,
  OpenNewRecordFormHookInj,
  ReloadViewDataHookInj,
  ReloadViewMetaHookInj,
  createEventHook,
  provide,
  ref,
  until,
  useMetas,
  useProject,
  useProvideSmartsheetStore,
  useRoute,
  useSidebar,
  watch,
} from '#imports'

const { getMeta, meta } = useMetas()

const { tables, isLocked: isProjectLocked } = useProject()

const route = useRoute()

const loading = ref(true)

const activeView = ref()

const fields = ref<ColumnType[]>([])

const reloadEventHook = createEventHook()

const reloadViewMetaEventHook = createEventHook()

const openNewRecordFormHook = createEventHook()

const { isGallery, isGrid, isForm, isLocked } = useProvideSmartsheetStore(activeView, meta)

// provide the sidebar injection state
useSidebar('nc-right-sidebar', { useStorage: true, isOpen: true })

// todo: move to store
provide(MetaInj, meta)
provide(ActiveViewInj, activeView)
provide(IsLockedInj, isLocked)
provide(ReloadViewDataHookInj, reloadEventHook)
provide(ReloadViewMetaHookInj, reloadViewMetaEventHook)
provide(OpenNewRecordFormHookInj, openNewRecordFormHook)
provide(FieldsInj, fields)
provide(IsFormInj, isForm)

/** wait until table list loads since meta load requires table list **/
until(tables)
  .toMatch((tables) => tables.length > 0)
  .then(async () => {
    await getMeta(route.params.title as string, true)

    console.log('meta')
    loading.value = false
  })

watch(isLocked, (nextValue) => (isProjectLocked.value = nextValue), { immediate: true })
</script>

<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-full w-full">
      <a-spin size="large" />
    </div>

    <div v-else class="nc-container flex h-full">
      <div class="flex flex-col h-full flex-1 min-w-0">
        <LazySmartsheetToolbar />

        <NuxtPage :is-gallery="isGallery" :is-form="isForm" :is-grid="isGrid" />
      </div>

      <LazySmartsheetSidebar v-model:active-view="activeView" :meta="meta" class="nc-right-sidebar" />
    </div>
  </div>
</template>
