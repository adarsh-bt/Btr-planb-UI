import React from 'react';
import { Button, Stack } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportButtons({ title = 'Report', headers = [], data = [], fileName = 'export_data' }) {
  const handleExportExcel = () => {
    try {
      const sheetData = [headers, ...data];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
    } catch (err) {
      console.error('Excel Export Error:', err);
    }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF('landscape');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      doc.autoTable({
        startY: 28,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontWeight: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      doc.save(`${fileName}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    }
  };

  return (
    <Stack direction="row" spacing={1.5}>
      <Button
        variant="contained"
        color="success"
        size="small"
        startIcon={<FileDownloadOutlinedIcon />}
        onClick={handleExportExcel}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
      >
        Export Excel
      </Button>
      <Button
        variant="contained"
        color="error"
        size="small"
        startIcon={<PictureAsPdfOutlinedIcon />}
        onClick={handleExportPdf}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
      >
        Export PDF
      </Button>
    </Stack>
  );
}
