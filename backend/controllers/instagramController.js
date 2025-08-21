const db = require('../db');
const { AppError } = require('../utils/appError');

exports.redirectToAuth = async (req, res, next) => {
  try {
    const instagramAppId = process.env.INSTAGRAM_APP_ID;
    const instagramRedirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!instagramAppId || !instagramRedirectUri) {
      return next(new AppError('Variáveis de ambiente INSTAGRAM_APP_ID ou INSTAGRAM_REDIRECT_URI não configuradas.', 500));
    }

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${instagramRedirectUri}&scope=user_profile,user_media&response_type=code`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error redirecting to Instagram auth:', error);
    next(new AppError('Erro ao iniciar autenticação com Instagram.', 500));
  }
};

