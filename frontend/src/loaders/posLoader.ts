import { LoaderFunctionArgs } from 'react-router-dom';
import { fetchAllProducts } from '../services/productService';
import { fetchAllCategories } from '../services/categoryService';
import { fetchAllCustomers } from '../services/customerService';

export const posLoader = async ({ request }: LoaderFunctionArgs) => {
  const token = localStorage.getItem('token') || '';
  
  try {
    const [productsData, categories, customers] = await Promise.all([
      fetchAllProducts(token, undefined, undefined, 1, 50).catch(() => ({ products: [], totalCount: 0 })),
      fetchAllCategories(token).catch(() => []),
      fetchAllCustomers(token).catch(() => ({ customers: [] }))
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