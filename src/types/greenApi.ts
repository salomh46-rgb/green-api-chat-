export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl?: string
}

export type MessageSender = 'me' | 'them'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'error'

export interface ChatMessage {
  id: string
  chatId: string
  text: string
  sender: MessageSender
  timestamp: number
  status?: MessageStatus
}

export interface ChatContact {
  id: string // e.g. "79991234567@c.us"
  phoneNumber: string // clean digits, e.g. "79991234567"
  name?: string
  lastMessage?: string
  lastMessageTime?: number
  unreadCount: number
}

export interface InstanceStateResponse {
  stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting' | string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface DeleteNotificationResponse {
  result: boolean
}

export interface IncomingMessageWebhook {
  typeWebhook: 'incomingMessageReceived' | string
  instanceData: {
    idInstance: number
    wid: string
    typeInstance: string
  }
  timestamp: number
  idMessage: string
  senderData: {
    chatId: string
    chatName?: string
    sender: string
    senderName?: string
    senderContactName?: string
  }
  messageData: {
    typeMessage: string
    textMessageData?: {
      textMessage: string
    }
    extendedTextMessageData?: {
      text: string
    }
  }
}

export interface NotificationEnvelope {
  receiptId: number
  body: IncomingMessageWebhook | Record<string, unknown>
}
