import { Request, Response } from 'express';
import * as webhookService from '../services/webhookService.js';

export const createWebhook = async (req: Request, res: Response) => {
  try {
    const { event_type, callback_url, secret } = req.body;
    const webhook = await webhookService.createWebhook(event_type, callback_url, secret);
    res.status(201).json(webhook);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWebhookStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const webhook = await webhookService.updateWebhookStatus(parseInt(id, 10), is_active);
    if (webhook) {
      res.json(webhook);
    } else {
      res.status(404).json({ message: 'Webhook not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const webhook = await webhookService.deleteWebhook(parseInt(id, 10));
    if (webhook) {
      res.json({ message: 'Webhook deleted successfully' });
    } else {
      res.status(404).json({ message: 'Webhook not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const webhooks = await webhookService.getWebhooks();
    res.json(webhooks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Dummy endpoint to simulate a trigger
export const simulateWebhookTrigger = async (req: Request, res: Response) => {
  try {
    const { event_type, payload } = req.body;
    await webhookService.triggerWebhook(event_type, payload);
    res.json({ message: `Simulated trigger for event ${event_type}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
