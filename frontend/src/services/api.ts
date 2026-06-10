import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
class VCareAPI {
  private client: any

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    })
  }

  // ===== APPLICATIONS =====
  async createApplication(data: any) {
    return (await this.client.post('/api/applications/', data)).data
  }

  async updateApplication(id: string, data: any) {
    return (await this.client.put(`/api/applications/${id}`, data)).data
  }

  async getApplication(id: string) {
    return (await this.client.get(`/api/applications/${id}`)).data
  }

  // ===== CLAIMS =====
  async createClaim(data: any) {
    return (await this.client.post('/api/claims/', data)).data
  }

  async uploadDischargeSummary(claimId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return (await this.client.post(
      `/api/claims/${claimId}/upload-discharge-summary`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )).data
  }

  async getClaim(id: string) {
    return (await this.client.get(`/api/claims/${id}`)).data
  }

  // ===== TELEHEALTH =====
  async createTelehealthBooking(data: any) {
    return (await this.client.post('/api/telehealth/', data)).data
  }

  async getTelehealthBooking(id: string) {
    return (await this.client.get(`/api/telehealth/${id}`)).data
  }

  // ===== HEALTH =====
  async healthCheck() {
    return (await this.client.get('/health')).data
  }
}

export const api = new VCareAPI()
export default api