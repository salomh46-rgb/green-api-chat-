import React, { useState, useEffect, useRef } from 'react'
import type { ChatContact, ChatMessage } from '../types/greenApi'
import { formatPhoneNumber } from '../api/greenApi'
import {
  SendHorizontal,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  ArrowLeft,
  User,
  Shield,
  Smile,
  Paperclip,
  RotateCw,
} from 'lucide-react'

interface ChatAreaProps {
  activeChat: ChatContact | null
  messages: ChatMessage[]
  isSending: boolean
  onSendMessage: (text: string) => Promise<void>
  onRetryMessage?: (msg: ChatMessage) => void
  onBackToSidebar: () => void
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeChat,
  messages,
  isSending,
  onSendMessage,
  onRetryMessage,
  onBackToSidebar,
}) => {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('auto')
  }, [activeChat?.id])

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages])

  useEffect(() => {
    if (activeChat) {
      inputRef.current?.focus()
    }
  }, [activeChat?.id])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isSending) return

    setInputText('')
    await onSendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatMessageTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!activeChat) {
    return (
      <main className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f0f2f5] p-6 text-center select-none">
        <div className="max-w-md flex flex-col items-center">
          <div className="w-18 h-18 rounded-3xl bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-5">
            <Shield className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">MAX Messenger Web</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Выберите существующий чат из списка слева или нажмите кнопку «+», чтобы отправить
            первое сообщение на любой номер.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200/80 rounded-full text-[11px] text-gray-500 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Работает через протокол GREEN-API</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      {/* Background pattern overlay (subtle messenger aesthetic) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Chat header */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#f0f2f5] border-b border-gray-200 z-10 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSidebar}
            className="md:hidden p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-medium">
            <User className="w-5 h-5 text-gray-600" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {activeChat.name || formatPhoneNumber(activeChat.phoneNumber)}
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight">
              {activeChat.phoneNumber} • MAX / WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 md:px-8 space-y-2.5 z-10">
        {messages.length === 0 ? (
          <div className="flex justify-center my-8">
            <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-lg shadow-2xs text-xs text-gray-600 text-center max-w-xs">
              Сообщений пока нет. Напишите первое сообщение получателю.
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === 'me'
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-xl px-3.5 py-2 shadow-2xs relative text-sm break-words ${
                    isMe
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                      : 'bg-white text-[#111b21] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed pr-14 text-sm font-normal">
                    {msg.text}
                  </p>

                  <div className="absolute right-2.5 bottom-1 flex items-center gap-1 select-none">
                    <span className="text-[10px] text-gray-500 font-medium">
                      {formatMessageTime(msg.timestamp)}
                    </span>

                    {isMe && (
                      <span className="text-gray-500 flex items-center">
                        {msg.status === 'pending' && (
                          <Clock className="w-3 h-3 text-gray-400" />
                        )}
                        {msg.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                        {msg.status === 'delivered' && (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        {msg.status === 'error' && (
                          <button
                            type="button"
                            title="Ошибка отправки. Нажмите, чтобы повторить"
                            onClick={() => onRetryMessage?.(msg)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <RotateCw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <footer className="p-3 bg-[#f0f2f5] border-t border-gray-200 z-10">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto"
        >
          <div className="hidden sm:flex items-center text-gray-500 pb-2">
            <button
              type="button"
              className="p-1.5 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"
              title="Смайлы"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"
              title="Прикрепить"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all overflow-hidden flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите сообщение..."
              className="w-full px-4 py-2.5 text-sm bg-transparent border-none resize-none focus:outline-none max-h-32 text-gray-900 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </main>
  )
}
