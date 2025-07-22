import PQueue from 'p-queue'

// Queue configuration - managed by session
const requestQueues: { [sessionId: string]: PQueue } = {}

/**
 * Get or create a queue for a specific session
 * @param sessionId The ID of the session
 * @param options
 * @returns A PQueue instance for the session
 */
export const getSessionQueue = (sessionId: string, options = {}): PQueue => {
  if (!requestQueues[sessionId]) requestQueues[sessionId] = new PQueue(options)
  return requestQueues[sessionId]
}

/**
 * Clear the queue for a specific session
 * @param sessionId The ID of the session
 */
export const clearSessionQueue = (sessionId: string): void => {
  if (requestQueues[sessionId]) {
    requestQueues[sessionId].clear()
    delete requestQueues[sessionId]
  }
}

/**
 * Clear all session queues
 */
export const clearAllQueues = (): void => {
  Object.keys(requestQueues).forEach((sessionId) => {
    requestQueues[sessionId].clear()
    delete requestQueues[sessionId]
  })
}

/**
 * Check if a session has pending requests
 * @param sessionId The ID of the session
 * @returns True if the session has pending requests
 */
export const hasSessionPendingRequests = (sessionId: string): boolean => {
  return requestQueues[sessionId]?.size > 0 || requestQueues[sessionId]?.pending > 0
}

/**
 * Get the number of pending requests for a session
 * @param sessionId The ID of the session
 * @returns The number of pending requests
 */
export const getSessionPendingRequestCount = (sessionId: string): number => {
  if (!requestQueues[sessionId]) {
    return 0
  }
  return requestQueues[sessionId].size + requestQueues[sessionId].pending
}

/**
 * Wait for all pending requests in a session queue to complete
 * @param sessionId The ID of the session
 */
export const waitForSessionQueue = async (sessionId: string): Promise<void> => {
  if (requestQueues[sessionId]) {
    await requestQueues[sessionId].onIdle()
  }
}
