import type { MaybeRef } from '@vueuse/core'
import { useProjectState } from './state'
import { useProjectActions } from './actions'
import { useProjectGetters } from './getters'
import { useInjectionState } from '#imports'

const [setup, use] = useInjectionState((projectId: MaybeRef<string>) => {
  const state = useProjectState(projectId)
  const getters = useProjectGetters(state)
  const actions = useProjectActions(state, getters)

  return {
    ...state,
    ...getters,
    ...actions,
  }
}, 'useProject')

export const provideProject = setup

export function useProject(projectId?: MaybeRef<string>) {
  const state = use()

  if (!state) {
    if (!projectId) throw new Error('Project id was not provided and injection state is not initialized!')

    return setup(projectId)
  }

  return state
}
