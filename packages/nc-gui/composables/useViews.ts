import type { ViewType } from 'nocodb-sdk'
import {
  ActiveViewInj,
  inject,
  provide,
  ref,
  unref,
  useApi,
  useInjectionState,
  useMetas,
  useRoute,
  useRouter,
  watch,
} from '#imports'

const [setup, use] = useInjectionState(() => {
  let views = $ref<ViewType[]>([])

  const { meta } = useMetas()

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

  const setActiveView = (viewTitle?: string) => {
    if (viewTitle) {
      let view = views.find((v) => v.title === viewTitle)
      if (view) {
        activeView.value = view
      } else {
        /** search with view id and if found replace with title */
        view = views.find((v) => v.id === viewTitle)
        if (view) {
          return router.replace({
            params: {
              viewTitle: view.title,
            },
          })
        }
      }
    }

    /** if active view is not found, set it to first view */
    if (!activeView.value && views.length) {
      activeView.value = views[0]
    }

    return Promise.resolve(true)
  }

  watch(
    () => unref(meta),
    async () => {
      await loadViews()
      await setActiveView(route.params.title as string)
    },
    { immediate: true },
  )

  return { views: $$(views), loadViews, setActiveView, isLoading, activeView }
}, 'useViews')

export function useViews() {
  const state = use()

  if (!state) {
    return setup()
  }

  return state
}
