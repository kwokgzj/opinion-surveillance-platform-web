import type { MessageBlock } from '@/RevoAI/types/newMessage'
import type { Session, FileType } from '@/RevoAI/types'
import { Dexie, type EntityTable } from 'dexie'

// Database declaration (move this to its own module also)
export const db = new Dexie('RevoAILite') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  message_blocks: EntityTable<MessageBlock, 'id'>
}

db.version(1).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  sessions: '&id',
  message_blocks: 'id, messageId, type',
})

export default db
