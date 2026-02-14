import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit3,
  Loader2,
  AlertCircle,
  Home,
  Building2,
  Briefcase,
  Crown,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

interface UserStats {
  totalUsers: number;
  byRole: { buyers: number; owners: number; agents: number; admins: number };
  googleUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  recentUsers: number;
}

interface UserRow {
  _id: string;
  email: string;
  phone?: string;
  role: string;
  authProvider: string;
  profileComplete: boolean;
  isActive: boolean;
  profile: { name: string; avatar?: string; location?: { city?: string; state?: string } };
  verification: { emailVerified: boolean; phoneVerified: boolean };
  subscription?: { plan: string };
  lastLoginAt?: string;
  createdAt: string;
}

const roleIcons: Record<string, any> = {
  buyer: Home,
  owner: Building2,
  agent: Briefcase,
  admin: Crown,
};

const roleColors: Record<string, string> = {
  buyer: 'bg-blue-100 text-blue-700',
  owner: 'bg-green-100 text-green-700',
  agent: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

export default function AdminCockpit() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [authFilter, setAuthFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res: any = await api.get('/admin/users/stats');
      if (res.success) setStats(res.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(authFilter !== 'all' && { authProvider: authFilter }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const res: any = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, authFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleEditUser = (user: UserRow) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditActive(user.isActive);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await api.patch(`/admin/users/${editingUser._id}`, {
        role: editRole,
        isActive: editActive,
      });
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Cockpit</h1>
            <p className="text-gray-600">Manage all platform users, roles, and activity</p>
          </div>
          <button
            onClick={() => { fetchStats(); fetchUsers(); }}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
            <StatCard label="Buyers" value={stats.byRole.buyers} icon={Home} color="sky" />
            <StatCard label="Owners" value={stats.byRole.owners} icon={Building2} color="green" />
            <StatCard label="Agents" value={stats.byRole.agents} icon={Briefcase} color="purple" />
            <StatCard label="Admins" value={stats.byRole.admins} icon={Crown} color="red" />
            <StatCard label="Google Users" value={stats.googleUsers} icon={Globe} color="orange" />
            <StatCard label="Active" value={stats.activeUsers} icon={UserCheck} color="emerald" />
            <StatCard label="Inactive" value={stats.inactiveUsers} icon={UserX} color="gray" />
            <StatCard label="Verified" value={stats.verifiedUsers} icon={ShieldCheck} color="teal" />
            <StatCard label="Last 30 Days" value={stats.recentUsers} icon={Calendar} color="indigo" />
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="owner">Owner</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <select
                value={authFilter}
                onChange={(e) => { setAuthFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Auth</option>
                <option value="local">Local</option>
                <option value="google">Google</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Showing {users.length} of {total} users
          </div>
        </div>

        {/* Users Table */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Auth</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Joined</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const RoleIcon = roleIcons[user.role] || Users;
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.profile.avatar ? (
                              <img src={user.profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-semibold text-sm">
                                  {user.profile.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">{user.profile.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                            <RoleIcon className="h-3 w-3" />
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</div>
                            {user.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</div>}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.authProvider === 'google' ? 'text-orange-600' : 'text-gray-600'}`}>
                            {user.authProvider === 'google' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            {user.authProvider}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                              {user.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs ${user.verification.emailVerified ? 'text-teal-600' : 'text-gray-400'}`}>
                              {user.verification.emailVerified ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                              {user.verification.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden xl:table-cell">
                          <span className="text-xs text-gray-500">{formatDate(user.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin-cockpit/users/${user._id}`)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Edit User"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Edit User</h3>
              <p className="text-sm text-gray-500 mb-6">{editingUser.profile.name} ({editingUser.email})</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="owner">Owner</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card component
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    sky: 'bg-sky-50 text-sky-600 border-sky-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
