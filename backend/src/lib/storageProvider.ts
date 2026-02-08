import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface IStorageProvider {
  saveFile(file: any, folder: string): Promise<string>;
  deleteFile(fileName: string, folder: string): Promise<void>;
  getUrl(fileName: string, folder: string): string;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir = path.resolve('uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: any, folder: string): Promise<string> {
    const folderPath = path.join(this.uploadDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(folderPath, fileName);

    // Supondo que 'file' é um objeto do Multer
    fs.renameSync(file.path, filePath);

    return fileName;
  }

  async deleteFile(fileName: string, folder: string): Promise<void> {
    const filePath = path.join(this.uploadDir, folder, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(fileName: string, folder: string): string {
    return `/uploads/${folder}/${fileName}`;
  }
}

/**
 * Placeholder para implementação futura de S3.
 * Segue a mesma interface, permitindo trocar o provider sem mudar o resto do código.
 */
export class S3StorageProvider implements IStorageProvider {
  async saveFile(_file: any, _folder: string): Promise<string> {
    logger.info('Saving file to S3...');
    // Implementação real com AWS SDK aqui
    return 's3-file-url';
  }

  async deleteFile(_fileName: string, _folder: string): Promise<void> {
    logger.info('Deleting file from S3...');
  }

  getUrl(fileName: string, folder: string): string {
    return `https://redecell-bucket.s3.amazonaws.com/${folder}/${fileName}`;
  }
}

// Injeção de Dependência Simples
export const storageProvider: IStorageProvider =
  process.env.STORAGE_TYPE === 's3' ? new S3StorageProvider() : new LocalStorageProvider();
