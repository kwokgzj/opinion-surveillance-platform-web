<template>
  <div class="session-list-container">
    <div class="session-list-header">
      <a-button size="small" @click="$emit('create')" style="width: 100%">
        <template #icon>
          <plus-outlined />
        </template>
        新建会话
      </a-button>
    </div>
    <div class="search-container">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="搜索会话"
        size="small"
        @change="handleSearch"
        allow-clear
      />
    </div>
    <div class="session-list-content">
      <a-empty v-if="!filteredSessions || filteredSessions.length === 0" description="暂无会话" />
      <div v-else class="session-items">
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === activeSessionId }"
          @click="$emit('select', session.id)"
        >
          <div class="session-info">
            <div class="session-name">{{ session.title }}</div>
          </div>
          <div class="session-actions">
            <a-dropdown :trigger="['click']" @click.stop>
              <a-button type="text" size="small">
                <template #icon>
                  <more-outlined />
                </template>
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="rename" @click="handleRename(session)">
                    <edit-outlined />
                    <span>重命名</span>
                  </a-menu-item>
                  <a-menu-item key="delete" @click="handleDelete(session)">
                    <delete-outlined />
                    <span>删除</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
    </div>

    <a-modal
      v-model:open="renameModalVisible"
      title="重命名会话"
      @ok="confirmRename"
      :okButtonProps="{ disabled: !newSessionName }"
    >
      <a-input v-model:value="newSessionName" placeholder="请输入会话名称" />
    </a-modal>

    <a-modal v-model:open="deleteModalVisible" title="删除会话" @ok="confirmDelete">
      <p>确定要删除该会话吗？此操作不可恢复。</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { Session } from '@/RevoAI/types'
import { useSessionsStore } from '@/RevoAI/store/sessions'

const props = defineProps<{
  sessions: Session[]
  activeSessionId?: string
}>()

const emit = defineEmits(['select', 'create', 'delete'])

// 搜索相关
const searchQuery = ref('')
const filteredSessions = computed(() => {
  console.log('Computing filtered sessions, props.sessions:', props.sessions)
  if (!searchQuery.value) return props.sessions
  return props.sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 会话操作相关状态
const renameModalVisible = ref(false)
const deleteModalVisible = ref(false)
const currentSession = ref<Session | null>(null)
const newSessionName = ref('')

// 会话存储
const sessionStore = useSessionsStore()

// 监听会话列表的变化
watch(
  () => props.sessions,
  (newSessions) => {
    console.log('Sessions prop changed:', newSessions)
  },
  { deep: true },
)

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 今天内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `周${days[date.getDay()]}`
  }

  // 更早
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 处理重命名
const handleRename = (session: Session) => {
  currentSession.value = session
  newSessionName.value = session.title
  renameModalVisible.value = true
}

// 确认重命名
const confirmRename = () => {
  if (currentSession.value && newSessionName.value) {
    sessionStore.updateSession({
      ...currentSession.value,
      title: newSessionName.value,
    })
    renameModalVisible.value = false
  }
}

// 处理删除
const handleDelete = (session: Session) => {
  currentSession.value = session
  deleteModalVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  if (currentSession.value) {
    emit('delete', currentSession.value.id)
    deleteModalVisible.value = false
  }
}
</script>

<style lang="scss" scoped>
.session-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-1);
}

.session-list-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-1);
  }
}

.search-container {
  padding: 8px 16px;
}

.session-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: background-color var(--transition-duration);

  &:hover {
    background-color: var(--color-bg-2);
  }

  &.active {
    background-color: var(--color-bg-2);
  }
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.session-actions {
  opacity: 0;
  transition: opacity var(--transition-duration);

  .session-item:hover & {
    opacity: 1;
  }
}
</style>
