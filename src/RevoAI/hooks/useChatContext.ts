import { useMessageOperations } from '@/RevoAI/hooks/useMessageOperations'
import { EVENT_NAMES, EventEmitter } from '@/RevoAI/services/EventService'
import { Session } from '@/RevoAI/types'
import { ref, reactive, watch, computed } from 'vue'

export const useChatContext = (activeSession: Session) => {
  const { deleteMessage } = useMessageOperations(activeSession)

  const messageRefs = ref(new Map<string, HTMLElement>())
  const isMultiSelectMode = ref(false)
  const selectedMessageIds = ref<string[]>([])

  watch(
    () => activeSession,
    () => {
      isMultiSelectMode.value = false
    },
  )

  const handleToggleMultiSelectMode = (value: boolean) => {
    isMultiSelectMode.value = value
  }

  const registerMessageElement = (id: string, element: HTMLElement | null) => {
    const newRefs = new Map(messageRefs.value)
    if (element) {
      newRefs.set(id, element)
    } else {
      newRefs.delete(id)
    }
    messageRefs.value = newRefs
  }

  const handleSelectMessage = (messageId: string, selected: boolean) => {
    if (selected) {
      if (!selectedMessageIds.value.includes(messageId)) {
        selectedMessageIds.value = [...selectedMessageIds.value, messageId]
      }
    } else {
      selectedMessageIds.value = selectedMessageIds.value.filter((id) => id !== messageId)
    }
  }

  return {
    isMultiSelectMode,
    selectedMessageIds,
    toggleMultiSelectMode: handleToggleMultiSelectMode,
    handleSelectMessage,
    activeSession,
    messageRefs,
    registerMessageElement,
  }
}
