import type { ProjectType } from 'nocodb-sdk'
import type { useProjectState } from './state'
import type { useProjectGetters } from './getters'
import type { ThemeConfig } from '~/lib'
import { createEventHook, useApi, useGlobal, useNuxtApp, useRoles, useRouter, useTheme } from '#imports'

export const useProjectActions = (state: ReturnType<typeof useProjectState>, getters: ReturnType<typeof useProjectGetters>) => {
  const { $e } = useNuxtApp()

  const { api, isLoading } = useApi()

  const { includeM2M } = useGlobal()

  const { setTheme, theme } = useTheme()

  const router = useRouter()

  const { projectRoles, loadProjectRoles } = useRoles()

  const projectLoadedHook = createEventHook<void>()

  async function loadProjectMetaInfo(force?: boolean) {
    if (!state.projectMetaInfo.value || force) {
      state.projectMetaInfo.value = await api.project.metaGet(state.projectId.value, {}, {})
    }
  }

  async function loadTables() {
    const tablesResponse = await api.dbTable.list(state.projectId.value, {
      includeM2M: includeM2M.value,
    })

    if (tablesResponse.list) state.tables.value = tablesResponse.list
  }

  async function loadProject() {
    if (getters.projectType.value === 'base') {
      try {
        const baseData = await api.public.sharedBaseGet(state.projectId.value)

        state.project.value = await api.project.read(baseData.project_id!)
      } catch (e: any) {
        if (e?.response?.status === 404) {
          return router.push('/error/404')
        }

        throw e
      }
    } else if (state.projectId.value) {
      state.project.value = await api.project.read(state.projectId.value)
    } else {
      console.warn('Project id not found')
      return
    }

    await loadProjectRoles(state.project.value.id || state.projectId.value, getters.isSharedBase.value, state.projectId.value)

    await loadTables()

    setTheme(getters.projectMeta.value?.theme)

    return projectLoadedHook.trigger()
  }

  async function updateProject(data: Partial<ProjectType>) {
    if (getters.projectType.value === 'base') {
      return
    }

    if (!state.project.value.id) return

    if (data.meta && typeof data.meta === 'string') {
      await api.project.update(state.project.value.id, data)
    } else {
      await api.project.update(state.project.value.id, { ...data, meta: JSON.stringify(data.meta) })
    }
  }

  async function saveTheme(_theme: Partial<ThemeConfig>) {
    const fullTheme = {
      primaryColor: theme.value.primaryColor,
      accentColor: theme.value.accentColor,
      ..._theme,
    }

    await updateProject({
      color: fullTheme.primaryColor,
      meta: {
        ...getters.projectMeta.value,
        theme: fullTheme,
      },
    })

    setTheme(fullTheme)

    $e('c:themes:change')
  }

  const reset = () => {
    state.project.value = {}
    state.tables.value = []
    state.projectMetaInfo.value = undefined
    projectRoles.value = {}
    setTheme()
  }

  loadProject()

  return {
    loadProjectMetaInfo,
    loadTables,
    loadProject,
    updateProject,
    saveTheme,
    reset,
    onLoad: projectLoadedHook.on,
    isLoading,
  }
}
