import React, { useState, useEffect, useRef } from 'react'
import { normalizeChatId } from '../api/greenApi'
import { UserPlus, X, Phone } from 'lucide-react'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (chatId: string, phone: string) => void
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
}) => {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPhone('')
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const raw = phone.trim()
    const digits = raw.replace(/\D/g, '')

    if (digits.length < 8 || digits.length > 16) {
      setError('Введите корректный номер телефона (от 8 до 16 цифр)')
      return
    }

    const chatId = normalizeChatId(digits)
    onCreateChat(chatId, digits)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Новый диалог</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Номер телефона получателя
          </label>
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Например: 79991234567"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <p className="text-[12px] text-gray-500 mb-5">
            Укажите номер с кодом страны без пробелов и спецсимволов.
          </p>

          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
            >
              Начать чат
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
