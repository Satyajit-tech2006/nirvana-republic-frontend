const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  // Authentication & Profile
  AUTH: {
    REGISTER: `${API_BASE_URL}/users/register`,
    LOGIN: `${API_BASE_URL}/users/login`,
    LOGOUT: `${API_BASE_URL}/users/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/users/refresh-token`,
    ME: `${API_BASE_URL}/users/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/update-profile`,
    ADD_ADDRESS: `${API_BASE_URL}/users/addresses`,
    DELETE_ADDRESS: (addressId: string) =>
      `${API_BASE_URL}/users/addresses/${addressId}`,
  },

  // Product Catalog & Traceability
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/products`,
    GET_FEATURED: `${API_BASE_URL}/products/featured`,
    GET_BY_SLUG: (slug: string) => `${API_BASE_URL}/products/slug/${slug}`,
    CREATE: `${API_BASE_URL}/products`,
    UPDATE: (id: string) => `${API_BASE_URL}/products/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/products/${id}`,
  },

  // Orders & Fulfillment
  ORDERS: {
    CREATE: `${API_BASE_URL}/orders`,
    MY_ORDERS: `${API_BASE_URL}/orders/my-orders`,
    GET_BY_ID: (orderId: string) => `${API_BASE_URL}/orders/${orderId}`,
    VERIFY_PAYMENT: (orderId: string) =>
      `${API_BASE_URL}/orders/${orderId}/verify-payment`,
    ADMIN_ALL: `${API_BASE_URL}/orders/admin/all`,
    UPDATE_STATUS: (orderId: string) =>
      `${API_BASE_URL}/orders/${orderId}/status`,
  },

  // Customer Reviews
  REVIEWS: {
    GET_BY_PRODUCT: (productId: string) =>
      `${API_BASE_URL}/reviews/product/${productId}`,
    CREATE: `${API_BASE_URL}/reviews`,
    DELETE: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
  },

  // Editorial Journal & Wellness Rituals
  JOURNAL: {
    GET_ARTICLES: `${API_BASE_URL}/journal`,
    GET_BY_SLUG: (slug: string) => `${API_BASE_URL}/journal/slug/${slug}`,
    CREATE: `${API_BASE_URL}/journal`,
    UPDATE: (id: string) => `${API_BASE_URL}/journal/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/journal/${id}`,
  },

  // System
  PING: `${API_BASE_URL}/ping`,
} as const;

export default ENDPOINTS;