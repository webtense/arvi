const API_URL = import.meta.env.VITE_API_URL || '/api';
import { emitToast } from '../utils/toast';

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
    const isPublicAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register';

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
        if ((response.status === 401 || response.status === 403) && token && !isPublicAuthEndpoint) {
          this.removeToken();
          localStorage.removeItem('arviUser');
          if (typeof window !== 'undefined') {
            emitToast({
              type: 'error',
              message: 'Tu sesion ha expirado. Inicia sesion de nuevo.'
            });
            window.dispatchEvent(new CustomEvent('arvi:auth-expired', {
              detail: { status: response.status }
            }));
          }
        }

        const error = await response.json().catch(() => ({ error: 'Error de servidor' }));
        throw new Error(error.error || 'Error en la solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  normalizeListResponse(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
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

  async forgotPassword(identifier) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Invoices
  async getInvoices() {
    const data = await this.request('/invoices');
    return this.normalizeListResponse(data);
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

  async finalizeInvoice(id) {
    return this.request(`/invoices/${id}/finalize`, {
      method: 'POST',
    });
  }

  async deleteInvoice(id) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async cancelInvoice(id, reason) {
    return this.request(`/invoices/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async duplicateInvoice(id) {
    return this.request(`/invoices/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Clients
  async getClients(search) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const data = await this.request(`/clients${query}`);
    return this.normalizeListResponse(data);
  }

  async getClient(id) {
    return this.request(`/clients/${id}`);
  }

  async createClient(client) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id, client) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Budgets
  async getBudgets() {
    const data = await this.request('/budgets');
    return this.normalizeListResponse(data);
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

  async sendBudget(id) {
    return this.request(`/budgets/${id}/send`, {
      method: 'POST',
    });
  }

  async acceptBudget(id) {
    return this.request(`/budgets/${id}/accept`, {
      method: 'POST',
    });
  }

  async rejectBudget(id) {
    return this.request(`/budgets/${id}/reject`, {
      method: 'POST',
    });
  }

  // Parts
  async getParts() {
    const data = await this.request('/parts');
    return this.normalizeListResponse(data);
  }

  async completePart(id, payload) {
    return this.request(`/parts/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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
    const data = await this.request('/assets');
    return this.normalizeListResponse(data);
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

  async deleteAsset(id, reason = '') {
    return this.request(`/assets/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  // Tickets
  async getTickets() {
    const data = await this.request('/tickets');
    return this.normalizeListResponse(data);
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

  async closeTicketMonth(year, month) {
    return this.request(`/tickets/close-month/${year}/${month}`, {
      method: 'POST',
    });
  }

  // Projects
  async getProjects() {
    const data = await this.request('/projects');
    return this.normalizeListResponse(data);
  }

  async createProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id, project) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Subcontractors
  async getSubcontractors() {
    const data = await this.request('/subcontractors');
    return this.normalizeListResponse(data);
  }

  async assignTicketsToProject(ticketIds, projectId) {
    return this.request('/tickets/assign-project', {
      method: 'POST',
      body: JSON.stringify({ ticketIds, projectId }),
    });
  }

  async getOcrHints(text) {
    return this.request('/tickets/ocr-hints', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getDocuments(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, v);
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request(`/documents${query}`);
    return this.normalizeListResponse(data);
  }

  async uploadDocument(formData) {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error de servidor' }));
      throw new Error(error.error || 'Error subiendo documento');
    }
    return response.json();
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
  }

  getDocumentDownloadUrl(id) {
    return `${this.baseUrl}/documents/download/${id}`;
  }

  async importClientsFromFacturas() {
    return this.request('/clients/import-facturas', { method: 'POST' });
  }

  async getClientLedger(id) {
    return this.request(`/clients/${id}/ledger`);
  }

  async getClientDuplicateReport() {
    return this.request('/clients/quality/duplicates');
  }

  async reconcileInvoicesByClient() {
    return this.request('/clients/quality/reconcile', { method: 'POST' });
  }

  async budgetToInvoice(id) {
    return this.request(`/budgets/${id}/to-invoice`, { method: 'POST' });
  }

  async getHistoricalImports(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, v);
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/invoices/historical-imports${query}`);
  }

  async createSubcontractor(payload) {
    return this.request('/subcontractors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSubcontractor(id, payload) {
    return this.request(`/subcontractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteSubcontractor(id) {
    return this.request(`/subcontractors/${id}`, {
      method: 'DELETE',
    });
  }

  async addSubcontractorAssignment(id, payload) {
    return this.request(`/subcontractors/${id}/assignments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Contact
  async sendContact(data) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
export default api;
