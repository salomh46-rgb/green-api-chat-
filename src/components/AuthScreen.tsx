import React, { useState } from 'react'
import { getStateInstance } from '../api/greenApi'
import type { GreenApiCredentials } from '../types/greenApi'
import { KeyRound, Server, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'

interface AuthScreenProps {
  onLogin: (creds: GreenApiCredentials) => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedId = idInstance.trim()
    const trimmedToken = apiTokenInstance.trim()

    if (!trimmedId || !trimmedToken) {
      setError('Пожалуйста, заполните idInstance и apiTokenInstance')
      return
    }

    setLoading(true)

    const creds: GreenApiCredentials = {
      idInstance: trimmedId,
      apiTokenInstance: trimmedToken,
      apiUrl: apiUrl.trim() || undefined,
    }

    try {
      // Validate credentials against GREEN-API before proceeding
      const state = await getStateInstance(creds)
      if (state.stateInstance === 'notAuthorized') {
        setError(
          'Инстанс доступен, но не авторизован в мессенджере. Отсканируйте QR-код в личном кабинете GREEN-API.'
        )
        setLoading(false)
        return
      }

      onLogin(creds)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось подключиться к GREEN-API'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Вход в MAX Chat</h1>
          <p className="text-sm text-gray-500 mt-1">
            Интеграция с GREEN-API для отправки и приема сообщений
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              idInstance
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                placeholder="Например: 1101823456"
                className="w-full pl-3.5 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              apiTokenInstance
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value)}
                placeholder="Вставьте токен инстанса"
                className="w-full pl-3.5 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium"
            >
              <Server className="w-3.5 h-3.5" />
              {showAdvanced ? 'Скрыть адрес API' : 'Указать свой API URL (опционально)'}
            </button>

            {showAdvanced && (
              <div className="mt-2.5 animate-fadeIn">
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.green-api.com"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Оставьте пустым для стандартного кластера https://api.green-api.com
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Проверка подключения...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Войти в чат</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            Учетные данные можно получить в панели управления{' '}
            <a
              href="https://console.green-api.com/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline font-medium"
            >
              green-api.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
