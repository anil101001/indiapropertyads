import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import InsightsOverview from '../../components/admin/InsightsOverview';
import TimelineChart from '../../components/admin/TimelineChart';
import PropertyTypesChart from '../../components/admin/PropertyTypesChart';
import TopLocationsChart from '../../components/admin/TopLocationsChart';
import TopPropertiesByInquiriesChart from '../../components/admin/TopPropertiesByInquiriesChart';
import InsightDetailModal from '../../components/admin/InsightDetailModal';
import AIInsights from '../../components/admin/AIInsights';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Insights() {
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [propertiesTimeline, setPropertiesTimeline] = useState<any[]>([]);
  const [topPropertiesByInquiries, setTopPropertiesByInquiries] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);

  // Drill-down modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [dateRange]);

  // Drill-down handlers
  const handlePropertyTypeClick = async (type: string) => {
    console.log('Property type clicked:', type);
    setModalLoading(true);
    setIsModalOpen(true);
    setModalTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Properties`);
    
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_URL}/insights/properties/by-type/${type}`;
      console.log('Fetching from:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Received data:', data);
      setModalData(data.data || []);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleLocationClick = async (city: string, state: string) => {
    console.log('Location clicked:', city, state);
    setModalLoading(true);
    setIsModalOpen(true);
    setModalTitle(`Properties in ${city}, ${state}`);
    
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_URL}/insights/properties/by-location?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
      console.log('Fetching from:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Received data:', data);
      setModalData(data.data || []);
    } catch (error) {
      console.error('Error fetching location details:', error);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Fetch all insights data
      const [
        overviewRes,
        propertiesTimelineRes,
        topPropertiesByInquiriesRes,
        propertyTypesRes,
        topLocationsRes
      ] = await Promise.all([
        fetch(`${API_URL}/insights/overview?${params}`, { headers }),
        fetch(`${API_URL}/insights/properties-timeline?${params}`, { headers }),
        fetch(`${API_URL}/insights/top-properties-by-inquiries?limit=10`, { headers }),
        fetch(`${API_URL}/insights/property-types`, { headers }),
        fetch(`${API_URL}/insights/top-locations?limit=10`, { headers })
      ]);

      const [
        overviewData,
        propertiesTimelineData,
        topPropertiesByInquiriesData,
        propertyTypesData,
        topLocationsData
      ] = await Promise.all([
        overviewRes.json(),
        propertiesTimelineRes.json(),
        topPropertiesByInquiriesRes.json(),
        propertyTypesRes.json(),
        topLocationsRes.json()
      ]);

      setOverview(overviewData.data);
      setPropertiesTimeline(propertiesTimelineData.data || []);
      setTopPropertiesByInquiries(topPropertiesByInquiriesData.data || []);
      setPropertyTypes(propertyTypesData.data || []);
      setTopLocations(topLocationsData.data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Insights</h1>
          <p className="text-gray-600">Monitor your platform's performance and growth</p>
        </div>

        {/* AI Customer Intelligence - NEW! */}
        <AIInsights />

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Analytics</h2>

        {/* Date Range Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        {overview && (
          <InsightsOverview data={overview} loading={loading} />
        )}

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Properties Timeline */}
          <TimelineChart
            data={propertiesTimeline}
            title="Properties Posted Over Time"
            color="#667eea"
            loading={loading}
          />

          {/* Top Properties by Inquiries */}
          <TopPropertiesByInquiriesChart
            data={topPropertiesByInquiries}
            loading={loading}
            onBarClick={(propertyId) => {
              // Navigate to property page
              window.open(`/property/${propertyId}`, '_blank');
            }}
          />

          {/* Property Types and Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PropertyTypesChart 
              data={propertyTypes} 
              loading={loading}
              onSliceClick={handlePropertyTypeClick}
            />
            <TopLocationsChart 
              data={topLocations} 
              loading={loading}
              onBarClick={handleLocationClick}
            />
          </div>
        </div>

        {/* Drill-down Modal */}
        <InsightDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalTitle}
          data={modalData}
          loading={modalLoading}
        />
      </div>
    </div>
  );
}
