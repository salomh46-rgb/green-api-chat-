import type {
  DeleteNotificationResponse,
  GreenApiCredentials,
  InstanceStateResponse,
  NotificationEnvelope,
  SendMessageResponse,
} from '../types/greenApi'

const DEFAULT_API_URL = 'https://api.green-api.com'

export function normalizeBaseUrl(url?: string): string {
  if (!url || !url.trim()) return DEFAULT_API_URL
  return url.trim().replace(/\/+$/, '')
}

export function normalizeChatId(input: string): string {
  const trimmed = input.trim()
  if (trimmed.includes('@')) {
    return trimmed
  }
  let digitsOnly = trimmed.replace(/\D/g, '')
  // Normalize Russian domestic 8XXXXXXXXXX format to international 7XXXXXXXXXX
  if (digitsOnly.length === 11 && digitsOnly.startsWith('8')) {
    digitsOnly = '7' + digitsOnly.slice(1)
  }
  return `${digitsOnly}@c.us`
}

export function formatPhoneNumber(chatIdOrPhone: string): string {
  let digits = chatIdOrPhone.replace(/@.*$/, '').replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`
  }
  return digits ? `+${digits}` : chatIdOrPhone
}

export async function getStateInstance(
  creds: GreenApiCredentials,
  signal?: AbortSignal
): Promise<InstanceStateResponse> {
  const baseUrl = normalizeBaseUrl(creds.apiUrl)
  const url = `${baseUrl}/waInstance${creds.idInstance}/getStateInstance/${creds.apiTokenInstance}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Ошибка проверки инстанса (${response.status}): ${errorText || response.statusText}`
    )
  }

  return response.json()
}

export async function sendMessage(
  creds: GreenApiCredentials,
  chatId: string,
  message: string
): Promise<SendMessageResponse> {
  const baseUrl = normalizeBaseUrl(creds.apiUrl)
  const url = `${baseUrl}/waInstance${creds.idInstance}/sendMessage/${creds.apiTokenInstance}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: normalizeChatId(chatId),
      message,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Ошибка отправки сообщения (${response.status}): ${errorText || response.statusText}`
    )
  }

  return response.json()
}

export async function receiveNotification(
  creds: GreenApiCredentials,
  signal?: AbortSignal
): Promise<NotificationEnvelope | null> {
  const baseUrl = normalizeBaseUrl(creds.apiUrl)
  const url = `${baseUrl}/waInstance${creds.idInstance}/receiveNotification/${creds.apiTokenInstance}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Ошибка получения уведомления (${response.status}): ${errorText || response.statusText}`
    )
  }

  const data = await response.json()
  return data ?? null
}

export async function deleteNotification(
  creds: GreenApiCredentials,
  receiptId: number
): Promise<DeleteNotificationResponse> {
  const baseUrl = normalizeBaseUrl(creds.apiUrl)
  const url = `${baseUrl}/waInstance${creds.idInstance}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Ошибка удаления уведомления (${response.status}): ${errorText || response.statusText}`
    )
  }

  return response.json()
}
