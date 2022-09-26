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
  useMetas,
  useProject,
  useProvideSmartsheetStore,
  useSidebar,
  watch,
} from '#imports'

const { meta } = useMetas()

const { isLocked: isProjectLocked } = useProject()

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

watch(isLocked, (nextValue) => (isProjectLocked.value = nextValue), { immediate: true })
</script>

<template>
  <div class="w-full h-full">
    <div class="nc-container flex h-full">
      <div class="flex flex-col h-full flex-1 min-w-0">
        <LazySmartsheetToolbar />

        <NuxtPage :is-gallery="isGallery" :is-form="isForm" :is-grid="isGrid" />
      </div>

      <LazySmartsheetSidebar v-model:active-view="activeView" :meta="meta" class="nc-right-sidebar" />
    </div>
  </div>
</template>
