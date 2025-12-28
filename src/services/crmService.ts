import api from './api';

// Types
export interface Lead {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: string[];
    address: {
      city: string;
      locality?: string;
    };
    pricing: {
      expectedPrice: number;
    };
    listingType: string;
    propertyType: string;
  };
  buyer: {
    _id: string;
    profile: {
      name: string;
    };
    email: string;
    phone: string;
  };
  buyerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  message: string;
  contactMethod: 'call' | 'email' | 'whatsapp';
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  nextFollowUpDate?: string;
  lastContactedAt?: string;
  expectedClosingDate?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'site-visit' | 'negotiation' | 'closed-won' | 'closed-lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'phone' | 'whatsapp' | 'referral' | 'walk-in' | 'other';

export interface Activity {
  _id: string;
  inquiry: string;
  user: {
    _id: string;
    profile: {
      name: string;
    };
  };
  type: ActivityType;
  title: string;
  description?: string;
  callDetails?: {
    duration?: number;
    outcome?: 'connected' | 'no-answer' | 'busy' | 'voicemail' | 'wrong-number';
    direction?: 'inbound' | 'outbound';
  };
  siteVisitDetails?: {
    scheduledAt?: string;
    completedAt?: string;
    feedback?: string;
    rating?: number;
  };
  statusChange?: {
    from: string;
    to: string;
  };
  createdAt: string;
}

export type ActivityType = 'call' | 'email' | 'sms' | 'whatsapp' | 'site-visit' | 'meeting' | 'note' | 'status-change' | 'follow-up';

export interface Task {
  _id: string;
  inquiry: {
    _id: string;
    buyerInfo: {
      name: string;
    };
    property: string;
    status: LeadStatus;
  };
  user: string;
  assignedTo?: {
    _id: string;
    profile: {
      name: string;
    };
  };
  title: string;
  description?: string;
  type: TaskType;
  priority: LeadPriority;
  dueDate: string;
  reminderDate?: string;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
}

export type TaskType = 'follow-up' | 'call' | 'email' | 'site-visit' | 'meeting' | 'document' | 'other';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface DashboardStats {
  overview: {
    totalLeads: number;
    newLeadsThisWeek: number;
    pendingFollowUps: number;
    pendingTasks: number;
    overdueTasks: number;
    conversionRate: number;
  };
  leadsByStatus: Record<LeadStatus, number>;
  recentActivities: Activity[];
}

export interface LeadsResponse {
  leads: Lead[];
  stats: {
    statusCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
    upcomingFollowUps: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeadFilters {
  status?: LeadStatus;
  priority?: LeadPriority;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// CRM Service
const crmService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/crm/dashboard');
    return response.data.data;
  },

  // Leads
  getLeads: async (filters: LeadFilters = {}): Promise<LeadsResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/crm/leads?${params.toString()}`);
    return response.data.data;
  },

  getLeadDetails: async (leadId: string): Promise<{ lead: Lead; activities: Activity[]; tasks: Task[] }> => {
    const response = await api.get(`/crm/leads/${leadId}`);
    return response.data.data;
  },

  updateLead: async (leadId: string, data: Partial<{
    status: LeadStatus;
    priority: LeadPriority;
    nextFollowUpDate: string;
    expectedClosingDate: string;
    notes: string;
    tags: string[];
    budget: { min?: number; max?: number };
  }>): Promise<Lead> => {
    const response = await api.patch(`/crm/leads/${leadId}`, data);
    return response.data.data;
  },

  updateLeadStatus: async (leadId: string, status: LeadStatus): Promise<Lead> => {
    const response = await api.patch(`/crm/leads/${leadId}/status`, { status });
    return response.data.data;
  },

  // Activities
  getActivities: async (leadId: string, page = 1, limit = 50): Promise<{ activities: Activity[]; pagination: any }> => {
    const response = await api.get(`/crm/leads/${leadId}/activities?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  addActivity: async (leadId: string, data: {
    type: ActivityType;
    title: string;
    description?: string;
    callDetails?: {
      duration?: number;
      outcome?: 'connected' | 'no-answer' | 'busy' | 'voicemail' | 'wrong-number';
      direction?: 'inbound' | 'outbound';
    };
    siteVisitDetails?: {
      scheduledAt?: string;
      completedAt?: string;
      feedback?: string;
      rating?: number;
    };
  }): Promise<Activity> => {
    const response = await api.post(`/crm/leads/${leadId}/activities`, data);
    return response.data.data;
  },

  // Tasks
  getTasks: async (filters: {
    status?: TaskStatus;
    priority?: LeadPriority;
    page?: number;
    limit?: number;
  } = {}): Promise<{ tasks: Task[]; stats: { overdueCount: number; dueTodayCount: number }; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/crm/tasks?${params.toString()}`);
    return response.data.data;
  },

  createTask: async (leadId: string, data: {
    title: string;
    description?: string;
    type: TaskType;
    priority: LeadPriority;
    dueDate: string;
    reminderDate?: string;
    assignedTo?: string;
  }): Promise<Task> => {
    const response = await api.post(`/crm/leads/${leadId}/tasks`, data);
    return response.data.data;
  },

  updateTask: async (taskId: string, data: Partial<{
    title: string;
    description: string;
    type: TaskType;
    priority: LeadPriority;
    dueDate: string;
    reminderDate: string;
    status: TaskStatus;
  }>): Promise<Task> => {
    const response = await api.patch(`/crm/tasks/${taskId}`, data);
    return response.data.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/crm/tasks/${taskId}`);
  },

  // Helper functions
  getStatusLabel: (status: LeadStatus): string => {
    const labels: Record<LeadStatus, string> = {
      'new': 'New',
      'contacted': 'Contacted',
      'interested': 'Interested',
      'site-visit': 'Site Visit',
      'negotiation': 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost'
    };
    return labels[status] || status;
  },

  getStatusColor: (status: LeadStatus): string => {
    const colors: Record<LeadStatus, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'interested': 'bg-purple-100 text-purple-800',
      'site-visit': 'bg-indigo-100 text-indigo-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getPriorityColor: (priority: LeadPriority): string => {
    const colors: Record<LeadPriority, string> = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  },

  getActivityIcon: (type: ActivityType): string => {
    const icons: Record<ActivityType, string> = {
      'call': '📞',
      'email': '📧',
      'sms': '💬',
      'whatsapp': '💬',
      'site-visit': '🏠',
      'meeting': '🤝',
      'note': '📝',
      'status-change': '🔄',
      'follow-up': '⏰'
    };
    return icons[type] || '📌';
  }
};

export default crmService;
