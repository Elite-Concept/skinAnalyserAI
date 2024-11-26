import { ArrowDown, ArrowUp } from 'lucide-react';
import { Lead } from '../../pages/Leads';
import LeadStatusBadge from './LeadStatusBadge';

interface LeadsTableProps {
  leads: Lead[];
  sortField: keyof Lead;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Lead) => void;
}

export default function LeadsTable({
  leads,
  sortField,
  sortDirection,
  onSort
}: LeadsTableProps) {
  const SortIcon = sortDirection === 'asc' ? ArrowUp : ArrowDown;

  const renderSortIcon = (field: keyof Lead) => {
    if (sortField === field) {
      return <SortIcon className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-1">
                Name
                {renderSortIcon('name')}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('email')}
            >
              <div className="flex items-center gap-1">
                Email
                {renderSortIcon('email')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('timestamp')}
            >
              <div className="flex items-center gap-1">
                Date
                {renderSortIcon('timestamp')}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                {renderSortIcon('status')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
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
                  {lead.timestamp.toDate().toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <LeadStatusBadge status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}