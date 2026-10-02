import { useEffect, useRef, useState } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import type {
  GreenApiCredentials,
  IncomingMessageWebhook,
  OutgoingStatusWebhook,
} from '../types/greenApi'

interface UseNotificationsProps {
  credentials: GreenApiCredentials | null
  onIncomingMessage: (payload: {
    chatId: string
    text: string
    senderName?: string
    timestamp: number
    idMessage: string
  }) => void
  onMessageStatusUpdate?: (payload: {
    idMessage: string
    status: 'sent' | 'delivered' | 'read'
  }) => void
}

export function useNotifications({
  credentials,
  onIncomingMessage,
  onMessageStatusUpdate,
}: UseNotificationsProps) {
  const [isPolling, setIsPolling] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  // Keep latest callbacks in ref to avoid tearing down the polling loop on state/prop updates
  const onIncomingMessageRef = useRef(onIncomingMessage)
  const onMessageStatusUpdateRef = useRef(onMessageStatusUpdate)

  useEffect(() => {
    onIncomingMessageRef.current = onIncomingMessage
  }, [onIncomingMessage])

  useEffect(() => {
    onMessageStatusUpdateRef.current = onMessageStatusUpdate
  }, [onMessageStatusUpdate])

  useEffect(() => {
    isMountedRef.current = true
    if (!credentials?.idInstance || !credentials?.apiTokenInstance) {
      return
    }

    const abortController = new AbortController()
    let timerId: ReturnType<typeof setTimeout> | null = null

    const poll = async () => {
      if (!isMountedRef.current || abortController.signal.aborted) return

      try {
        setIsPolling(true)
        const envelope = await receiveNotification(credentials, abortController.signal)

        if (!isMountedRef.current || abortController.signal.aborted) return

        if (envelope && envelope.receiptId) {
          const body = envelope.body as
            | IncomingMessageWebhook
            | OutgoingStatusWebhook
            | Record<string, unknown>

          // Handle incoming messages
          if (body?.typeWebhook === 'incomingMessageReceived') {
            const incoming = body as IncomingMessageWebhook
            const chatId = incoming.senderData?.chatId
            const text =
              incoming.messageData?.textMessageData?.textMessage ||
              incoming.messageData?.extendedTextMessageData?.text ||
              ''

            if (chatId && text) {
              onIncomingMessageRef.current({
                chatId,
                text,
                senderName:
                  incoming.senderData.senderName || incoming.senderData.senderContactName,
                timestamp: incoming.timestamp ? incoming.timestamp * 1000 : Date.now(),
                idMessage: incoming.idMessage || String(Date.now()),
              })
            }
          }

          // Handle delivery/read status updates for sent messages
          if (body?.typeWebhook === 'outgoingMessageStatus') {
            const statusUpdate = body as OutgoingStatusWebhook
            if (
              statusUpdate.idMessage &&
              statusUpdate.status &&
              onMessageStatusUpdateRef.current
            ) {
              onMessageStatusUpdateRef.current({
                idMessage: statusUpdate.idMessage,
                status: statusUpdate.status,
              })
            }
          }

          // Acknowledge and remove notification from GREEN-API queue
          await deleteNotification(credentials, envelope.receiptId).catch((err) => {
            console.warn('Failed to delete notification receipt:', err)
          })

          setLastError(null)
          // Rapidly process next queued item
          timerId = setTimeout(poll, 300)
        } else {
          // Queue is empty, poll again after brief pause
          setLastError(null)
          timerId = setTimeout(poll, 2500)
        }
      } catch (err: unknown) {
        if (!isMountedRef.current || abortController.signal.aborted) return

        const message = err instanceof Error ? err.message : 'Ошибка при опросе уведомлений'
        setLastError(message)
        // Adaptive backoff on network failures
        timerId = setTimeout(poll, 5000)
      }
    }

    poll()

    return () => {
      isMountedRef.current = false
      abortController.abort()
      if (timerId) clearTimeout(timerId)
      setIsPolling(false)
    }
  }, [credentials])

  return { isPolling, lastError }
}
