import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  normalizeBaseUrl,
  normalizeChatId,
  formatPhoneNumber,
  getStateInstance,
  sendMessage,
  receiveNotification,
  deleteNotification,
} from '../greenApi'

describe('greenApi utility functions', () => {
  describe('normalizeBaseUrl', () => {
    it('returns default URL when undefined or empty', () => {
      expect(normalizeBaseUrl()).toBe('https://api.green-api.com')
      expect(normalizeBaseUrl('')).toBe('https://api.green-api.com')
      expect(normalizeBaseUrl('   ')).toBe('https://api.green-api.com')
    })

    it('trims trailing slashes from custom URLs', () => {
      expect(normalizeBaseUrl('https://7103.api.green-api.com/')).toBe(
        'https://7103.api.green-api.com'
      )
      expect(normalizeBaseUrl('https://custom-host.com///')).toBe(
        'https://custom-host.com'
      )
    })
  })

  describe('normalizeChatId', () => {
    it('preserves chat IDs that already have @ domain', () => {
      expect(normalizeChatId('79991234567@c.us')).toBe('79991234567@c.us')
      expect(normalizeChatId('123456789-987654@g.us')).toBe('123456789-987654@g.us')
    })

    it('formats plain phone numbers with @c.us suffix', () => {
      expect(normalizeChatId('79991234567')).toBe('79991234567@c.us')
      expect(normalizeChatId('+7 (999) 123-45-67')).toBe('79991234567@c.us')
      expect(normalizeChatId('998901234567')).toBe('998901234567@c.us')
    })

    it('converts Russian 8-prefix numbers (8999...) to 7999...', () => {
      expect(normalizeChatId('89991234567')).toBe('79991234567@c.us')
      expect(normalizeChatId('8 (916) 555-44-33')).toBe('79165554433@c.us')
    })
  })

  describe('formatPhoneNumber', () => {
    it('formats Russian/Kazakh numbers cleanly', () => {
      expect(formatPhoneNumber('79991234567@c.us')).toBe('+7 (999) 123-45-67')
      expect(formatPhoneNumber('89991234567')).toBe('+7 (999) 123-45-67')
    })

    it('formats Uzbek numbers cleanly', () => {
      expect(formatPhoneNumber('998901234567@c.us')).toBe('+998 (90) 123-45-67')
    })

    it('falls back to +digits for other international numbers', () => {
      expect(formatPhoneNumber('14155552671@c.us')).toBe('+14155552671')
    })
  })
})

describe('greenApi HTTP methods', () => {
  const mockCreds = {
    idInstance: '1101823456',
    apiTokenInstance: 'test_token_123',
    apiUrl: 'https://api.green-api.com',
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getStateInstance makes correct GET request and parses response', async () => {
    const mockResponse = { stateInstance: 'authorized' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await getStateInstance(mockCreds)
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/getStateInstance/test_token_123',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('getStateInstance throws on HTTP error with response text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Invalid credentials', { status: 401, statusText: 'Unauthorized' })
    )

    await expect(getStateInstance(mockCreds)).rejects.toThrow(
      'Ошибка проверки инстанса (401)'
    )
  })

  it('sendMessage sends properly formatted JSON payload', async () => {
    const mockResponse = { idMessage: 'BAE56789' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await sendMessage(mockCreds, '8 (999) 123-45-67', 'Привет')
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/sendMessage/test_token_123',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chatId: '79991234567@c.us',
          message: 'Привет',
        }),
      })
    )
  })

  it('receiveNotification handles empty queue (null)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('null', { status: 200, headers: { 'Content-Type': 'application/json' } })
    )

    const result = await receiveNotification(mockCreds)
    expect(result).toBeNull()
  })

  it('deleteNotification sends DELETE request with receiptId', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ result: true }), { status: 200 })
    )

    const result = await deleteNotification(mockCreds, 987654)
    expect(result).toEqual({ result: true })
    expect(fetch).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1101823456/deleteNotification/test_token_123/987654',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
