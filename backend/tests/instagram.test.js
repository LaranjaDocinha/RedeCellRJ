// backend/tests/instagram.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const instagramRouter = require('../routes/instagramRoutes');

const app = express();
// Mock do req.user que o authMiddleware normalmente adicionaria
app.use((req, res, next) => {
  req.user = { id: 1, name: 'Test User', role: 'admin' };
  next();
});
app.use('/api/instagram', instagramRouter);

// Mock do serviço para isolar o teste da lógica de negócio real
jest.mock('../services/instagramService', () => ({
  getAuthorizationUri: jest.fn(() => 'https://mock.facebook.com/dialog/oauth?client_id=TEST_ID&redirect_uri=TEST_URI&scope=instagram_basic'),
}));

describe('Instagram API Routes', () => {
  describe('GET /api/instagram/auth', () => {
    it('should redirect to the Instagram authorization URL', async () => {
      // Gerar um token JWT de teste
      const token = jwt.sign({ user: { id: 1, name: 'Test User', role: 'admin' } }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/instagram/auth')
        .set('Authorization', `Bearer ${token}`); // Adicionar o token ao cabeçalho

      // Espera um status de redirecionamento
      expect(response.statusCode).toBe(302); 
      
      // Verifica se o cabeçalho 'Location' aponta para a URL de autorização mockada
      expect(response.headers.location).toBe('https://mock.facebook.com/dialog/oauth?client_id=TEST_ID&redirect_uri=TEST_URI&scope=instagram_basic');
    });
  });
});

