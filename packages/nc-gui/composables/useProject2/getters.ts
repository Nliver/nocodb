import { isString } from '@vueuse/core'
import type { OracleUi } from 'nocodb-sdk'
import { SqlUiFactory } from 'nocodb-sdk'
import type { useProjectState } from './state'
import { computed, useRoute } from '#imports'

export const useProjectGetters = (state: ReturnType<typeof useProjectState>) => {
  const route = useRoute()

  const projectType = computed(() => route.params.projectType as string)

  const projectMeta = computed<Record<string, any>>(() => {
    try {
      return isString(state.project.value.meta) ? JSON.parse(state.project.value.meta) : state.project.value.meta
    } catch (e) {
      return {}
    }
  })

  const projectBaseType = $computed(() => state.project.value.bases?.[0]?.type || '')

  const sqlUi = computed(
    () => SqlUiFactory.create({ client: projectBaseType }) as Exclude<ReturnType<typeof SqlUiFactory['create']>, typeof OracleUi>,
  )

  const isMysql = computed(() => ['mysql', 'mysql2'].includes(projectBaseType))
  const isMssql = computed(() => projectBaseType === 'mssql')
  const isPg = computed(() => projectBaseType === 'pg')
  const isSharedBase = computed(() => projectType.value === 'base')

  return {
    isMysql,
    isMssql,
    isPg,
    sqlUi,
    isSharedBase,
    projectMeta,
    projectType,
  }
}
