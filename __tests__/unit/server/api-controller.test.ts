import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { handleEcho, getMessages, clearMessages, deleteConversation } from '../../../server/api-controller.js'

// greeting モジュールをモック
vi.mock('../../../server/greeting.js', () => ({
  echo: vi.fn((message: string) => message)
}))

// db モジュールをモック
const mockSaveMessage = vi.fn()
const mockGetMessages = vi.fn()
const mockClearMessages = vi.fn()
const mockCreateConversation = vi.fn()
const mockGetConversations = vi.fn()
const mockGetMessagesByConversationId = vi.fn()
const mockDeleteConversation = vi.fn()
vi.mock('../../../server/db.js', () => ({
  getDatabase: () => ({
    saveMessage: mockSaveMessage,
    getMessages: mockGetMessages,
    clearMessages: mockClearMessages,
    createConversation: mockCreateConversation,
    getConversations: mockGetConversations,
    getMessagesByConversationId: mockGetMessagesByConversationId,
    deleteConversation: mockDeleteConversation
  })
}))

describe('api-controller', () => {
  const createMockRequest = (body: any = {}, params: any = {}): Request => ({
    body,
    params
  } as Request)

  const createMockResponse = (): { res: Response; json: any; status: any } => {
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const res = { json, status } as unknown as Response
    return { res, json, status }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleEcho', () => {

    it('有効な文字列が提供された場合、メッセージを返し、ユーザーとエコーメッセージを保存する', async () => {
      const req = createMockRequest({ message: 'Hello, World!' })
      const { res, json } = createMockResponse()

      mockCreateConversation.mockResolvedValue({ id: 1, title: 'Hello, World!' })
      mockSaveMessage.mockResolvedValue({ id: 1, text: 'Hello, World!' })

      await handleEcho(req, res)

      // 新しい会話が作成されることを確認（conversationIdが指定されていないため）
      expect(mockCreateConversation).toHaveBeenCalledTimes(1)
      expect(mockCreateConversation).toHaveBeenCalledWith('Hello, World!')
      
      // ユーザーメッセージとエコーメッセージの両方が保存されることを確認
      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, 'Hello, World!', 'user', 1)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, 'Hello, World!', 'echo', 1)
      expect(json).toHaveBeenCalledWith({ message: 'Hello, World!', conversationId: 1 })
    })

    it('メッセージが文字列でない場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: 123 })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('メッセージがnullの場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: null })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('メッセージがundefinedの場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: undefined })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('メッセージがオブジェクトの場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: { text: 'hello' } })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('メッセージが配列の場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: ['hello'] })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('空文字列のメッセージを処理し、データベースに保存する', async () => {
      const req = createMockRequest({ message: '' })
      const { res, json } = createMockResponse()

      mockCreateConversation.mockResolvedValue({ id: 1, title: '' })
      mockSaveMessage.mockResolvedValue({ id: 1, text: '' })

      await handleEcho(req, res)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, '', 'user', 1)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, '', 'echo', 1)
      expect(json).toHaveBeenCalledWith({ message: '', conversationId: 1 })
    })

    it('リクエストボディにmessageプロパティがない場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({})
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest({ message: 'Test message' })
      const { res, json, status } = createMockResponse()

      mockSaveMessage.mockRejectedValue(new Error('DB Error'))

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('getMessages', () => {
    const createMockRequest = (): Request => ({} as Request)

    const createMockResponse = (): { res: Response; json: any; status: any } => {
      const json = vi.fn()
      const status = vi.fn(() => ({ json }))
      const res = { json, status } as unknown as Response
      return { res, json, status }
    }

    it('メッセージ一覧を正常に取得して返す', async () => {
      const req = createMockRequest()
      const { res, json } = createMockResponse()

      const mockMessages = [
        { id: 1, text: 'Message 1', sender: 'user', timestamp: '2023-01-01 00:00:00' },
        { id: 2, text: 'Message 2', sender: 'echo', timestamp: '2023-01-01 00:01:00' }
      ]
      mockGetMessages.mockResolvedValue(mockMessages)

      await getMessages(req, res)

      expect(mockGetMessages).toHaveBeenCalled()
      expect(json).toHaveBeenCalledWith(mockMessages)
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest()
      const { res, json, status } = createMockResponse()

      mockGetMessages.mockRejectedValue(new Error('DB Error'))

      await getMessages(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Database error' })
    })
  })

  describe('clearMessages', () => {
    const createMockRequest = (): Request => ({} as Request)

    const createMockResponse = (): { res: Response; json: any; status: any } => {
      const json = vi.fn()
      const status = vi.fn(() => ({ json }))
      const res = { json, status } as unknown as Response
      return { res, json, status }
    }

    it('正常にメッセージを削除し、成功レスポンスを返す', async () => {
      const req = createMockRequest()
      const { res, json } = createMockResponse()

      mockClearMessages.mockResolvedValue(undefined)

      await clearMessages(req, res)

      expect(mockClearMessages).toHaveBeenCalledTimes(1)
      expect(json).toHaveBeenCalledWith({ success: true })
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest()
      const { res, json, status } = createMockResponse()

      mockClearMessages.mockRejectedValue(new Error('DB Error'))

      await clearMessages(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Database error' })
    })
  })

  describe('deleteConversation', () => {
    it('有効な会話IDで会話を削除し、成功レスポンスを返す', async () => {
      const req = createMockRequest({}, { conversationId: '123' })
      const { res, json, status } = createMockResponse()

      mockDeleteConversation.mockResolvedValue(undefined)

      await deleteConversation(req, res)

      expect(mockDeleteConversation).toHaveBeenCalledWith(123)
      expect(json).toHaveBeenCalledWith({ success: true })
      expect(status).not.toHaveBeenCalled()
    })

    it('無効な会話ID（数値以外）の場合、400エラーを返す', async () => {
      const req = createMockRequest({}, { conversationId: 'invalid' })
      const { res, json, status } = createMockResponse()

      await deleteConversation(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid conversation ID' })
      expect(mockDeleteConversation).not.toHaveBeenCalled()
    })

    it('会話IDが空の場合、400エラーを返す', async () => {
      const req = createMockRequest({}, { conversationId: '' })
      const { res, json, status } = createMockResponse()

      await deleteConversation(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid conversation ID' })
      expect(mockDeleteConversation).not.toHaveBeenCalled()
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest({}, { conversationId: '123' })
      const { res, json, status } = createMockResponse()

      mockDeleteConversation.mockRejectedValue(new Error('DB Error'))

      await deleteConversation(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Database error' })
    })
  })
})