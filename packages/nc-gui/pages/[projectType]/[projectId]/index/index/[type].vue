<script setup lang="ts">
import type { ColumnType, TableType } from 'nocodb-sdk'
import type { TabItem } from '~/lib'
import {
  ActiveViewInj,
  FieldsInj,
  IsFormInj,
  IsLockedInj,
  MetaInj,
  OpenNewRecordFormHookInj,
  ReloadViewDataHookInj,
  ReloadViewMetaHookInj,
  TabMetaInj,
  computed,
  createEventHook,
  inject,
  onUpdated,
  provide,
  ref,
  until,
  useMetas,
  useProject,
  useProvideSmartsheetStore,
  useRoute,
  useRouter,
  useSidebar,
  watch,
} from '#imports'

const { getMeta, metas } = useMetas()

const { tables } = useProject()

const route = useRoute()

const loading = ref(true)

const activeView = ref()

const fields = ref<ColumnType[]>([])

const activeTab = inject(
  TabMetaInj,
  computed(() => ({} as TabItem)),
)

const treeViewIsLockedInj = inject('TreeViewIsLockedInj', ref(false))

const meta = computed<TableType | undefined>(() => metas.value[activeTab.value.id!])

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

    loading.value = false
  })

onMounted(() => {
  useRouter().beforeEach(async (to) => {
    if (to.params.title) await getMeta(to.params.title as string, true)
  })
})

watch(isLocked, (nextValue) => (treeViewIsLockedInj.value = nextValue), { immediate: true })

console.log('type')
</script>

<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-full w-full">
      <a-spin size="large" />
    </div>

    <div v-else class="nc-container flex h-full">
      <div class="flex flex-col h-full flex-1 min-w-0">
        <LazySmartsheetToolbar />

        <NuxtPage :active-view="activeView" :is-gallery="isGallery" :is-form="isForm" :is-grid="isGrid" />
      </div>

      <LazySmartsheetSidebar v-model:active-view="activeView" :meta="meta" class="nc-right-sidebar" />
    </div>
  </div>
</template>
