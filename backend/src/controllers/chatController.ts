import { Request, Response } from 'express';
import * as chatService from '../services/chatService.js';

export const startSession = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.body;
    const result = await chatService.startChatSession(customerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    const result = await chatService.sendMessage(sessionId, message);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }
    const history = await chatService.getChatHistory(sessionId as string);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
