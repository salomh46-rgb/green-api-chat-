import React, { useState } from 'react'
import type { ChatContact, GreenApiCredentials } from '../types/greenApi'
import { formatPhoneNumber } from '../api/greenApi'
import {
  MessageSquarePlus,
  LogOut,
  Search,
  Radio,
  User,
  Trash2,
} from 'lucide-react'

interface SidebarProps {
  credentials: GreenApiCredentials
  chats: ChatContact[]
  activeChatId: string | null
  isPolling: boolean
  onSelectChat: (chatId: string) => void
  onOpenNewChatModal: () => void
  onDeleteChat: (chatId: string) => void
  onLogout: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  credentials,
  chats,
  activeChatId,
  isPolling,
  onSelectChat,
  onOpenNewChatModal,
  onDeleteChat,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.phoneNumber.includes(q) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    )
  })

  const formatTime = (ts?: number) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white border-r border-gray-200 select-none">
      {/* Header bar */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 bg-[#f0f2f5]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm shadow-xs">
            {credentials.idInstance.slice(0, 2)}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <span>Инстанс: {credentials.idInstance}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isPolling ? 'Служба активна' : 'Подключение...'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNewChatModal}
            title="Создать новый чат"
            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            title="Выйти из аккаунта"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск диалогов..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f0f2f5] rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-400 text-gray-800"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-48">
            <Radio className="w-8 h-8 mb-2 stroke-[1.5] text-gray-300" />
            <p className="text-xs">
              {chats.length === 0 ? 'Нет активных диалогов' : 'Ничего не найдено'}
            </p>
            {chats.length === 0 && (
              <button
                onClick={onOpenNewChatModal}
                className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              >
                + Начать переписку
              </button>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-[#f0f2f5]'
                    : 'hover:bg-gray-50/90'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 font-medium">
                  <User className="w-5 h-5 text-gray-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {chat.name || formatPhoneNumber(chat.phoneNumber)}
                    </span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate pr-2">
                      {chat.lastMessage || 'Чат создан'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="min-w-4.5 h-4.5 px-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  title="Удалить чат"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
