import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Save,
  X,
  User,
  Home,
  Tag,
  FileText
} from 'lucide-react';
import crmService, { 
  Lead, 
  Activity, 
  Task, 
  LeadStatus, 
  LeadPriority,
  ActivityType,
  TaskType,
  TaskStatus
} from '../services/crmService';

const PIPELINE_STAGES: { status: LeadStatus; label: string }[] = [
  { status: 'new', label: 'New' },
  { status: 'contacted', label: 'Contacted' },
  { status: 'interested', label: 'Interested' },
  { status: 'site-visit', label: 'Site Visit' },
  { status: 'negotiation', label: 'Negotiation' },
  { status: 'closed-won', label: 'Closed Won' },
  { status: 'closed-lost', label: 'Closed Lost' },
];

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activities' | 'tasks' | 'notes'>('activities');
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    priority: LeadPriority;
    nextFollowUpDate: string;
    expectedClosingDate: string;
    notes: string;
    tags: string[];
  }>({
    priority: 'medium',
    nextFollowUpDate: '',
    expectedClosingDate: '',
    notes: '',
    tags: []
  });
  
  // Add activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'note' as ActivityType,
    title: '',
    description: ''
  });
  
  // Add task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'follow-up' as TaskType,
    priority: 'medium' as LeadPriority,
    dueDate: ''
  });

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const data = await crmService.getLeadDetails(id!);
      setLead(data.lead);
      setActivities(data.activities);
      setTasks(data.tasks);
      
      // Initialize edit data
      setEditData({
        priority: data.lead.priority,
        nextFollowUpDate: data.lead.nextFollowUpDate?.split('T')[0] || '',
        expectedClosingDate: data.lead.expectedClosingDate?.split('T')[0] || '',
        notes: data.lead.notes || '',
        tags: data.lead.tags || []
      });
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      await crmService.updateLeadStatus(id!, newStatus);
      fetchLeadDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await crmService.updateLead(id!, {
        priority: editData.priority,
        nextFollowUpDate: editData.nextFollowUpDate || undefined,
        expectedClosingDate: editData.expectedClosingDate || undefined,
        notes: editData.notes,
        tags: editData.tags
      });
      setIsEditing(false);
      fetchLeadDetails();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmService.addActivity(id!, activityForm);
      setShowActivityModal(false);
      setActivityForm({ type: 'note', title: '', description: '' });
      fetchLeadDetails();
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmService.createTask(id!, taskForm);
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        type: 'follow-up',
        priority: 'medium',
        dueDate: ''
      });
      fetchLeadDetails();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await crmService.updateTask(taskId, { status });
      fetchLeadDetails();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Lead not found</p>
          <Link to="/crm" className="text-blue-600 hover:underline">Back to CRM</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/crm')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{lead.buyerInfo.name}</h1>
                <p className="text-sm text-gray-500">{lead.buyerInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${lead.buyerInfo.phone}`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
              <a
                href={`https://wa.me/91${lead.buyerInfo.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
              <a
                href={`mailto:${lead.buyerInfo.email}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Pipeline */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Lead Status</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {PIPELINE_STAGES.map((stage, index) => {
                  const isActive = lead.status === stage.status;
                  const isPast = PIPELINE_STAGES.findIndex(s => s.status === lead.status) > index;
                  return (
                    <button
                      key={stage.status}
                      onClick={() => handleStatusChange(stage.status)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isPast
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Info */}
            {lead.property && (
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Property Interest</h3>
                <div className="flex gap-4">
                  {lead.property.images?.[0] && (
                    <img
                      src={lead.property.images[0]}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lead.property.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {lead.property.address?.locality}, {lead.property.address?.city}
                    </p>
                    <p className="text-lg font-semibold text-blue-600 mt-2">
                      {formatPrice(lead.property.pricing?.expectedPrice || 0)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {lead.property.propertyType}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {lead.property.listingType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Inquiry Message:</strong> {lead.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Preferred contact: {lead.contactMethod}
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    activeTab === 'activities'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Activities ({activities.length})
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    activeTab === 'tasks'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tasks ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    activeTab === 'notes'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Notes
                </button>
              </div>

              <div className="p-4">
                {/* Activities Tab */}
                {activeTab === 'activities' && (
                  <div>
                    <button
                      onClick={() => setShowActivityModal(true)}
                      className="w-full mb-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Log Activity
                    </button>
                    <div className="space-y-3">
                      {activities.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No activities yet</p>
                      ) : (
                        activities.map((activity) => (
                          <div key={activity._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-xl">{crmService.getActivityIcon(activity.type)}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDateTime(activity.createdAt)}
                                {activity.user?.profile?.name && ` • ${activity.user.profile.name}`}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                  <div>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="w-full mb-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                    <div className="space-y-3">
                      {tasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No tasks yet</p>
                      ) : (
                        tasks.map((task) => (
                          <div key={task._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => handleTaskStatusChange(
                                task._id,
                                task.status === 'completed' ? 'pending' : 'completed'
                              )}
                              className="mt-1 w-4 h-4 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${
                                task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${crmService.getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className="text-xs text-gray-400">
                                  Due: {formatDate(task.dueDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    {isEditing ? (
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add notes about this lead..."
                      />
                    ) : (
                      <div className="min-h-[160px] p-3 bg-gray-50 rounded-lg">
                        {lead.notes ? (
                          <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                        ) : (
                          <p className="text-gray-400 italic">No notes added yet</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Info Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Lead Details</h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{lead.buyerInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Priority</p>
                    {isEditing ? (
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value as LeadPriority })}
                        className="mt-1 w-full px-3 py-1.5 border rounded-lg text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${crmService.getPriorityColor(lead.priority)}`}>
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Next Follow-up</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.nextFollowUpDate}
                        onChange={(e) => setEditData({ ...editData, nextFollowUpDate: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 border rounded-lg text-sm"
                      />
                    ) : (
                      <p className="font-medium">
                        {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Expected Closing</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.expectedClosingDate}
                        onChange={(e) => setEditData({ ...editData, expectedClosingDate: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 border rounded-lg text-sm"
                      />
                    ) : (
                      <p className="font-medium">
                        {lead.expectedClosingDate ? formatDate(lead.expectedClosingDate) : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p className="font-medium capitalize">{lead.source}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>

                {lead.lastContactedAt && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Last Contacted</p>
                      <p className="font-medium">{formatDate(lead.lastContactedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActivityForm({ type: 'call', title: 'Phone call', description: '' });
                    setShowActivityModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  Log a Call
                </button>
                <button
                  onClick={() => {
                    setActivityForm({ type: 'email', title: 'Email sent', description: '' });
                    setShowActivityModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  Log an Email
                </button>
                <button
                  onClick={() => {
                    setActivityForm({ type: 'site-visit', title: 'Site visit', description: '' });
                    setShowActivityModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-purple-600" />
                  Log Site Visit
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-orange-600" />
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Log Activity</h3>
              <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="site-visit">Site Visit</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Brief description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details (optional)</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Add more details..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={taskForm.type}
                  onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as TaskType })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="follow-up">Follow-up</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="site-visit">Site Visit</option>
                  <option value="meeting">Meeting</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as LeadPriority })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Add details..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
