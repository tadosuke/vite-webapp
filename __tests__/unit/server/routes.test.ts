import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { createRouter } from '../../../server/routes.js'

// api-controller モジュールをモック
vi.mock('../../../server/api-controller.js', () => ({
  handleEcho: vi.fn((req, res) => {
    res.json({ message: 'mocked response' })
  }),
  getMessages: vi.fn((req, res) => {
    res.json([{ id: 1, text: 'mocked message', timestamp: '2023-01-01 00:00:00' }])
  }),
  clearMessages: vi.fn((req, res) => {
    res.json({ success: true })
  }),
  getConversations: vi.fn((req, res) => {
    res.json([{ id: 1, title: 'mocked conversation', created_at: '2023-01-01 00:00:00' }])
  }),
  getConversationMessages: vi.fn((req, res) => {
    res.json([{ id: 1, text: 'mocked message', timestamp: '2023-01-01 00:00:00', sender: 'user' }])
  }),
  deleteConversation: vi.fn((req, res) => {
    res.json({ success: true })
  })
}))

describe('routes', () => {
  describe('createRouter', () => {
    it('ルーターインスタンスを作成する', () => {
      const router = createRouter()
      expect(router).toBeDefined()
    })

    it('POST /echo エンドポイントが設定されている', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .post('/api/echo')
        .send({ message: 'test' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'mocked response' })
    })

    it('未定義のルートに対して404を返す', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .get('/api/nonexistent')

      expect(response.status).toBe(404)
    })

    it('/echo エンドポイントのGETに対して404を返す', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .get('/api/echo')

      expect(response.status).toBe(404)
    })

    it('/echo エンドポイントのPUTに対して404を返す', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .put('/api/echo')
        .send({ message: 'test' })

      expect(response.status).toBe(404)
    })

    it('/echo エンドポイントのDELETEに対して404を返す', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .delete('/api/echo')

      expect(response.status).toBe(404)
    })

    it('POST /messages エンドポイントは存在しないため404を返す', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .post('/api/messages')
        .send({ message: 'test', sender: 'user' })

      expect(response.status).toBe(404)
    })

    it('DELETE /messages エンドポイントが設定されている', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .delete('/api/messages')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true })
    })

    it('DELETE /conversations/:conversationId エンドポイントが設定されている', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .delete('/api/conversations/123')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true })
    })
  })
})