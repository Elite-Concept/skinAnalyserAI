import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  timestamp: {
    toDate: () => Date;
  };
  status: string;
}

export const exportLeadsToExcel = (leads: Lead[]) => {
  try {
    // Transform leads data for Excel format
    const excelData = leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Date: format(lead.timestamp.toDate(), 'MMM d, yyyy'),
      Status: lead.status.charAt(0).toUpperCase() + lead.status.slice(1)
    }));

    // Create workbook and worksheet
    const worksheet = utils.json_to_sheet(excelData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Auto-size columns
    const colWidths = [
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // Date
      { wch: 12 }  // Status
    ];
    worksheet['!cols'] = colWidths;

    // Generate filename with current date
    const fileName = `leads_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    // Save file
    writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error('Error exporting leads:', error);
    throw new Error('Failed to export leads data');
  }
};