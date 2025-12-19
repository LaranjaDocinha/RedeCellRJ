import { LoaderFunctionArgs } from 'react-router-dom';
import axios from 'axios';

// Helper function to get auth token (replace with your actual auth context or storage)
const getAuthToken = () => {
  // This is a placeholder. In a real app, you'd get the token from localStorage,
  // a Redux store, or your AuthContext.
  return localStorage.getItem('token'); 
};

export const customerDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const customerId = params.id;
  const token = getAuthToken(); // Replace with actual token retrieval

  if (!customerId) {
    throw new Response("Customer ID is required", { status: 400 });
  }
  if (!token) {
    throw new Response("Authentication token missing", { status: 401 });
  }

  try {
    const [customerRes, commsRes] = await Promise.all([
      axios.get(`/api/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`/api/customers/${customerId}/communications`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (customerRes.status !== 200) {
      throw new Response("Failed to fetch customer data", { status: customerRes.status });
    }
    if (commsRes.status !== 200) {
      throw new Response("Failed to fetch customer communications", { status: commsRes.status });
    }

    return { customer: customerRes.data, communications: commsRes.data };
  } catch (error: any) {
    console.error("Error in customerDetailLoader:", error);
    // Properly handle different error types, e.g., network errors, API errors
    throw new Response(error.response?.data?.message || "Internal Server Error", { status: error.response?.status || 500 });
  }
};
