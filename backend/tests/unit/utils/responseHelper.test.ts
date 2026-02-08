import { describe, it, expect, vi } from 'vitest';
import { ResponseHelper, sendSuccess, sendError } from '../../../src/utils/responseHelper.js';
import { Response } from 'express';

describe('ResponseHelper', () => {
  const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  describe('ResponseHelper object', () => {
    it('should send success response', () => {
      const res = mockResponse();
      ResponseHelper.success(res, { foo: 'bar' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: { foo: 'bar' } });
    });

    it('should send created response', () => {
      const res = mockResponse();
      ResponseHelper.created(res, { id: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: { id: 1 } });
    });

    it('should send fail response', () => {
      const res = mockResponse();
      ResponseHelper.fail(res, { error: 'bad' }, 400);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ status: 'fail', data: { error: 'bad' } });
    });

    it('should send error response', () => {
      const res = mockResponse();
      ResponseHelper.error(res, 'Broken', 'ERR_CODE', 500);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Broken', code: 'ERR_CODE' });
    });
  });

  describe('Named Exports', () => {
    it('sendSuccess should call success by default', () => {
      const res = mockResponse();
      sendSuccess(res, 'ok');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sendSuccess should call created if status 201', () => {
      const res = mockResponse();
      sendSuccess(res, 'ok', 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('sendError should call fail for 4xx', () => {
      const res = mockResponse();
      sendError(res, 'Bad', 'CODE', 400);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail' }));
    });

    it('sendError should call error for 5xx', () => {
      const res = mockResponse();
      sendError(res, 'Server Error', 'CODE', 500);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'error' }));
    });
  });
});
