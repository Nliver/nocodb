<script setup lang="ts">
import type { ColumnType } from 'nocodb-sdk'
import {
  ActiveViewInj,
  FieldsInj,
  IsFormInj,
  IsLockedInj,
  IsPublicInj,
  MetaInj,
  OpenNewRecordFormHookInj,
  ReloadViewDataHookInj,
  ReloadViewMetaHookInj,
  createEventHook,
  inject,
  provide,
  ref,
  useMetas,
  useProject,
  useProvideSmartsheetStore,
  useSidebar,
  useViews,
  watch,
} from '#imports'

const { meta } = useMetas()

const { isLocked: isProjectLocked } = useProject()

const { activeView } = useViews(meta)

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

const isPublic = inject(IsPublicInj, ref(false))

watch(isLocked, (nextValue) => (isProjectLocked.value = nextValue), { immediate: true })
</script>

<template>
  <div class="w-full h-full">
    <div class="nc-container flex h-full">
      <div class="flex flex-col h-full flex-1 min-w-0">
        <LazySmartsheetToolbar :is-gallery="isGallery" :is-form="isForm" :is-grid="isGrid" :is-public="isPublic" />

        <NuxtPage :is-gallery="isGallery" :is-form="isForm" :is-grid="isGrid" />
      </div>

      <LazySmartsheetSidebar :meta="meta" class="nc-right-sidebar" />
    </div>
  </div>
</template>
