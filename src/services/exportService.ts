import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Accomplishment, LearningRecord, TeamMember, MonthName } from '../types';

interface ExportOptions {
  title?: string;
  member?: TeamMember | null;
  quarter?: string;
  month?: MonthName | 'All';
  year?: number;
  accomplishments: Accomplishment[];
  learningRecords: LearningRecord[];
  teamMembers?: TeamMember[];
}

/**
 * Generates and downloads an Excel file (.xlsx) with multiple formatted tabs
 */
export const exportToExcel = ({
  title = 'Enterprise_Systems_Report',
  member,
  quarter,
  month,
  year = 2026,
  accomplishments,
  learningRecords,
  teamMembers = [],
}: ExportOptions) => {
  const wb = XLSX.utils.book_new();

  // 1. Accomplishments Sheet
  const accData = [
    [
      'Month',
      'Year',
      'Official ID',
      'Name',
      'Designation',
      'Location',
      'Work Type',
      'Accomplishment',
      'For Which Department',
      'System',
      'Time Before (min)',
      'Time After (min)',
      'Time Saved (min)',
      'Status',
      'Validation',
      'Date Logged',
    ],
    ...accomplishments.map((a) => [
      a.month,
      a.year,
      a.officialId,
      a.memberName,
      a.memberDesignation,
      a.memberLocation,
      a.workType,
      a.accomplishment,
      a.forDepartment,
      a.system,
      a.timeBeforeMin ?? '',
      a.timeAfterMin ?? '',
      a.timeSavedMin ?? 0,
      a.status,
      a.validationStatus,
      a.createdAt,
    ]),
  ];

  const wsAcc = XLSX.utils.aoa_to_sheet(accData);
  // Column widths
  wsAcc['!cols'] = [
    { wch: 12 }, // Month
    { wch: 6 },  // Year
    { wch: 12 }, // Official ID
    { wch: 22 }, // Name
    { wch: 28 }, // Designation
    { wch: 18 }, // Location
    { wch: 22 }, // Work Type
    { wch: 50 }, // Accomplishment
    { wch: 20 }, // Department
    { wch: 18 }, // System
    { wch: 14 }, // Before
    { wch: 14 }, // After
    { wch: 16 }, // Saved
    { wch: 14 }, // Status
    { wch: 12 }, // Validation
    { wch: 20 }, // Date
  ];
  XLSX.utils.book_append_sheet(wb, wsAcc, 'Accomplishments');

  // 2. Learning & Certifications Sheet
  const lrnData = [
    [
      'Month',
      'Year',
      'Official ID',
      'Name',
      'Designation',
      'Location',
      'Topic / Course Name',
      'Skill Area',
      'Learning Mode',
      'Institute / Platform',
      'Certification (Yes/No)',
      'Hours Spent',
      'Status',
      'Applied at Work',
      'Application / Outcome',
      'Validation',
    ],
    ...learningRecords.map((l) => [
      l.month,
      l.year,
      l.officialId,
      l.memberName,
      l.memberDesignation,
      l.memberLocation,
      l.topic,
      l.skillArea,
      l.learningMode,
      l.institute,
      l.certification,
      l.hoursSpent,
      l.status,
      l.appliedAtWork,
      l.applicationOutcome,
      l.validationStatus,
    ]),
  ];

  const wsLrn = XLSX.utils.aoa_to_sheet(lrnData);
  wsLrn['!cols'] = [
    { wch: 12 }, // Month
    { wch: 6 },  // Year
    { wch: 12 }, // Official ID
    { wch: 22 }, // Name
    { wch: 28 }, // Designation
    { wch: 18 }, // Location
    { wch: 38 }, // Topic
    { wch: 24 }, // Skill Area
    { wch: 20 }, // Learning Mode
    { wch: 20 }, // Institute
    { wch: 16 }, // Certification
    { wch: 12 }, // Hours
    { wch: 14 }, // Status
    { wch: 16 }, // Applied
    { wch: 45 }, // Outcome
    { wch: 12 }, // Validation
  ];
  XLSX.utils.book_append_sheet(wb, wsLrn, 'Learning_Certifications');

  // 3. Quarterly Growth & KPI Summary Sheet
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterMonths: Record<string, string[]> = {
    Q1: ['January', 'February', 'March'],
    Q2: ['April', 'May', 'June'],
    Q3: ['July', 'August', 'September'],
    Q4: ['October', 'November', 'December'],
  };

  const summaryData = [
    [
      'Quarter',
      'Year',
      'Accomplishments Count',
      'Total Time Saved (min)',
      'Time Saved (hours)',
      'Total Learning Hours',
      'Certifications Earned',
      'Active Contributors',
    ],
    ...quarters.map((q) => {
      const qMonths = quarterMonths[q];
      const qAcc = accomplishments.filter((a) => a.year === year && qMonths.includes(a.month));
      const qLrn = learningRecords.filter((l) => l.year === year && qMonths.includes(l.month));

      const timeSaved = qAcc.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
      const learningHrs = qLrn.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
      const certs = qLrn.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;
      const contributors = new Set([
        ...qAcc.map((a) => a.officialId),
        ...qLrn.map((l) => l.officialId),
      ]).size;

      return [
        q,
        year,
        qAcc.length,
        timeSaved,
        Number((timeSaved / 60).toFixed(1)),
        learningHrs,
        certs,
        contributors,
      ];
    }),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 10 },
    { wch: 8 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Quarterly_Summary');

  // 4. Team Roster Tab if available
  if (teamMembers.length > 0) {
    const rosterData = [
      ['Official ID', 'Full Name', 'Designation', 'Location', 'Department', 'Email', 'Role'],
      ...teamMembers.map((m) => [
        m.id,
        m.name,
        m.designation,
        m.location,
        m.department,
        m.email,
        m.role,
      ]),
    ];
    const wsRoster = XLSX.utils.aoa_to_sheet(rosterData);
    wsRoster['!cols'] = [
      { wch: 14 },
      { wch: 26 },
      { wch: 32 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsRoster, 'Team_Roster');
  }

  // Generate filename
  const prefix = member ? `ES_${member.id}_${member.name.replace(/\s+/g, '_')}` : 'Enterprise_Systems_Team';
  const filterDesc = quarter ? `_${quarter}` : month && month !== 'All' ? `_${month}` : '';
  const filename = `${prefix}${filterDesc}_${year}_Report.xlsx`;

  XLSX.writeFile(wb, filename);
};

/**
 * Generates and downloads a clean, professional PDF report
 */
export const exportToPdf = ({
  member,
  quarter,
  month,
  year = 2026,
  accomplishments,
  learningRecords,
}: ExportOptions) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary brand colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const accentColor: [number, number, number] = [2, 132, 199];   // Sky-600
  const secondaryColor: [number, number, number] = [71, 85, 105]; // Slate-600

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('ENTERPRISE SYSTEMS - PERFORMANCE & GROWTH REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate-300
  const timeDesc = quarter ? `Quarter: ${quarter} ${year}` : month && month !== 'All' ? `Month: ${month} ${year}` : `Year: ${year}`;
  doc.text(`Official Review Document  |  ${timeDesc}  |  Generated on ${new Date().toLocaleDateString()}`, 14, 19);

  // 2. Member or Team Info Bar
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(14, 28, pageWidth - 28, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);

  if (member) {
    doc.text(`Team Member: ${member.name} (ID: ${member.id})`, 18, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(`Role: ${member.designation}  |  Location: ${member.location}  |  Dept: ${member.department}`, 18, 41);
  } else {
    doc.text('Audience: Enterprise Systems Team-Wide Performance & Progress', 18, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text('Scope: 19 Team Members  |  Manager Review & Quarterly Executive Metrics', 18, 41);
  }

  // 3. KPI Metric Blocks
  const totalAcc = accomplishments.length;
  const completedAcc = accomplishments.filter((a) => a.status === 'Completed').length;
  const totalTimeSavedMin = accomplishments.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
  const totalTimeSavedHrs = (totalTimeSavedMin / 60).toFixed(1);
  const totalLearningHours = learningRecords.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
  const certsEarned = learningRecords.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;

  const cardY = 48;
  const cardW = (pageWidth - 28 - 15) / 4;
  const cardH = 18;

  const kpis = [
    { label: 'Accomplishments', value: `${completedAcc} / ${totalAcc}`, sub: 'Completed' },
    { label: 'Time Saved', value: `${totalTimeSavedHrs} hrs`, sub: `${totalTimeSavedMin} min total` },
    { label: 'Learning Hours', value: `${totalLearningHours} hrs`, sub: `${learningRecords.length} topics logged` },
    { label: 'Certifications', value: `${certsEarned}`, sub: 'Earned & verified' },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + 5);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.text(kpi.label.toUpperCase(), x + 4, cardY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text(kpi.value, x + 4, cardY + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, x + 4, cardY + 15.5);
  });

  let currentY = 72;

  // 4. Section 1: Accomplishments Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('1. Monthly Accomplishments & Automation Impact', 14, currentY);

  const accTableColumns = [
    { header: 'Month', dataKey: 'month' },
    ...(member ? [] : [{ header: 'Team Member', dataKey: 'member' }]),
    { header: 'Work Type', dataKey: 'workType' },
    { header: 'Accomplishment Description', dataKey: 'accomplishment' },
    { header: 'Department', dataKey: 'department' },
    { header: 'System', dataKey: 'system' },
    { header: 'Saved', dataKey: 'saved' },
    { header: 'Status', dataKey: 'status' },
  ];

  const accTableRows = accomplishments.map((a) => ({
    month: a.month.slice(0, 3) + ' ' + a.year,
    member: `${a.memberName}\n(${a.officialId})`,
    workType: a.workType,
    accomplishment: a.accomplishment,
    department: a.forDepartment,
    system: a.system,
    saved: a.timeSavedMin ? `${a.timeSavedMin}m` : '-',
    status: a.status,
  }));

  autoTable(doc, {
    startY: currentY + 3,
    head: [accTableColumns.map((c) => c.header)],
    body: accTableRows.map((r) => Object.values(r)),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      ...(member
        ? {
            1: { cellWidth: 32 },
            2: { cellWidth: 95 },
            3: { cellWidth: 32 },
            4: { cellWidth: 28 },
            5: { cellWidth: 16 },
            6: { cellWidth: 24 },
          }
        : {
            1: { cellWidth: 34 },
            2: { cellWidth: 28 },
            3: { cellWidth: 80 },
            4: { cellWidth: 26 },
            5: { cellWidth: 24 },
            6: { cellWidth: 14 },
            7: { cellWidth: 22 },
          }),
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate position after Accomplishments table
  // @ts-ignore
  let finalY = doc.lastAutoTable?.finalY || 140;

  // Check if we need page break for Learning section
  if (finalY > 150) {
    doc.addPage();
    // Mini header on page 2
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('ENTERPRISE SYSTEMS - LEARNING & CERTIFICATIONS', 14, 8);
    currentY = 20;
  } else {
    currentY = finalY + 10;
  }

  // 5. Section 2: Learning & Certifications Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('2. Monthly Learning, Certifications & Practical Work Application', 14, currentY);

  const lrnTableColumns = [
    { header: 'Month', dataKey: 'month' },
    ...(member ? [] : [{ header: 'Team Member', dataKey: 'member' }]),
    { header: 'Topic / Course Name', dataKey: 'topic' },
    { header: 'Skill Area', dataKey: 'skill' },
    { header: 'Institute', dataKey: 'institute' },
    { header: 'Hours', dataKey: 'hours' },
    { header: 'Cert', dataKey: 'cert' },
    { header: 'Applied at Work & Outcome', dataKey: 'outcome' },
  ];

  const lrnTableRows = learningRecords.map((l) => ({
    month: l.month.slice(0, 3) + ' ' + l.year,
    member: `${l.memberName}\n(${l.officialId})`,
    topic: l.topic,
    skill: l.skillArea,
    institute: l.institute,
    hours: `${l.hoursSpent}h`,
    cert: l.certification === 'Yes' ? 'Yes ✓' : 'No',
    outcome: l.applicationOutcome || (l.appliedAtWork === 'Yes' ? 'Applied at work' : 'Pending application'),
  }));

  autoTable(doc, {
    startY: currentY + 3,
    head: [lrnTableColumns.map((c) => c.header)],
    body: lrnTableRows.map((r) => Object.values(r)),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [2, 132, 199], // Sky-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      ...(member
        ? {
            1: { cellWidth: 65 },
            2: { cellWidth: 35 },
            3: { cellWidth: 26 },
            4: { cellWidth: 16 },
            5: { cellWidth: 18 },
            6: { cellWidth: 67 },
          }
        : {
            1: { cellWidth: 32 },
            2: { cellWidth: 50 },
            3: { cellWidth: 30 },
            4: { cellWidth: 22 },
            5: { cellWidth: 14 },
            6: { cellWidth: 16 },
            7: { cellWidth: 63 },
          }),
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Enterprise Systems Performance Portal  |  Official Confidential Report  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  const prefix = member ? `ES_${member.id}_${member.name.replace(/\s+/g, '_')}` : 'Enterprise_Systems_Team';
  const filterDesc = quarter ? `_${quarter}` : month && month !== 'All' ? `_${month}` : '';
  const filename = `${prefix}${filterDesc}_${year}_Review.pdf`;

  doc.save(filename);
};
