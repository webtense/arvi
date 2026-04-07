const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem('arvi_token');
  }

  setToken(token) {
    localStorage.setItem('arvi_token', token);
  }

  removeToken() {
    localStorage.removeItem('arvi_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error de servidor' }));
        throw new Error(error.error || 'Error en la solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    this.removeToken();
  }

  // Invoices
  async getInvoices() {
    return this.request('/invoices');
  }

  async createInvoice(invoice) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  async updateInvoice(id, invoice) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  }

  async deleteInvoice(id) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Budgets
  async getBudgets() {
    return this.request('/budgets');
  }

  async createBudget(budget) {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  async updateBudget(id, budget) {
    return this.request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  }

  async deleteBudget(id) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // Parts
  async getParts() {
    return this.request('/parts');
  }

  async createPart(part) {
    return this.request('/parts', {
      method: 'POST',
      body: JSON.stringify(part),
    });
  }

  async updatePart(id, part) {
    return this.request(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(part),
    });
  }

  async deletePart(id) {
    return this.request(`/parts/${id}`, {
      method: 'DELETE',
    });
  }

  // Assets
  async getAssets() {
    return this.request('/assets');
  }

  async createAsset(asset) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
    });
  }

  async updateAsset(id, asset) {
    return this.request(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(asset),
    });
  }

  async deleteAsset(id) {
    return this.request(`/assets/${id}`, {
      method: 'DELETE',
    });
  }

  // Tickets
  async getTickets() {
    return this.request('/tickets');
  }

  async createTicket(ticket) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async updateTicket(id, ticket) {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticket),
    });
  }

  async deleteTicket(id) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
