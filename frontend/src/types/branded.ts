// Utility for Branded Types
// Isso impede que uma string genérica seja passada onde se espera um ID específico

export type Brand<K, T> = K & { __brand: T };

// String IDs (UUIDs)
export type UserId = Brand<string, 'UserId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type OrderId = Brand<string, 'OrderId'>; // Vendas geralmente são UUID ou string longa
export type ServiceOrderId = Brand<string, 'ServiceOrderId'>; // Verificar se é number ou string

// Number IDs (Serial)
export type ProductId = Brand<number, 'ProductId'>;
export type CategoryId = Brand<number, 'CategoryId'>;
export type VariationId = Brand<number, 'VariationId'>;
export type BranchId = Brand<number, 'BranchId'>;

// Helpers casting
export const toUserId = (id: string) => id as UserId;
export const toCustomerId = (id: string) => id as CustomerId;
export const toOrderId = (id: string) => id as OrderId;
export const toServiceOrderId = (id: string) => id as ServiceOrderId;

export const toProductId = (id: number) => id as ProductId;
export const toCategoryId = (id: number) => id as CategoryId;
export const toVariationId = (id: number) => id as VariationId;
export const toBranchId = (id: number) => id as BranchId;