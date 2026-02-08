import { LoaderFunctionArgs } from 'react-router-dom';
import { fetchAllProducts } from '../services/productService';
import { fetchAllCategories } from '../services/categoryService';
import { fetchAllCustomers } from '../services/customerService';

export const posLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const [productsData, categories, customers] = await Promise.all([
      fetchAllProducts('', undefined, undefined, 1, 50).catch(() => ({ products: [], totalCount: 0 })),
      fetchAllCategories().catch(() => []),
      fetchAllCustomers().catch(() => ({ customers: [] }))
    ]);

    return {
      products: productsData.products || [],
      categories: categories || [],
      customers: customers.customers || customers || []
    };
  } catch (error) {
    console.error('POS Loader Error:', error);
    return {
      products: [],
      categories: [],
      customers: []
    };
  }
};