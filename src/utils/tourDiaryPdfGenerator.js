import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const safeAutoTable = (doc, options) => {
  if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(options);
  } else {
    console.error('autoTable is not available on doc');
  }
};

/**
 * Generate and download PDF for Actual Tour Diary
 */
export const exportTourDiaryPdf = ({
  tourEntries = [],
  userDetails = {},
  selectedMonth = new Date().getMonth() + 1,
  selectedYear = new Date().getFullYear(),
  fullMonthStatus = null,
  getZoneName = (zoneId) => zoneId || '—',
  getPurposeName = (purposeId) => purposeId || '—'
}) => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const monthName = MONTH_NAMES[selectedMonth - 1] || `Month ${selectedMonth}`;
    const empName = userDetails?.name || 'Officer';
    const sanitizedEmpName = String(empName).replace(/[^a-zA-Z0-9]/g, '_');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Top Portal Header Banner
    doc.setFillColor(4, 37, 94); // #04255e Navy Blue
    doc.rect(10, 8, pageWidth - 20, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GOVERNMENT OF KERALA — DEPARTMENT OF ECONOMICS AND STATISTICS', pageWidth / 2, 14, { align: 'center' });

    doc.setFontSize(13);
    doc.text('EARAS PORTAL — ACTUAL TOUR DIARY REPORT', pageWidth / 2, 21, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const generatedOn = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    doc.text(`Period: ${monthName} ${selectedYear}  |  Generated on: ${generatedOn}`, pageWidth / 2, 26, { align: 'center' });

    // 2. Metadata Section (Officer & Approval Details)
    const empId = userDetails?.penNumber || userDetails?.empNumber || userDetails?.employeeId || 'N/A';
    const designation = userDetails?.designation || 'N/A';
    const officeLocation = userDetails?.officelocation || userDetails?.officeLocation || 'N/A';

    let submissionText = 'Pending';
    if (fullMonthStatus) {
      if (fullMonthStatus.status === 'SUBMIT' || fullMonthStatus.status === 'SUBMITTED') {
        submissionText = 'Submitted';
      } else if (fullMonthStatus.status) {
        submissionText = String(fullMonthStatus.status);
      }
    }

    let verificationText = fullMonthStatus?.verified_status || fullMonthStatus?.verifiedStatus || 'Pending';
    let approvalText = fullMonthStatus?.approved_status || fullMonthStatus?.approvedStatus || fullMonthStatus?.admin_status || fullMonthStatus?.adminStatus || 'Pending';

    const metaData = [
      [
        { content: 'Employee Name:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        empName,
        { content: 'PEN / Employee ID:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        empId,
        { content: 'Month & Year:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        `${monthName} ${selectedYear}`
      ],
      [
        { content: 'Designation:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        designation,
        { content: 'Office Location:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        officeLocation,
        { content: 'Submission Status:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        submissionText
      ],
      [
        { content: 'Verification Status:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        verificationText,
        { content: 'Approval Status:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        approvalText,
        { content: 'Total Tour Entries:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        `${tourEntries.length} entries`
      ]
    ];

    safeAutoTable(doc, {
      startY: 31,
      body: metaData,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 60 },
        4: { cellWidth: 32 },
        5: { cellWidth: 58 }
      },
      margin: { left: 10, right: 10 }
    });

    // 3. Prepare Tour Entries Rows
    // Sort chronologically by date
    const sortedEntries = [...tourEntries].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.tourDate || a.date || 0);
      const dateB = new Date(b.createdAt || b.tourDate || b.date || 0);
      return dateA - dateB;
    });

    let totalDistanceSum = 0;
    let totalHoursSum = 0;

    const tableRows = sortedEntries.map((entry, index) => {
      let dateStr = '—';
      let dayName = '—';
      try {
        const date = new Date(entry.createdAt || entry.tourDate || entry.date);
        if (!isNaN(date.getTime())) {
          const day = date.getDate();
          const month = date.getMonth();
          const dName = DAY_NAMES[date.getDay()];
          dateStr = `${String(day).padStart(2, '0')} ${MONTH_NAMES[month].substring(0, 3)} ${selectedYear}`;
          dayName = dName;
        }
      } catch (e) { }

      const purpose = entry.purposeName || getPurposeName(entry.purposeId) || '—';
      const zone = entry.zoneName || getZoneName(entry.zoneId, entry) || '—';
      const cluster = entry.clusterNo || entry.clusterNumber || entry.clusterName || entry.clusterId || '—';
      const distanceNum = parseFloat(entry.distance);
      const hoursNum = parseFloat(entry.hours);

      if (!isNaN(distanceNum)) totalDistanceSum += distanceNum;
      if (!isNaN(hoursNum)) totalHoursSum += hoursNum;

      return [
        index + 1,
        dateStr,
        dayName,
        zone,
        cluster,
        entry.entryType || 'WORKING',
        entry.isAdvanceChanged ? 'Yes' : 'No',
        entry.changeReason || '—',
        purpose,
        !isNaN(distanceNum) ? distanceNum.toFixed(1) : '—',
        !isNaN(hoursNum) ? hoursNum.toFixed(1) : '—',
        entry.remark || entry.remarks || '—'
      ];
    });

    // Add Total Summary Row
    if (tableRows.length > 0) {
      tableRows.push([
        { content: 'Total', colSpan: 9, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: totalDistanceSum.toFixed(1), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: totalHoursSum.toFixed(1), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: '', styles: { fillColor: [241, 245, 249] } }
      ]);
    }

    const headers = [
      "Sl",
      "Date",
      "Day",
      "Zone",
      "Cluster No",
      "Entry Type",
      "Prog. Change",
      "Change Reason",
      "Purpose",
      "Distance (km)",
      "Hours (h)",
      "Remarks"
    ];

    const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 4 : 52;

    safeAutoTable(doc, {
      startY: currentY,
      head: [headers],
      body: tableRows.length > 0 ? tableRows : [
        [{ content: 'No tour diary entries found for this month.', colSpan: 12, styles: { halign: 'center', py: 4 } }]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [4, 37, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 2
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.6,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },   // Sl
        1: { cellWidth: 20, halign: 'center' },  // Date
        2: { cellWidth: 12, halign: 'center' },  // Day
        3: { cellWidth: 28 },                   // Zone
        4: { cellWidth: 20, halign: 'center' },  // Cluster No
        5: { cellWidth: 20, halign: 'center' },  // Entry Type
        6: { cellWidth: 18, halign: 'center' },  // Prog Change
        7: { cellWidth: 28 },                   // Change Reason
        8: { cellWidth: 35 },                   // Purpose
        9: { cellWidth: 22, halign: 'right' },   // Distance
        10: { cellWidth: 18, halign: 'right' },  // Hours
        11: { cellWidth: 48 }                   // Remarks
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 10, right: 10 }
    });

    // 4. Signatures Block
    let finalTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 40;
    // Check if space remains on page for signatures (need ~28mm)
    if (finalTableY + 28 > pageHeight - 15) {
      doc.addPage();
      finalTableY = 20;
    } else {
      finalTableY += 10;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const sigColWidth = (pageWidth - 20) / 3;

    // Signature 1: Employee
    // doc.text('Signature of Employee', 10 + 15, finalTableY);
    // doc.text(`Name: ${empName}`, 10 + 15, finalTableY + 5);
    // doc.text('Date: _______________', 10 + 15, finalTableY + 10);

    // Signature 2: Verifying Officer
    // doc.text('Signature of Verifying Officer', 10 + sigColWidth + 15, finalTableY);
    // doc.text('Designation: Field Inspector', 10 + sigColWidth + 15, finalTableY + 5);
    // doc.text('Date: _______________', 10 + sigColWidth + 15, finalTableY + 10);

    // Signature 3: Approving Authority
    // doc.text('Signature of Approving Authority', 10 + (sigColWidth * 2) + 15, finalTableY);
    // doc.text('Designation: Taluk / District Officer', 10 + (sigColWidth * 2) + 15, finalTableY + 5);
    // doc.text('Date: _______________', 10 + (sigColWidth * 2) + 15, finalTableY + 10);

    // 5. Page Numbering & Bottom Brand Footer on every page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'EARAS — Department of Economics and Statistics, Govt. of Kerala',
        10,
        pageHeight - 6
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 10,
        pageHeight - 6,
        { align: 'right' }
      );
    }

    // Save PDF file
    const fileName = `Actual_Tour_Diary_${sanitizedEmpName}_${monthName}_${selectedYear}.pdf`;
    doc.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting Tour Diary PDF:', error);
    throw error;
  }
};

/**
 * Generate and download PDF for Advanced Tour Program
 */
export const exportAdvancedTourDiaryPdf = ({
  tourEntries = [],
  userDetails = {},
  selectedMonth = new Date().getMonth() + 1,
  selectedYear = new Date().getFullYear(),
  submissionDetails = null,
  getZoneName = (zoneId) => zoneId || '—',
  getPurposeName = (purposeId) => purposeId || '—'
}) => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const monthName = MONTH_NAMES[selectedMonth - 1] || `Month ${selectedMonth}`;
    const empName = userDetails?.name || 'Officer';
    const sanitizedEmpName = String(empName).replace(/[^a-zA-Z0-9]/g, '_');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Top Header Banner
    doc.setFillColor(4, 37, 94);
    doc.rect(10, 8, pageWidth - 20, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GOVERNMENT OF KERALA — DEPARTMENT OF ECONOMICS AND STATISTICS', pageWidth / 2, 14, { align: 'center' });

    doc.setFontSize(13);
    doc.text('EARAS PORTAL — ADVANCED TOUR PROGRAM REPORT', pageWidth / 2, 21, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const generatedOn = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    doc.text(`Period: ${monthName} ${selectedYear}  |  Generated on: ${generatedOn}`, pageWidth / 2, 26, { align: 'center' });

    // 2. Metadata Section
    const empId = userDetails?.penNumber || userDetails?.empNumber || userDetails?.employeeId || 'N/A';
    const designation = userDetails?.designation || 'N/A';
    const officeLocation = userDetails?.officelocation || userDetails?.officeLocation || 'N/A';

    let firstHalfStatus = submissionDetails?.firstHalfStatus || 'Pending';
    let secondHalfStatus = submissionDetails?.secondHalfStatus || 'Pending';

    const metaData = [
      [
        { content: 'Employee Name:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        empName,
        { content: 'PEN / Employee ID:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        empId,
        { content: 'Month & Year:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        `${monthName} ${selectedYear}`
      ],
      [
        { content: 'Designation:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        designation,
        { content: 'Office Location:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        officeLocation,
        { content: 'First Half Status:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        firstHalfStatus
      ],
      [
        { content: 'Second Half Status:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        secondHalfStatus,
        { content: 'Total Planned Tours:', styles: { fontStyle: 'bold', fillColor: [240, 244, 248] } },
        `${tourEntries.length} entries`,
        { content: '', styles: { fillColor: [240, 244, 248] } },
        ''
      ]
    ];

    safeAutoTable(doc, {
      startY: 31,
      body: metaData,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 60 },
        4: { cellWidth: 32 },
        5: { cellWidth: 58 }
      },
      margin: { left: 10, right: 10 }
    });

    // 3. Prepare Rows
    const sortedEntries = [...tourEntries].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.tourDate || a.date || 0);
      const dateB = new Date(b.createdAt || b.tourDate || b.date || 0);
      return dateA - dateB;
    });

    const tableRows = sortedEntries.map((entry, index) => {
      let dateStr = '—';
      let dayName = '—';
      let half = '—';
      try {
        const date = new Date(entry.createdAt || entry.tourDate || entry.date);
        if (!isNaN(date.getTime())) {
          const day = date.getDate();
          const month = date.getMonth();
          const dName = DAY_NAMES[date.getDay()];
          dateStr = `${String(day).padStart(2, '0')} ${MONTH_NAMES[month].substring(0, 3)} ${selectedYear}`;
          dayName = dName;
          half = day <= 15 ? 'First Half' : 'Second Half';
        }
      } catch (e) { }

      const purpose = entry.purposeName || getPurposeName(entry.purposeId) || '—';
      const zone = entry.zoneName || getZoneName(entry.zoneId, entry) || '—';

      return [
        index + 1,
        dateStr,
        dayName,
        half,
        entry.entryType || 'WORKING',
        zone,
        entry.location || entry.place || '—',
        purpose,
        entry.remark || entry.remarks || '—',
        entry.status || 'PENDING'
      ];
    });

    const headers = [
      "Sl",
      "Date",
      "Day",
      "Half",
      "Entry Type",
      "Zone",
      "Location / Place",
      "Purpose",
      "Remarks",
      "Status"
    ];

    const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 4 : 52;

    safeAutoTable(doc, {
      startY: currentY,
      head: [headers],
      body: tableRows.length > 0 ? tableRows : [
        [{ content: 'No advance tour program entries found for this month.', colSpan: 10, styles: { halign: 'center', py: 4 } }]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [4, 37, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 2
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.6,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },  // Sl
        1: { cellWidth: 24, halign: 'center' },  // Date
        2: { cellWidth: 14, halign: 'center' },  // Day
        3: { cellWidth: 22, halign: 'center' },  // Half
        4: { cellWidth: 22, halign: 'center' },  // Entry Type
        5: { cellWidth: 35 },                   // Zone
        6: { cellWidth: 35 },                   // Location
        7: { cellWidth: 45 },                   // Purpose
        8: { cellWidth: 50 },                   // Remarks
        9: { cellWidth: 20, halign: 'center' }   // Status
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 10, right: 10 }
    });

    // 4. Signatures Block
    let finalTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 40;
    if (finalTableY + 28 > pageHeight - 15) {
      doc.addPage();
      finalTableY = 20;
    } else {
      finalTableY += 10;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const sigColWidth = (pageWidth - 20) / 3;

    // doc.text('Signature of Employee', 10 + 15, finalTableY);
    // doc.text(`Name: ${empName}`, 10 + 15, finalTableY + 5);
    // doc.text('Date: _______________', 10 + 15, finalTableY + 10);

    // doc.text('Signature of Verifying Officer', 10 + sigColWidth + 15, finalTableY);
    // doc.text('Designation: Field Inspector', 10 + sigColWidth + 15, finalTableY + 5);
    // doc.text('Date: _______________', 10 + sigColWidth + 15, finalTableY + 10);

    // doc.text('Signature of Approving Authority', 10 + (sigColWidth * 2) + 15, finalTableY);
    // doc.text('Designation: Taluk / District Officer', 10 + (sigColWidth * 2) + 15, finalTableY + 5);
    // doc.text('Date: _______________', 10 + (sigColWidth * 2) + 15, finalTableY + 10);

    // 5. Page Numbering & Bottom Brand Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'EARAS — Department of Economics and Statistics, Govt. of Kerala',
        10,
        pageHeight - 6
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 10,
        pageHeight - 6,
        { align: 'right' }
      );
    }

    const fileName = `Advanced_Tour_Program_${sanitizedEmpName}_${monthName}_${selectedYear}.pdf`;
    doc.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting Advanced Tour Diary PDF:', error);
    throw error;
  }
};
