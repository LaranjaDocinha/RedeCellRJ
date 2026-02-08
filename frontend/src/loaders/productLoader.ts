import { LoaderFunctionArgs } from 'react-router-dom';
import { fetchAllProducts, fetchProductById } from '../services/productService';

export const productListLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || undefined;
  const category = url.searchParams.get('category') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const sortBy = url.searchParams.get('sortBy') || undefined;
  const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  // Nota: Precisamos do token aqui. 
  // Em uma arquitetura real, podemos pegar do localStorage ou de um singleton de auth.
  const token = localStorage.getItem('token') || '';
  
  // Usamos Promise.all para buscar dados extras se necessário (ex: categorias)
  return fetchAllProducts(token, search, category, page, limit, sortBy, sortOrder);
};

export const productDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) throw new Error('Product ID is required');
  
  const token = localStorage.getItem('token') || '';
  return fetchProductById(id, token);
};
