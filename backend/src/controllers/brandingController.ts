// backend/src/controllers/brandingController.ts
import { Request, Response, NextFunction } from 'express';
import { query } from '../db/index.js';

export const getBrandingConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let franchiseId = (req as any).user?.franchiseId || req.query.franchiseId || 'default';
    
    if (!franchiseId || franchiseId === '') {
      franchiseId = 'default';
    }
      'SELECT * FROM system_branding WHERE franchise_id = $1',
      [franchiseId]
    );

    if (result.rows.length === 0) {
      // Se não existir, retorna o padrão e já cria no banco para futuras edições
      const defaultConfig = {
        franchiseId: 'default',
        logoUrl: '/logo.svg',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        fontFamily: 'Roboto, sans-serif',
        faviconUrl: '/favicon.ico',
        appName: 'Redecell PDV',
      };
      
      // Tenta inserir se for o default
      if (franchiseId === 'default') {
         await query(
            `INSERT INTO system_branding (franchise_id, logo_url, primary_color, secondary_color, font_family, favicon_url, app_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
            [defaultConfig.franchiseId, defaultConfig.logoUrl, defaultConfig.primaryColor, defaultConfig.secondaryColor, defaultConfig.fontFamily, defaultConfig.faviconUrl, defaultConfig.appName]
         );
         return res.status(200).json(defaultConfig);
      }
      return res.status(200).json(defaultConfig);
    }

    const config = result.rows[0];
    // Converter snake_case do banco para camelCase do frontend
    res.status(200).json({
      logoUrl: config.logo_url,
      primaryColor: config.primary_color,
      secondaryColor: config.secondary_color,
      fontFamily: config.font_family,
      faviconUrl: config.favicon_url,
      appName: config.app_name,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrandingConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let franchiseId = (req as any).user?.franchiseId || req.query.franchiseId || 'default';
    
    if (!franchiseId || franchiseId === '') {
      franchiseId = 'default';
    }
    
    const { logoUrl, primaryColor, secondaryColor, fontFamily, faviconUrl, appName } = req.body;

    const result = await query(
      `INSERT INTO system_branding (franchise_id, logo_url, primary_color, secondary_color, font_family, favicon_url, app_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (franchise_id) 
       DO UPDATE SET 
         logo_url = EXCLUDED.logo_url,
         primary_color = EXCLUDED.primary_color,
         secondary_color = EXCLUDED.secondary_color,
         font_family = EXCLUDED.font_family,
         favicon_url = EXCLUDED.favicon_url,
         app_name = EXCLUDED.app_name,
         updated_at = current_timestamp
       RETURNING *`,
      [franchiseId, logoUrl, primaryColor, secondaryColor, fontFamily, faviconUrl, appName]
    );

    const config = result.rows[0];
    res.status(200).json({
      logoUrl: config.logo_url,
      primaryColor: config.primary_color,
      secondaryColor: config.secondary_color,
      fontFamily: config.font_family,
      faviconUrl: config.favicon_url,
      appName: config.app_name,
    });
  } catch (error) {
    next(error);
  }
};