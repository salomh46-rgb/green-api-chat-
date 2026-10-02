import { useState, useEffect, useCallback } from 'react'
import type {
  ChatContact,
  ChatMessage,
  GreenApiCredentials,
} from './types/greenApi'
import { sendMessage } from './api/greenApi'
import { useNotifications } from './hooks/useNotifications'
import { AuthScreen } from './components/AuthScreen'
import { Sidebar } from './components/Sidebar'
import { ChatArea } from './components/ChatArea'
import { NewChatModal } from './components/NewChatModal'

const STORAGE_KEY_CREDS = 'green_api_credentials'

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn('Failed to parse localStorage item:', e)
    return fallback
  }
}

function playNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08) // A5

    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function App() {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() => {
    return safeJsonParse<GreenApiCredentials | null>(
      localStorage.getItem(STORAGE_KEY_CREDS),
      null
    )
  })

  const chatsStorageKey = credentials ? `green_api_chats_${credentials.idInstance}` : null
  const messagesStorageKey = credentials ? `green_api_msgs_${credentials.idInstance}` : null

  const [chats, setChats] = useState<ChatContact[]>([])
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({})
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Load chats and messages on login
  useEffect(() => {
    if (!chatsStorageKey || !messagesStorageKey) {
      setChats([])
      setMessagesByChat({})
      setActiveChatId(null)
      return
    }

    const savedChats = safeJsonParse<ChatContact[]>(
      localStorage.getItem(chatsStorageKey),
      []
    )
    const savedMsgs = safeJsonParse<Record<string, ChatMessage[]>>(
      localStorage.getItem(messagesStorageKey),
      {}
    )
    setChats(savedChats)
    setMessagesByChat(savedMsgs)
  }, [chatsStorageKey, messagesStorageKey])

  // Persist chats on change
  useEffect(() => {
    if (chatsStorageKey) {
      try {
        localStorage.setItem(chatsStorageKey, JSON.stringify(chats))
      } catch (err) {
        console.warn('Storage quota exceeded for chats:', err)
      }
    }
  }, [chats, chatsStorageKey])

  // Persist messages on change
  useEffect(() => {
    if (messagesStorageKey) {
      try {
        localStorage.setItem(messagesStorageKey, JSON.stringify(messagesByChat))
      } catch (err) {
        console.warn('Storage quota exceeded for messages:', err)
      }
    }
  }, [messagesByChat, messagesStorageKey])

  const handleIncomingMessage = useCallback(
    ({
      chatId,
      text,
      senderName,
      timestamp,
      idMessage,
    }: {
      chatId: string
      text: string
      senderName?: string
      timestamp: number
      idMessage: string
    }) => {
      playNotificationSound()

      const newMsg: ChatMessage = {
        id: idMessage,
        chatId,
        text,
        sender: 'them',
        timestamp,
        status: 'delivered',
      }

      setMessagesByChat((prev) => {
        const currentList = prev[chatId] || []
        // Prevent duplicate appending
        if (currentList.some((m) => m.id === idMessage)) {
          return prev
        }
        return {
          ...prev,
          [chatId]: [...currentList, newMsg],
        }
      })

      setChats((prev) => {
        const digits = chatId.replace(/@.*$/, '').replace(/\D/g, '')
        const existingIdx = prev.findIndex((c) => c.id === chatId)

        if (existingIdx !== -1) {
          const updated = [...prev]
          const existing = updated[existingIdx]
          updated[existingIdx] = {
            ...existing,
            lastMessage: text,
            lastMessageTime: timestamp,
            unreadCount: activeChatId === chatId ? 0 : existing.unreadCount + 1,
            name: senderName || existing.name,
          }
          // Move conversation to top
          const [moved] = updated.splice(existingIdx, 1)
          return [moved, ...updated]
        }

        // Create new contact entry if sender is new
        const newContact: ChatContact = {
          id: chatId,
          phoneNumber: digits,
          name: senderName || undefined,
          lastMessage: text,
          lastMessageTime: timestamp,
          unreadCount: activeChatId === chatId ? 0 : 1,
        }
        return [newContact, ...prev]
      })
    },
    [activeChatId]
  )

  const handleMessageStatusUpdate = useCallback(
    ({
      idMessage,
      status,
    }: {
      idMessage: string
      status: 'sent' | 'delivered' | 'read'
    }) => {
      setMessagesByChat((prev) => {
        let changed = false
        const next: Record<string, ChatMessage[]> = {}
        for (const [chatId, msgs] of Object.entries(prev)) {
          const updated = msgs.map((m) => {
            if (m.id === idMessage) {
              changed = true
              return {
                ...m,
                status: status === 'read' ? 'delivered' : status,
              }
            }
            return m
          })
          next[chatId] = updated
        }
        return changed ? next : prev
      })
    },
    []
  )

  const { isPolling } = useNotifications({
    credentials,
    onIncomingMessage: handleIncomingMessage,
    onMessageStatusUpdate: handleMessageStatusUpdate,
  })

  const handleLogin = (creds: GreenApiCredentials) => {
    localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(creds))
    setCredentials(creds)
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_CREDS)
    setCredentials(null)
    setActiveChatId(null)
  }

  const handleCreateChat = (chatId: string, phone: string) => {
    setChats((prev) => {
      const exists = prev.find((c) => c.id === chatId)
      if (exists) return prev
      const newContact: ChatContact = {
        id: chatId,
        phoneNumber: phone,
        unreadCount: 0,
      }
      return [newContact, ...prev]
    })
    setActiveChatId(chatId)
  }

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    setMessagesByChat((prev) => {
      const copy = { ...prev }
      delete copy[chatId]
      return copy
    })
    if (activeChatId === chatId) {
      setActiveChatId(null)
    }
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
    // Mark as read
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    )
  }

  const handleSendMessage = async (text: string) => {
    if (!credentials || !activeChatId) return

    const tempId = `temp_${Date.now()}`
    const now = Date.now()

    const optimisticMsg: ChatMessage = {
      id: tempId,
      chatId: activeChatId,
      text,
      sender: 'me',
      timestamp: now,
      status: 'pending',
    }

    // Optimistic UI update
    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), optimisticMsg],
    }))

    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === activeChatId)
      if (idx === -1) return prev
      const updated = [...prev]
      updated[idx] = {
        ...updated[idx],
        lastMessage: text,
        lastMessageTime: now,
      }
      const [moved] = updated.splice(idx, 1)
      return [moved, ...updated]
    })

    setIsSending(true)

    try {
      const res = await sendMessage(credentials, activeChatId, text)

      setMessagesByChat((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === tempId ? { ...m, id: res.idMessage, status: 'sent' } : m
        ),
      }))
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessagesByChat((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === tempId ? { ...m, status: 'error' } : m
        ),
      }))
    } finally {
      setIsSending(false)
    }
  }

  const handleRetryMessage = async (msg: ChatMessage) => {
    if (!credentials || isSending) return

    setIsSending(true)
    setMessagesByChat((prev) => ({
      ...prev,
      [msg.chatId]: (prev[msg.chatId] || []).map((m) =>
        m.id === msg.id ? { ...m, status: 'pending' } : m
      ),
    }))

    try {
      const res = await sendMessage(credentials, msg.chatId, msg.text)
      setMessagesByChat((prev) => ({
        ...prev,
        [msg.chatId]: (prev[msg.chatId] || []).map((m) =>
          m.id === msg.id ? { ...m, id: res.idMessage, status: 'sent' } : m
        ),
      }))
    } catch {
      setMessagesByChat((prev) => ({
        ...prev,
        [msg.chatId]: (prev[msg.chatId] || []).map((m) =>
          m.id === msg.id ? { ...m, status: 'error' } : m
        ),
      }))
    } finally {
      setIsSending(false)
    }
  }

  if (!credentials) {
    return <AuthScreen onLogin={handleLogin} />
  }

  const activeChat = chats.find((c) => c.id === activeChatId) || null
  const currentMessages = activeChatId ? messagesByChat[activeChatId] || [] : []

  return (
    <div className="h-[100dvh] w-screen flex overflow-hidden bg-[#d1d7db]">
      {/* Outer wrapper with subtle shadow on large displays */}
      <div className="flex-1 flex h-full w-full max-w-[1700px] mx-auto shadow-2xl overflow-hidden bg-white">
        <div className={`h-full ${activeChatId ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
          <Sidebar
            credentials={credentials}
            chats={chats}
            activeChatId={activeChatId}
            isPolling={isPolling}
            onSelectChat={handleSelectChat}
            onOpenNewChatModal={() => setIsModalOpen(true)}
            onDeleteChat={handleDeleteChat}
            onLogout={handleLogout}
          />
        </div>

        <div className={`h-full flex-1 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
          <ChatArea
            activeChat={activeChat}
            messages={currentMessages}
            isSending={isSending}
            onSendMessage={handleSendMessage}
            onRetryMessage={handleRetryMessage}
            onBackToSidebar={() => setActiveChatId(null)}
          />
        </div>
      </div>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  )
}

export default App
