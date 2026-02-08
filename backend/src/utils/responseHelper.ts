import { Response } from 'express';

/**
 * Padrão JSend para respostas da API.
 * https://github.com/omniti-labs/jsend
 */

type SuccessResponse<T> = {
  status: 'success';
  data: T;
  meta?: any;
};

type FailResponse = {
  status: 'fail';
  data: any; // Detalhes da validação ou erro de negócio
};

type ErrorResponse = {
  status: 'error';
  message: string;
  code?: string;
  data?: any;
};

export const ResponseHelper = {
  /**
   * Retorna uma resposta de sucesso (200 OK).
   */
  success: <T>(res: Response, data: T, meta?: any) => {
    const response: SuccessResponse<T> = {
      status: 'success',
      data,
      meta,
    };
    return res.status(200).json(response);
  },

  /**
   * Retorna uma resposta de criação (201 Created).
   */
  created: <T>(res: Response, data: T) => {
    const response: SuccessResponse<T> = {
      status: 'success',
      data,
    };
    return res.status(201).json(response);
  },

  /**
   * Retorna uma falha de validação ou erro de negócio (400-499).
   * Ex: "Email inválido", "Produto sem estoque".
   */
  fail: (res: Response, data: any, statusCode = 400) => {
    const response: FailResponse = {
      status: 'fail',
      data,
    };
    return res.status(statusCode).json(response);
  },

  /**
   * Retorna um erro do sistema (500).
   * Ex: "Banco de dados fora do ar".
   */
  error: (res: Response, message: string, code?: string, statusCode = 500, data?: any) => {
    const response: ErrorResponse = {
      status: 'error',
      message,
      code,
      data,
    };
    return res.status(statusCode).json(response);
  },
};

/**
 * Helper functions for named exports used throughout the project
 */
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  if (statusCode === 201) return ResponseHelper.created(res, data);
  return ResponseHelper.success(res, data);
};

export const sendError = (

  res: Response,

  message: string,

  code?: string,

  statusCode = 500,

  data?: any,

) => {

  if (statusCode >= 400 && statusCode < 500) {

        let failData: any;

        if (Array.isArray(data)) {

          failData = { errors: data, message, code };

        } else if (typeof data === 'object' && data !== null) {

          failData = { ...data, message, code };

        } else {

          failData = { message, code, details: data };

        }

    

    return ResponseHelper.fail(res, failData, statusCode);

  }

  return ResponseHelper.error(res, message, code, statusCode, data);

};


