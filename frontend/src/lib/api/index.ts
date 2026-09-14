import { client } from './client';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    client.post<ApiResponse<{ accessToken: string; user: any }>>('/auth/login', data),
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    client.post<ApiResponse<{ accessToken?: string; user: any }>>('/auth/register', data),
  verifyEmail: (token: string) =>
    client.post<ApiResponse>('/auth/verify-email', { token }),
  forgotPassword: (email: string) =>
    client.post<ApiResponse>('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    client.post<ApiResponse>('/auth/reset-password', data),
  logout: () => client.post<ApiResponse>('/auth/logout'),
  getSessions: () => client.get<ApiResponse<any[]>>('/auth/sessions'),
  deleteSession: (id: string) => client.delete<ApiResponse>(`/auth/sessions/${id}`),
};

export const usersApi = {
  getMe: () => client.get<ApiResponse<any>>('/users/me'),
  updateMe: (data: { name?: string; password?: string }) =>
    client.patch<ApiResponse<any>>('/users/me', data),
  exportMe: () => client.get('/users/me/export', { responseType: 'blob' }),
  list: (params?: { page?: number; limit?: number; q?: string }) =>
    client.get<ApiResponse<any[]>>('/users', { params }),
  get: (id: string) => client.get<ApiResponse<any>>(`/users/${id}`),
  create: (data: { email: string; password: string; name: string; role: string; fleetId?: string }) =>
    client.post<ApiResponse<any>>('/users', data),
  update: (id: string, data: { name?: string; role?: string; fleetId?: string; password?: string }) =>
    client.patch<ApiResponse<any>>(`/users/${id}`, data),
  delete: (id: string) => client.delete<ApiResponse>(`/users/${id}`),
};

export const driversApi = {
  list: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/drivers', { params }),
  get: (id: string) => client.get<ApiResponse<any>>(`/drivers/${id}`),
  create: (data: any) => client.post<ApiResponse<any>>('/drivers', data),
  update: (id: string, data: any) => client.patch<ApiResponse<any>>(`/drivers/${id}`, data),
};

export const vehiclesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/vehicles', { params }),
  get: (id: string) => client.get<ApiResponse<any>>(`/vehicles/${id}`),
  create: (data: any) => client.post<ApiResponse<any>>('/vehicles', data),
  update: (id: string, data: any) => client.patch<ApiResponse<any>>(`/vehicles/${id}`, data),
};

export const assignmentsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/assignments', { params }),
  create: (data: { driverId: string; vehicleId: string; shipmentId: string; startsAt: string; endsAt?: string }) =>
    client.post<ApiResponse<any>>('/assignments', data),
  update: (id: string, data: { status?: string; endsAt?: string }) =>
    client.patch<ApiResponse<any>>(`/assignments/${id}`, data),
};

export const trackingApi = {
  ping: (data: { lat: number; lng: number; accuracy?: number; speed?: number; heading?: number; recordedAt: string; tripId?: string }) =>
    client.post<ApiResponse<any>>('/tracking/ping', data),
  getLatest: (driverId: string) =>
    client.get<ApiResponse<any>>(`/tracking/drivers/${driverId}/latest`),
  getHistory: (driverId: string) =>
    client.get<ApiResponse<any[]>>(`/tracking/drivers/${driverId}/history`),
};

export const hospitalsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/hospitals', { params }),
  getNearby: (params: { lat: number; lng: number; radius?: number }) =>
    client.get<ApiResponse<any[]>>('/hospitals/nearby', { params }),
};

export const shipmentsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    client.get<ApiResponse<any[]>>('/shipments', { params }),
  get: (id: string) => client.get<ApiResponse<any>>(`/shipments/${id}`),
  create: (data: {
    reference: string;
    origin: string;
    destination: string;
    carrier?: string;
    priority?: string;
    cargoType?: string;
    eta?: string;
    currentCorridorId?: string;
  }) => client.post<ApiResponse<any>>('/shipments', data),
  update: (id: string, data: any) => client.patch<ApiResponse<any>>(`/shipments/${id}`, data),
  delete: (id: string) => client.delete<ApiResponse>(`/shipments/${id}`),
  importCsv: (csv: string) => client.post<ApiResponse<{ imported: number; errors: any[] }>>('/shipments/import', { csv }),
};

export const routesApi = {
  optimize: (data: { origin: string; destination: string; cargoType?: string; priority?: string }) =>
    client.post<ApiResponse<any>>('/routes/optimize', data),
};

export const corridorsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/corridors', { params }),
  get: (id: string) => client.get<ApiResponse<any>>(`/corridors/${id}`),
};

export const disruptionsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/disruptions', { params }),
  create: (data: {
    type: string;
    severity: string;
    description: string;
    affectedCorridorIds?: string[];
    location?: { type: 'Point'; coordinates: [number, number] };
    startedAt?: string;
  }) => client.post<ApiResponse<any>>('/disruptions', data),
  sendWebhook: (data: any) => client.post<ApiResponse<any>>('/webhooks/disruptions', data),
};

export const emergencyApi = {
  listAlerts: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/emergency/alerts', { params }),
  createAlert: (data: {
    type?: string;
    severity?: string;
    description: string;
    location?: { type: 'Point'; coordinates: [number, number] };
    corridorId?: string;
    shipmentId?: string;
  }) => client.post<ApiResponse<any>>('/emergency/alerts', data),
  acknowledgeAlert: (id: string) => client.post<ApiResponse<any>>(`/emergency/alerts/${id}/acknowledge`),
  dispatchAlert: (id: string, data?: { unitId?: string }) =>
    client.post<ApiResponse<any>>(`/emergency/alerts/${id}/dispatch`, data || {}),
  resolveAlert: (id: string) => client.post<ApiResponse<any>>(`/emergency/alerts/${id}/resolve`),
  approveHospitalAlert: (id: string, data?: { notes?: string }) =>
    client.post<ApiResponse<any>>(`/emergency/alerts/${id}/approve-hospital`, data || {}),
  rejectHospitalAlert: (id: string, data?: { reason?: string }) =>
    client.post<ApiResponse<any>>(`/emergency/alerts/${id}/reject-hospital`, data || {}),
  listResponseUnits: (params?: { page?: number; limit?: number }) =>
    client.get<ApiResponse<any[]>>('/emergency/response-units', { params }),
  createResponseUnit: (data: { name: string; type: string; status?: string; currentLocation?: any }) =>
    client.post<ApiResponse<any>>('/emergency/response-units', data),
  updateResponseUnit: (id: string, data: any) =>
    client.patch<ApiResponse<any>>(`/emergency/response-units/${id}`, data),
};

export const highwaysApi = {
  list: () => client.get<ApiResponse<any[]>>('/highways'),
  sync: () => client.post<ApiResponse<any>>('/highways/sync'),
};

export const riskApi = {
  getCorridors: () => client.get<ApiResponse<any[]>>('/risk/corridors'),
  getAccidents: () => client.get<ApiResponse<any[]>>('/risk/accidents'),
  recompute: () => client.post<ApiResponse<any>>('/risk/recompute'),
};

export const predictionsApi = {
  list: () => client.get<ApiResponse<any[]>>('/predictions'),
  recompute: () => client.post<ApiResponse<any>>('/predictions/recompute'),
};

export const simulatorApi = {
  getScenarios: () => client.get<ApiResponse<any[]>>('/simulator/scenarios'),
  run: (data: { name: string; inputVariables: Record<string, any> }) =>
    client.post<ApiResponse<any>>('/simulator/run', data),
};

export const analyticsApi = {
  getOverview: () => client.get<ApiResponse<any>>('/analytics/overview'),
  getFleetCompliance: () => client.get<ApiResponse<any>>('/analytics/fleet-compliance'),
};

export const reportsApi = {
  list: () => client.get<ApiResponse<any[]>>('/reports'),
  create: (data: { type: string; format?: string; dateRange?: { from: string; to: string }; filters?: Record<string, any> }) =>
    client.post<ApiResponse<any>>('/reports', data),
  exportReport: (id: string) => client.get(`/reports/${id}/export`, { responseType: 'blob' }),
};

export const copilotApi = {
  sendMessage: (data: { content: string; conversationId?: string }) =>
    client.post<ApiResponse<any>>('/copilot/message', data),
  getConversation: (id: string) => client.get<ApiResponse<any>>(`/copilot/conversations/${id}`),
};

export const auditLogApi = {
  list: () => client.get<ApiResponse<any[]>>('/audit-log'),
};

export const settingsApi = {
  getDataSources: () => client.get<ApiResponse<any[]>>('/settings/data-sources'),
  createDataSource: (data: { name: string; kind: string; config?: Record<string, any> }) =>
    client.post<ApiResponse<any>>('/settings/data-sources', data),
};
