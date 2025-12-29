import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, Search,
  Download, Trash2, Eye, Plus, FolderOpen, Clock, AlertCircle
} from 'lucide-react';
import {
  documentService, templateService, Document, DocumentTemplate,
  getDocumentTypeLabel, getDocumentTypeColor, getSignatureStatusColor,
  getTemplateTypeLabel, formatFileSize, getFileIcon
} from '../services/documentService';

type TabType = 'documents' | 'templates';

export default function DocumentManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Templates state
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [templateTypeFilter, setTemplateTypeFilter] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    } else {
      fetchTemplates();
    }
  }, [activeTab, documentTypeFilter, searchQuery, pagination.page, templateTypeFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocuments({
        documentType: documentTypeFilter || undefined,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      setDocuments(data.documents);
      setTypeCounts(data.typeCounts);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplates({
        templateType: templateTypeFilter || undefined
      });
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.delete(documentId);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await templateService.delete(templateId);
      fetchTemplates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const documentTypes = [
    'agreement', 'booking-form', 'receipt', 'invoice', 'allotment-letter',
    'possession-letter', 'noc', 'id-proof', 'pan-card', 'aadhar',
    'bank-statement', 'property-document', 'brochure', 'floor-plan', 'other'
  ];

  const templateTypes = [
    'booking-agreement', 'sale-agreement', 'allotment-letter',
    'possession-letter', 'payment-receipt', 'demand-letter', 'noc', 'welcome-letter', 'custom'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/builder/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
              <p className="text-gray-500">Manage documents and templates</p>
            </div>
            <div className="flex gap-3">
              {activeTab === 'documents' ? (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Upload className="h-4 w-4" />
                  Upload Document
                </button>
              ) : (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Template
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'documents'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'templates'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FolderOpen className="h-4 w-4 inline mr-2" />
                Templates
              </button>
            </nav>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <select
                    value={documentTypeFilter}
                    onChange={(e) => setDocumentTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>
                        {getDocumentTypeLabel(type)} {typeCounts[type] ? `(${typeCounts[type]})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Documents List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents</h3>
                    <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Document</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Size</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Uploaded</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc._id} className="border-t hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getFileIcon(doc.file.extension)}</span>
                                <div>
                                  <p className="font-medium text-gray-900">{doc.name}</p>
                                  {doc.customer && (
                                    <p className="text-xs text-gray-500">{doc.customer.name}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getDocumentTypeColor(doc.documentType)}`}>
                                {getDocumentTypeLabel(doc.documentType)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatFileSize(doc.file.size)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {doc.signature?.required ? (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSignatureStatusColor(doc.signature.status)}`}>
                                  {doc.signature.status}
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={doc.file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4 text-gray-500" />
                                </a>
                                <a
                                  href={doc.file.url}
                                  download={doc.file.originalName}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4 text-gray-500" />
                                </a>
                                <button
                                  onClick={() => handleDeleteDocument(doc._id)}
                                  className="p-1 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={templateTypeFilter}
                    onChange={(e) => setTemplateTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    {templateTypes.map(type => (
                      <option key={type} value={type}>{getTemplateTypeLabel(type)}</option>
                    ))}
                  </select>
                </div>

                {/* Templates Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates</h3>
                    <p className="text-gray-500 mb-4">Create your first template to generate documents</p>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >
                      <Plus className="h-4 w-4" />
                      Create Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(template => (
                      <div key={template._id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-primary-600">{getTemplateTypeLabel(template.templateType)}</p>
                          </div>
                          {template.isDefault && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                              Default
                            </span>
                          )}
                        </div>
                        
                        {template.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Used {template.stats.timesUsed} times
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedTemplate(template)}
                              className="p-1 hover:bg-gray-100 rounded text-primary-600"
                              title="Use Template"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template._id)}
                              className="p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload Document Modal */}
        {showUploadModal && (
          <UploadDocumentModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => { setShowUploadModal(false); fetchDocuments(); }}
          />
        )}

        {/* Create Template Modal */}
        {showTemplateModal && (
          <CreateTemplateModal
            onClose={() => setShowTemplateModal(false)}
            onSuccess={() => { setShowTemplateModal(false); fetchTemplates(); }}
          />
        )}

        {/* Generate from Template Modal */}
        {selectedTemplate && (
          <GenerateDocumentModal
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onSuccess={() => { setSelectedTemplate(null); fetchDocuments(); setActiveTab('documents'); }}
          />
        )}
      </div>
    </div>
  );
}

// Upload Document Modal
function UploadDocumentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: 'other',
    customerName: '',
    customerPhone: '',
    tags: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await documentService.upload({
        file: selectedFile,
        name: formData.name || selectedFile.name,
        description: formData.description,
        documentType: formData.documentType,
        customer: formData.customerName ? {
          name: formData.customerName,
          phone: formData.customerPhone
        } : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Document</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="agreement">Agreement</option>
              <option value="booking-form">Booking Form</option>
              <option value="receipt">Receipt</option>
              <option value="invoice">Invoice</option>
              <option value="id-proof">ID Proof</option>
              <option value="pan-card">PAN Card</option>
              <option value="aadhar">Aadhar Card</option>
              <option value="bank-statement">Bank Statement</option>
              <option value="property-document">Property Document</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., important, 2024, tower-a"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {selectedFile ? (
              <>
                <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB - Click to change
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to select file or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 25MB</p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" disabled={loading || !selectedFile} className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Template Modal
function CreateTemplateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'booking-agreement',
    category: 'legal',
    body: `<h1>{{projectName}}</h1>
<p>This agreement is made on {{date}} between:</p>
<p><strong>Builder:</strong> {{builderName}}</p>
<p><strong>Buyer:</strong> {{buyerName}}</p>
<p><strong>Unit:</strong> {{unitNumber}}, {{towerName}}</p>
<p><strong>Total Price:</strong> {{totalPrice}}</p>
<p><strong>Booking Amount:</strong> {{bookingAmount}}</p>
<p>Terms and conditions apply.</p>`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await templateService.create({
        name: formData.name,
        description: formData.description,
        templateType: formData.templateType as any,
        category: formData.category as any,
        content: {
          format: 'html',
          body: formData.body
        },
        variables: [
          { name: 'projectName', label: 'Project Name', type: 'text', required: true, source: 'project', sourcePath: 'name' },
          { name: 'builderName', label: 'Builder Name', type: 'text', required: true, source: 'builder', sourcePath: 'companyName' },
          { name: 'buyerName', label: 'Buyer Name', type: 'text', required: true, source: 'manual' },
          { name: 'unitNumber', label: 'Unit Number', type: 'text', required: true, source: 'unit', sourcePath: 'unitNumber' },
          { name: 'towerName', label: 'Tower Name', type: 'text', required: false, source: 'manual' },
          { name: 'totalPrice', label: 'Total Price', type: 'currency', required: true, source: 'unit', sourcePath: 'pricing.totalPrice' },
          { name: 'bookingAmount', label: 'Booking Amount', type: 'currency', required: true, source: 'manual' },
          { name: 'date', label: 'Date', type: 'date', required: true, source: 'manual' }
        ],
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Create Template</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.templateType}
                onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="booking-agreement">Booking Agreement</option>
                <option value="sale-agreement">Sale Agreement</option>
                <option value="allotment-letter">Allotment Letter</option>
                <option value="payment-receipt">Payment Receipt</option>
                <option value="demand-letter">Demand Letter</option>
                <option value="welcome-letter">Welcome Letter</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Content (HTML)</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              rows={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {"{{variableName}}"} for dynamic content. Available: projectName, builderName, buyerName, unitNumber, totalPrice, bookingAmount, date
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" disabled={loading || !formData.name} className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Generate Document Modal
function GenerateDocumentModal({ template, onClose, onSuccess }: {
  template: DocumentTemplate;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    // Initialize variables with defaults
    const defaults: Record<string, any> = {};
    template.variables.forEach(v => {
      defaults[v.name] = v.defaultValue || '';
    });
    setVariables(defaults);
  }, [template]);

  const handlePreview = async () => {
    try {
      const result = await templateService.preview(template._id, variables);
      setPreviewHtml(result.html);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      await templateService.generate(template._id, { variables });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Generate: {template.name}</h2>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variables Form */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Fill in Details</h3>
              {template.variables.map(variable => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable.label} {variable.required && <span className="text-red-500">*</span>}
                  </label>
                  {variable.type === 'date' ? (
                    <input
                      type="date"
                      value={variables[variable.name] || ''}
                      onChange={(e) => setVariables({ ...variables, [variable.name]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : variable.type === 'currency' || variable.type === 'number' ? (
                    <input
                      type="number"
                      value={variables[variable.name] || ''}
                      onChange={(e) => setVariables({ ...variables, [variable.name]: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <input
                      type="text"
                      value={variables[variable.name] || ''}
                      onChange={(e) => setVariables({ ...variables, [variable.name]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handlePreview}
                className="w-full py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
              >
                Preview Document
              </button>
            </div>

            {/* Preview */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="border rounded-lg p-4 bg-white min-h-[400px] overflow-auto">
                {previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <p className="text-gray-400 text-center py-8">Click "Preview Document" to see the result</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
