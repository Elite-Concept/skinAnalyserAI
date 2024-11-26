import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Users, Search, ArrowLeft, Loader2, Download, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeads, deleteLeads } from '../lib/firebase';
import { format } from 'date-fns';
import { exportLeadsToExcel } from '../utils/excelExport';
import DeleteConfirmModal from '../components/leads/DeleteConfirmModal';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  timestamp: {
    toDate: () => Date;
  };
}

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) {
        setError('Please log in to view leads');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedLeads = await getLeads(user.uid);
        setLeads(fetchedLeads as Lead[]);
        setError(null);
      } catch (err) {
        setError('Failed to fetch leads. Please try again.');
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const handleExport = async () => {
    if (filteredLeads.length === 0) {
      setExportError('No leads to export');
      return;
    }

    setExportLoading(true);
    setExportError(null);

    try {
      await exportLeadsToExcel(filteredLeads);
    } catch (err) {
      setExportError('Failed to export leads. Please try again.');
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleDelete = async () => {
    if (!user || selectedLeads.size === 0) return;

    try {
      setIsDeleting(true);
      await deleteLeads(user.uid, Array.from(selectedLeads));
      
      // Update local state
      setLeads(leads.filter(lead => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting leads:', err);
      setError('Failed to delete selected leads');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Microscope className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SkinAI</span>
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {selectedLeads.size > 0 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedLeads.size})
                  </button>
                )}
                <button
                  onClick={handleExport}
                  disabled={exportLoading || leads.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {exportLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export to Excel
                </button>
              </div>
            </div>
            {exportError && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <span>{exportError}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="mt-2 text-gray-600">Loading leads...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50">
              <p>{error}</p>
            </div>
          ) : filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLeads.size === filteredLeads.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(lead.timestamp.toDate(), 'MMM d, yyyy')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No leads found
            </div>
          )}
        </div>
      </main>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        count={selectedLeads.size}
        isDeleting={isDeleting}
      />
    </div>
  );
}