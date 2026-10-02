import { useEffect, useRef, useState } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import type { GreenApiCredentials, IncomingMessageWebhook } from '../types/greenApi'

interface UseNotificationsProps {
  credentials: GreenApiCredentials | null
  onIncomingMessage: (payload: {
    chatId: string
    text: string
    senderName?: string
    timestamp: number
    idMessage: string
  }) => void
}

export function useNotifications({ credentials, onIncomingMessage }: UseNotificationsProps) {
  const [isPolling, setIsPolling] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    if (!credentials?.idInstance || !credentials?.apiTokenInstance) {
      setIsPolling(false)
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
          const body = envelope.body as IncomingMessageWebhook

          if (body?.typeWebhook === 'incomingMessageReceived') {
            const chatId = body.senderData?.chatId
            const text =
              body.messageData?.textMessageData?.textMessage ||
              body.messageData?.extendedTextMessageData?.text ||
              ''

            if (chatId && text) {
              onIncomingMessage({
                chatId,
                text,
                senderName: body.senderData.senderName || body.senderData.senderContactName,
                timestamp: body.timestamp ? body.timestamp * 1000 : Date.now(),
                idMessage: body.idMessage || String(Date.now()),
              })
            }
          }

          // Acknowledge receipt to dequeue the notification
          await deleteNotification(credentials, envelope.receiptId).catch((err) => {
            console.warn('Failed to delete notification receipt:', err)
          })

          setLastError(null)
          // Check for next queued notification promptly
          timerId = setTimeout(poll, 400)
        } else {
          // No notifications pending in queue, wait before next check
          setLastError(null)
          timerId = setTimeout(poll, 2500)
        }
      } catch (err: unknown) {
        if (!isMountedRef.current || abortController.signal.aborted) return

        const message = err instanceof Error ? err.message : 'Ошибка при опросе уведомлений'
        setLastError(message)
        // Exponential/backed-off retry delay on failure
        timerId = setTimeout(poll, 5000)
      }
    }

    poll()

    return () => {
      isMountedRef.current = false
      abortController.abort()
      if (timerId) clearTimeout(timerId)
    }
  }, [credentials?.idInstance, credentials?.apiTokenInstance, credentials?.apiUrl, onIncomingMessage])

  return { isPolling, lastError }
}
