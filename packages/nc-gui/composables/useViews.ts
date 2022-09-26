import type { TableType, ViewType } from 'nocodb-sdk'
import type { MaybeRef } from '@vueuse/core'
import { ActiveViewInj, inject, provide, ref, unref, useApi, useInjectionState, useRoute, useRouter, watch } from '#imports'

const [setup, use] = useInjectionState((meta: MaybeRef<TableType | undefined>) => {
  let views = $ref<ViewType[]>([])

  const { api, isLoading } = useApi({ useGlobalInstance: true })

  const activeView = inject(ActiveViewInj) ?? ref<ViewType>()

  provide(ActiveViewInj, activeView)

  const route = useRoute()

  const router = useRouter()

  const loadViews = async () => {
    const _meta = unref(meta)

    if (_meta && _meta.id) {
      const response = (await api.dbView.list(_meta.id)).list as ViewType[]
      if (response) {
        views = response.sort((a, b) => a.order! - b.order!)
      }
    }
  }

  watch(() => unref(meta), loadViews, { immediate: true })

  /** Watch route param and change active view based on `viewTitle` */
  watch(
    [$$(views), () => route.params.title],
    ([nextViews, viewTitle]) => {
      console.log(viewTitle)
      if (viewTitle) {
        let view = nextViews.find((v) => v.title === viewTitle)
        if (view) {
          activeView.value = view
        } else {
          /** search with view id and if found replace with title */
          view = nextViews.find((v) => v.id === viewTitle)
          if (view) {
            router.replace({
              params: {
                viewTitle: view.title,
              },
            })
          }
        }
      }

      /** if active view is not found, set it to first view */
      if (!activeView.value && nextViews.length) {
        activeView.value = nextViews[0]
      }
    },
    { flush: 'pre', immediate: true },
  )

  return { views: $$(views), loadViews, isLoading, activeView }
}, 'useViews')

export function useViews(meta?: MaybeRef<TableType | undefined>) {
  const state = use()

  if (!state) {
    if (!meta) throw new Error('Meta was not provided and injection state is not initialized!')

    return setup(meta)
  }

  return state
}
