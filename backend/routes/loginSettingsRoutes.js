// backend/routes/loginSettingsRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getLoginScreenSettings, updateLoginScreenSettings } = require('../controllers/loginSettingsController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const loginSettingsValidationRules = () => {
  return [
    body('background_type')
      .isIn(['solid', 'image', 'video', 'gradient'])
      .withMessage('Tipo de fundo inválido. Deve ser solid, image, video ou gradient.'),

    // Validação condicional para background_type 'solid'
    body('background_solid_color')
      .if(body('background_type').equals('solid'))
      .notEmpty().withMessage('Cor sólida é obrigatória para tipo solid.')
      .isHexColor().withMessage('Cor sólida deve ser um código hexadecimal válido.'),

    // Validação condicional para background_type 'image'
    body('background_image_url')
      .if(body('background_type').equals('image'))
      .notEmpty().withMessage('URL da imagem é obrigatória para tipo image.')
      .isURL().withMessage('URL da imagem deve ser uma URL válida.'),
    body('image_size')
      .if(body('background_type').equals('image'))
      .isIn(['cover', 'contain', 'auto']).withMessage('Tamanho da imagem inválido.'),
    body('image_repeat')
      .if(body('background_type').equals('image'))
      .isIn(['repeat', 'no-repeat', 'repeat-x', 'repeat-y']).withMessage('Repetição da imagem inválida.'),

    // Validação condicional para background_type 'video'
    body('background_video_url')
      .if(body('background_type').equals('video'))
      .notEmpty().withMessage('URL do vídeo é obrigatória para tipo video.')
      .isURL().withMessage('URL do vídeo deve ser uma URL válida.'),

    // Validação condicional para background_type 'gradient'
    body('gradient_color_1')
      .if(body('background_type').equals('gradient'))
      .notEmpty().withMessage('Cor 1 do gradiente é obrigatória para tipo gradient.')
      .matches(/^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/)
      .withMessage('Cor 1 do gradiente deve ser um código hexadecimal ou RGB válido.'),
    body('gradient_color_2')
      .if(body('background_type').equals('gradient'))
      .notEmpty().withMessage('Cor 2 do gradiente é obrigatória para tipo gradient.')
      .matches(/^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/)
      .withMessage('Cor 2 do gradiente deve ser um código hexadecimal ou RGB válido.'),
    body('gradient_color_3')
      .if(body('background_type').equals('gradient'))
      .matches(/^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/)
      .withMessage('Cor 3 do gradiente deve ser um código hexadecimal ou RGB válido.').optional(),
    body('gradient_color_4')
      .if(body('background_type').equals('gradient'))
      .matches(/^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/)
      .withMessage('Cor 4 do gradiente deve ser um código hexadecimal ou RGB válido.').optional(),
    body('gradient_speed')
      .if(body('background_type').equals('gradient'))
      .isInt({ min: 1 }).withMessage('Velocidade do gradiente deve ser um número inteiro positivo.').optional(),
    body('gradient_direction')
      .if(body('background_type').equals('gradient'))
      .isInt().withMessage('Direção do gradiente deve ser um número inteiro.').optional(),

    // Campos que devem ser nulos se não forem do tipo correspondente
    body('background_solid_color')
      .if(body('background_type').not().equals('solid'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('background_solid_color deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('background_image_url')
      .if(body('background_type').not().equals('image'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('background_image_url deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('image_size')
      .if(body('background_type').not().equals('image'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('image_size deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('image_repeat')
      .if(body('background_type').not().equals('image'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('image_repeat deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('background_video_url')
      .if(body('background_type').not().equals('video'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('background_video_url deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('gradient_color_1')
      .if(body('background_type').not().equals('gradient'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('gradient_color_1 deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('gradient_color_2')
      .if(body('background_type').not().equals('gradient'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('gradient_color_2 deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('gradient_color_3')
      .if(body('background_type').not().equals('gradient'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('gradient_color_3 deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('gradient_color_4')
      .if(body('background_type').not().equals('gradient'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('gradient_color_4 deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('gradient_speed')
      .if(body('background_type').not().equals('gradient'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('gradient_speed deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
    body('gradient_direction')
      .if(body('background_type').not().equals('gradient'))
      .custom((value, { req }) => {
        if (value !== null) throw new Error('gradient_direction deve ser nulo para este tipo de fundo.');
        return true;
      }).optional(),
  ];
};

// Rota PÚBLICA para obter as configurações da tela de login
// Qualquer pessoa (mesmo não autenticada) pode acessar para renderizar a página de login.
router.get('/login-screen', getLoginScreenSettings);

// Rota PROTEGIDA para atualizar as configurações da tela de login
// Apenas administradores podem acessar esta rota.
router.put(
  '/login-screen',
  [authenticateToken, authorize('admin')],
  loginSettingsValidationRules(),
  validate,
  updateLoginScreenSettings
);

module.exports = router;
