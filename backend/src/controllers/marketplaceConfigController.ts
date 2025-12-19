import { Request, Response } from 'express';
import { marketplaceSyncService } from '../services/marketplaceSyncService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';

export const marketplaceConfigController = {
  // --- Integrações ---
  getAllIntegrations: catchAsync(async (req: Request, res: Response) => {
    const integrations = await marketplaceSyncService.getIntegrationConfigs();
    res.json(integrations);
  }),

  createIntegration: catchAsync(async (req: Request, res: Response) => {
    const { name, apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive } = req.body;
    if (!name) {
      throw new AppError('Name is required', 400);
    }
    const newIntegration = await marketplaceSyncService.createIntegration(name, {
      apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive
    });
    res.status(201).json(newIntegration);
  }),

  updateIntegration: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive } = req.body;
    const updatedIntegration = await marketplaceSyncService.updateIntegration(Number(id), {
      name, apiKey, apiSecret, accessToken, refreshToken, tokenExpiresAt, isActive
    });
    res.json(updatedIntegration);
  }),

  deleteIntegration: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await marketplaceSyncService.deleteIntegration(Number(id));
    res.status(204).send();
  }),

  // --- Listings ---
  getAllListings: catchAsync(async (req: Request, res: Response) => {
    const listings = await marketplaceSyncService.getListings();
    res.json(listings);
  }),

  createListing: catchAsync(async (req: Request, res: Response) => {
    const { marketplaceId, productVariationId, externalId, externalUrl } = req.body;
    if (!marketplaceId || !productVariationId || !externalId) {
      throw new AppError('Marketplace ID, Product Variation ID, and External ID are required', 400);
    }
    const newListing = await marketplaceSyncService.createListing(
      Number(marketplaceId),
      Number(productVariationId),
      externalId,
      externalUrl
    );
    res.status(201).json(newListing);
  }),

  updateListing: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { marketplaceId, productVariationId, externalId, externalUrl, status } = req.body;
    const updatedListing = await marketplaceSyncService.updateListing(Number(id), {
      marketplaceId: Number(marketplaceId), productVariationId: Number(productVariationId), externalId, externalUrl, status
    });
    res.json(updatedListing);
  }),

  deleteListing: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await marketplaceSyncService.deleteListing(Number(id));
    res.status(204).send();
  }),

  // --- Disparo manual de Sincronização ---
  syncOrdersManually: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    if (!integrationId) {
      throw new AppError('Integration ID is required', 400);
    }
    await marketplaceSyncService.syncMarketplaceOrders(Number(integrationId));
    res.json({ message: `Sincronização de pedidos para integração ${integrationId} iniciada.` });
  }),

  syncStockManually: catchAsync(async (req: Request, res: Response) => {
    const { variationId } = req.params;
    const { newQuantity } = req.body;
    if (!variationId || newQuantity === undefined) {
      throw new AppError('Variation ID and new quantity are required', 400);
    }
    await marketplaceSyncService.updateStock(Number(variationId), Number(newQuantity));
    res.json({ message: `Sincronização de estoque para variação ${variationId} iniciada.` });
  }),
};
