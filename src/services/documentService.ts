import api from './api';

// ============== TYPES ==============

export interface DocumentFile {
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
}

export interface Document {
  _id: string;
  builder: string;
  project?: string | { _id: string; name: string };
  unit?: string | { _id: string; unitNumber: string };
  booking?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  name: string;
  description?: string;
  documentType: string;
  category: 'generated' | 'uploaded' | 'template-based';
  file: DocumentFile;
  template?: {
    templateId: string;
    templateName: string;
    generatedAt: string;
  };
  version: number;
  previousVersions: {
    version: number;
    file: { url: string; key: string };
    updatedAt: string;
    changeNote?: string;
  }[];
  signature?: {
    required: boolean;
    status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired';
    signers: {
      name: string;
      email: string;
      phone?: string;
      role: string;
      signedAt?: string;
    }[];
    sentAt?: string;
    expiresAt?: string;
  };
  access: {
    isPublic: boolean;
    sharedWith: {
      email: string;
      accessType: 'view' | 'download';
      sharedAt: string;
      expiresAt?: string;
    }[];
  };
  tags: string[];
  status: 'draft' | 'active' | 'archived' | 'deleted';
  uploadedBy: string;
  lastAccessedAt?: string;
  accessCount: number;
  fileSizeFormatted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  _id: string;
  builder: string;
  name: string;
  description?: string;
  templateType: string;
  category: 'legal' | 'financial' | 'communication' | 'other';
  content: {
    format: 'html' | 'markdown' | 'pdf-template';
    body: string;
    headerHtml?: string;
    footerHtml?: string;
    css?: string;
  };
  variables: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'address' | 'list';
    required: boolean;
    defaultValue?: string;
    source?: string;
    sourcePath?: string;
  }[];
  pageSettings: {
    size: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
  signatureConfig?: {
    requireSignature: boolean;
    signerRoles: string[];
  };
  stats: {
    timesUsed: number;
    lastUsedAt?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============== DOCUMENT SERVICE ==============

export const documentService = {
  // Upload document with file
  upload: async (data: {
    file: File;
    name?: string;
    description?: string;
    documentType: string;
    projectId?: string;
    unitId?: string;
    bookingId?: string;
    customer?: { name: string; phone: string; email?: string };
    tags?: string[];
  }): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', data.file);
    
    // Add metadata as JSON string
    const metadata = {
      name: data.name || data.file.name,
      description: data.description,
      documentType: data.documentType,
      projectId: data.projectId,
      unitId: data.unitId,
      bookingId: data.bookingId,
      customer: data.customer,
      tags: data.tags
    };
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get documents
  getDocuments: async (params?: {
    projectId?: string;
    unitId?: string;
    documentType?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    documents: Document[];
    typeCounts: Record<string, number>;
    pagination: { page: number; limit: number; total: number; pages: number };
  }> => {
    const response = await api.get('/documents', { params });
    return response.data.data;
  },

  // Get single document
  getDocument: async (documentId: string): Promise<Document> => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data.data;
  },

  // Update document
  update: async (documentId: string, data: Partial<Document>): Promise<Document> => {
    const response = await api.put(`/documents/${documentId}`, data);
    return response.data.data;
  },

  // Upload new version with file
  uploadNewVersion: async (documentId: string, file: File, changeNote?: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', file);
    if (changeNote) {
      formData.append('changeNote', changeNote);
    }
    const response = await api.post(`/documents/${documentId}/version`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Delete document
  delete: async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },

  // Share document
  share: async (documentId: string, email: string, accessType: 'view' | 'download', expiresInDays?: number): Promise<void> => {
    await api.post(`/documents/${documentId}/share`, { email, accessType, expiresInDays });
  },

  // Get project documents
  getProjectDocuments: async (projectId: string, documentType?: string): Promise<Document[]> => {
    const params: any = {};
    if (documentType) params.documentType = documentType;
    const response = await api.get(`/documents/project/${projectId}`, { params });
    return response.data.data;
  },

  // Get unit documents
  getUnitDocuments: async (unitId: string, documentType?: string): Promise<Document[]> => {
    const params: any = {};
    if (documentType) params.documentType = documentType;
    const response = await api.get(`/documents/unit/${unitId}`, { params });
    return response.data.data;
  }
};

// ============== TEMPLATE SERVICE ==============

export const templateService = {
  // Create template
  create: async (data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const response = await api.post('/documents/templates', data);
    return response.data.data;
  },

  // Get templates
  getTemplates: async (params?: {
    templateType?: string;
    category?: string;
  }): Promise<DocumentTemplate[]> => {
    const response = await api.get('/documents/templates', { params });
    return response.data.data;
  },

  // Get single template
  getTemplate: async (templateId: string): Promise<DocumentTemplate> => {
    const response = await api.get(`/documents/templates/${templateId}`);
    return response.data.data;
  },

  // Update template
  update: async (templateId: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
    const response = await api.put(`/documents/templates/${templateId}`, data);
    return response.data.data;
  },

  // Delete template
  delete: async (templateId: string): Promise<void> => {
    await api.delete(`/documents/templates/${templateId}`);
  },

  // Generate document from template
  generate: async (templateId: string, data: {
    variables: Record<string, any>;
    projectId?: string;
    unitId?: string;
    bookingId?: string;
    customer?: { name: string; phone: string; email?: string };
    name?: string;
  }): Promise<{
    html: string;
    template: { _id: string; name: string; templateType: string };
    variables: Record<string, any>;
  }> => {
    const response = await api.post(`/documents/templates/${templateId}/generate`, data);
    return response.data.data;
  },

  // Preview template
  preview: async (templateId: string, variables?: Record<string, any>): Promise<{
    html: string;
    variables: Record<string, any>;
  }> => {
    const response = await api.post(`/documents/templates/${templateId}/preview`, { variables });
    return response.data.data;
  }
};

// ============== HELPER FUNCTIONS ==============

export const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'agreement': 'Agreement',
    'booking-form': 'Booking Form',
    'receipt': 'Receipt',
    'invoice': 'Invoice',
    'allotment-letter': 'Allotment Letter',
    'possession-letter': 'Possession Letter',
    'noc': 'NOC',
    'id-proof': 'ID Proof',
    'address-proof': 'Address Proof',
    'pan-card': 'PAN Card',
    'aadhar': 'Aadhar Card',
    'passport': 'Passport',
    'bank-statement': 'Bank Statement',
    'salary-slip': 'Salary Slip',
    'itr': 'ITR',
    'property-document': 'Property Document',
    'legal-document': 'Legal Document',
    'brochure': 'Brochure',
    'floor-plan': 'Floor Plan',
    'other': 'Other'
  };
  return labels[type] || type;
};

export const getDocumentTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'agreement': '📄',
    'booking-form': '📝',
    'receipt': '🧾',
    'invoice': '💰',
    'allotment-letter': '📜',
    'possession-letter': '🏠',
    'noc': '✅',
    'id-proof': '🪪',
    'pan-card': '💳',
    'aadhar': '🆔',
    'brochure': '📰',
    'floor-plan': '🗺️',
    'other': '📎'
  };
  return icons[type] || '📄';
};

export const getDocumentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'agreement': 'bg-blue-100 text-blue-800',
    'booking-form': 'bg-green-100 text-green-800',
    'receipt': 'bg-yellow-100 text-yellow-800',
    'invoice': 'bg-orange-100 text-orange-800',
    'allotment-letter': 'bg-purple-100 text-purple-800',
    'possession-letter': 'bg-indigo-100 text-indigo-800',
    'noc': 'bg-teal-100 text-teal-800',
    'id-proof': 'bg-gray-100 text-gray-800',
    'pan-card': 'bg-red-100 text-red-800',
    'aadhar': 'bg-pink-100 text-pink-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getSignatureStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'viewed': 'bg-yellow-100 text-yellow-800',
    'signed': 'bg-green-100 text-green-800',
    'declined': 'bg-red-100 text-red-800',
    'expired': 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTemplateTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'booking-agreement': 'Booking Agreement',
    'sale-agreement': 'Sale Agreement',
    'allotment-letter': 'Allotment Letter',
    'possession-letter': 'Possession Letter',
    'payment-receipt': 'Payment Receipt',
    'demand-letter': 'Demand Letter',
    'noc': 'NOC',
    'welcome-letter': 'Welcome Letter',
    'custom': 'Custom'
  };
  return labels[type] || type;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (extension: string): string => {
  const icons: Record<string, string> = {
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️'
  };
  return icons[extension.toLowerCase()] || '📄';
};
