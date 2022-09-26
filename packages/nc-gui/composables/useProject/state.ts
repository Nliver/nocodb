import type { ProjectType, TableType } from 'nocodb-sdk'
import type { MaybeRef } from '@vueuse/core'
import { computed, ref, unref, watch } from '#imports'
import type { ProjectMetaInfo } from '~/lib'

export const useProjectState = (id: MaybeRef<any>) => {
  const _projectId = ref<string>(unref(id))
  const projectId = computed({
    get: () => _projectId.value,
    set: (nextId) => (_projectId.value = nextId),
  })

  watch(
    () => unref(projectId),
    (nextId) => (_projectId.value = nextId),
  )

  const project = ref<ProjectType>({})

  const tables = ref<TableType[]>([])

  const projectMetaInfo = ref<ProjectMetaInfo | undefined>()

  const isLocked = ref(false)

  return { projectId, project, tables, projectMetaInfo, isLocked }
}
