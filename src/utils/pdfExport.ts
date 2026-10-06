import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MoMData } from '@/types/mom';
import { triggerFileDownload } from './downloadHelper';

/**
 * Resilient helper to execute autoTable regardless of ESM / CJS bundler format
 */
type AnyFunc = (...args: unknown[]) => unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runAutoTable(doc: jsPDF, options: any) {
  try {
    if (typeof (doc as unknown as { autoTable?: AnyFunc }).autoTable === 'function') {
      (doc as unknown as { autoTable: AnyFunc }).autoTable(options);
    } else if (typeof autoTable === 'function') {
      autoTable(doc, options);
    } else if (autoTable && typeof (autoTable as unknown as { default?: AnyFunc }).default === 'function') {
      (autoTable as unknown as { default: AnyFunc }).default(doc, options);
    }
  } catch (err) {
    console.warn('autoTable invocation warning:', err);
  }
}

function getLastAutoTableY(doc: jsPDF, fallbackY: number): number {
  const last = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  if (last && typeof last.finalY === 'number') {
    return last.finalY;
  }
  return fallbackY;
}

/**
 * Clean text to safe standard ASCII / Latin-1 for standard jsPDF Helvetica fonts.
 * Replaces fancy unicode quotes, em-dashes, bullets, and symbols that corrupt standard PDF fonts.
 */
function cleanText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    // Quotes and apostrophes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Dashes & hyphens
    .replace(/[\u2013\u2014\u2015]/g, ' - ')
    .replace(/[\u2212]/g, '-')
    // Bullets & dots
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/[\u2026]/g, '...')
    // Symbols / checkmarks / icons
    .replace(/[\u2713\u2714\u2611]/g, '[x]')
    .replace(/[\u26A0\u2757\u274C]/g, '!')
    .replace(/[\u2010\u2011\u2012]/g, '-')
    // Whitespace / NBSP / Zero-width
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Strip any remaining out-of-range unicode
    .replace(/[^\x20-\x7E\t\n\r]/g, '')
    .trim();
}

/**
 * Draw a clean vector checkmark icon badge (avoids unicode font bugs in standard PDF fonts)
 */
function drawCheckmarkBadge(doc: jsPDF, x: number, y: number, size = 4.2) {
  // Rounded circle background
  doc.setFillColor(13, 148, 136); // Teal 600
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');

  // Crisp white check lines
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.55);
  doc.line(x + size * 0.26, y + size * 0.52, x + size * 0.44, y + size * 0.72);
  doc.line(x + size * 0.44, y + size * 0.72, x + size * 0.76, y + size * 0.28);
}

/**
 * Draw a clean vector warning alert badge
 */
function drawWarningBadge(doc: jsPDF, x: number, y: number, size = 4.2) {
  // Red/Amber filled circle
  doc.setFillColor(225, 29, 72); // Rose 600
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');

  // White exclamation mark
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('!', x + size / 2, y + size * 0.74, { align: 'center' });
}

export function exportToPDF(mom: MoMData): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const margin = 16;
    const contentWidth = pageWidth - margin * 2; // 178mm
    const maxContentY = 266; // Leave room for footer at 282-290mm
    let currentY = margin;

    // Harmonious Executive Color Palette
    const colorPrimary: [number, number, number] = [15, 23, 42]; // Slate 900
    const colorSecondary: [number, number, number] = [51, 65, 85]; // Slate 700
    const colorTeal: [number, number, number] = [13, 148, 136]; // Teal 600
    const colorMuted: [number, number, number] = [100, 116, 139]; // Slate 500
    const colorLightBg: [number, number, number] = [248, 250, 252]; // Slate 50
    const colorBorder: [number, number, number] = [226, 232, 240]; // Slate 200
    const colorRose: [number, number, number] = [225, 29, 72]; // Rose 600
    const colorRoseBg: [number, number, number] = [255, 241, 242]; // Rose 50
    const colorRoseBorder: [number, number, number] = [254, 205, 211]; // Rose 200

    // Helper: Safe Page Break Manager
    const ensureSpace = (neededHeight: number) => {
      if (currentY + neededHeight > maxContentY) {
        doc.addPage();
        currentY = margin + 2;
        return true;
      }
      return false;
    };

    // Helper: Draw Section Title
    const drawSectionHeader = (number: string, title: string, isAlert = false) => {
      ensureSpace(32); // Ensure title + at least 1-2 items fit on page
      
      // Small accent tag pill
      doc.setFillColor(...(isAlert ? colorRose : colorTeal));
      doc.roundedRect(margin, currentY, 3.5, 7, 1, 1, 'F');

      // Title Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(...(isAlert ? colorRose : colorPrimary));
      doc.text(`${number}. ${cleanText(title)}`, margin + 6.5, currentY + 5.2);

      currentY += 10;
    };

    // ==========================================
    // 1. TOP DOCUMENT HEADER & BRANDING
    // ==========================================
    // Accent top stripe
    doc.setFillColor(...colorTeal);
    doc.rect(margin, currentY, contentWidth, 2, 'F');
    currentY += 6;

    // Tag badge
    doc.setFillColor(...colorLightBg);
    doc.roundedRect(margin, currentY, 48, 5.5, 1, 1, 'F');
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(margin, currentY, 48, 5.5, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTeal);
    doc.text('OFFICIAL RECORD', margin + 3.5, currentY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorMuted);
    const genDate = mom.generatedAt
      ? new Date(mom.generatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    doc.text(`Generated: ${genDate}`, pageWidth - margin, currentY + 3.8, { align: 'right' });

    currentY += 9;

    // Meeting Title (Multi-line safe)
    const rawTitle = mom.meeting_title || 'MINUTES OF MEETING';
    const cleanedTitle = cleanText(rawTitle);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colorPrimary);
    const titleLines = doc.splitTextToSize(cleanedTitle, contentWidth);
    doc.text(titleLines, margin, currentY + 4);
    currentY += titleLines.length * 6.5 + 4;

    // ==========================================
    // 2. METADATA SUMMARY GRID (Table / Card)
    // ==========================================
    const meta = mom.metadata;
    const metaRows: [string, string][] = [];
    if (meta?.date) metaRows.push(['Date:', cleanText(meta.date)]);
    if (meta?.startTime || meta?.endTime) {
      metaRows.push(['Time / Duration:', `${cleanText(meta.startTime || '--')} to ${cleanText(meta.endTime || '--')}`]);
    }
    if (meta?.venue) metaRows.push(['Venue / Channel:', cleanText(meta.venue)]);
    if (meta?.attendees && meta.attendees.length > 0) {
      metaRows.push(['Attendees:', cleanText(meta.attendees.join(', '))]);
    }

    if (metaRows.length > 0) {
      runAutoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        body: metaRows,
        theme: 'plain',
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
          textColor: colorSecondary,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: colorMuted, cellWidth: 32 },
          1: { cellWidth: 'auto', textColor: colorPrimary },
        },
      });

      currentY = getLastAutoTableY(doc, currentY + metaRows.length * 6) + 4;
    }

    // Divider Line
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // ==========================================
    // 3. SECTION 1: EXECUTIVE SUMMARY
    // ==========================================
    drawSectionHeader('1', 'Executive Summary');

    const cleanSummary = cleanText(mom.summary || 'No executive summary provided for this meeting.');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(cleanSummary, contentWidth - 12);
    const summaryCardHeight = summaryLines.length * 4.6 + 8;

    ensureSpace(summaryCardHeight);

    // Summary Card Background & Left Accent Bar
    doc.setFillColor(...colorLightBg);
    doc.roundedRect(margin, currentY, contentWidth, summaryCardHeight, 2, 2, 'F');
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(margin, currentY, contentWidth, summaryCardHeight, 2, 2, 'S');

    // Left teal border bar
    doc.setFillColor(...colorTeal);
    doc.roundedRect(margin, currentY, 2.5, summaryCardHeight, 1, 1, 'F');

    // Summary text
    doc.setTextColor(...colorSecondary);
    doc.text(summaryLines, margin + 6, currentY + 5.5);
    currentY += summaryCardHeight + 8;

    // ==========================================
    // 4. SECTION 2: KEY DISCUSSION POINTS
    // ==========================================
    if (mom.discussion_points && mom.discussion_points.length > 0) {
      drawSectionHeader('2', 'Key Discussion Points');

      mom.discussion_points.forEach((point, index) => {
        const topicText = cleanText(point.topic || `Topic ${index + 1}`);
        const detailsText = cleanText(point.details || '');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        const topicLines = doc.splitTextToSize(topicText, contentWidth - 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const detailLines = doc.splitTextToSize(detailsText, contentWidth - 14);

        const pointHeight = topicLines.length * 4.5 + detailLines.length * 4.2 + 8;
        ensureSpace(pointHeight);

        // Point Card
        doc.setFillColor(252, 253, 254);
        doc.roundedRect(margin, currentY, contentWidth, pointHeight, 1.5, 1.5, 'F');
        doc.setDrawColor(...colorBorder);
        doc.roundedRect(margin, currentY, contentWidth, pointHeight, 1.5, 1.5, 'S');

        // Numeric Badge Pill
        doc.setFillColor(...colorPrimary);
        doc.roundedRect(margin + 3, currentY + 3, 5, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(`${index + 1}`, margin + 5.5, currentY + 6.6, { align: 'center' });

        // Topic Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...colorPrimary);
        doc.text(topicLines, margin + 11, currentY + 6.5);

        // Details
        const detailY = currentY + 7 + topicLines.length * 4.5;
        if (detailLines.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...colorSecondary);
          doc.text(detailLines, margin + 11, detailY);
        }

        currentY += pointHeight + 3.5;
      });

      currentY += 4;
    }

    // ==========================================
    // 5. SECTION 3: KEY DECISIONS & APPROVALS
    // ==========================================
    if (mom.decisions && mom.decisions.length > 0) {
      drawSectionHeader('3', 'Key Decisions & Approvals');

      mom.decisions.forEach((dec) => {
        const cleanDec = cleanText(dec);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        const decLines = doc.splitTextToSize(cleanDec, contentWidth - 16);
        const decHeight = Math.max(decLines.length * 4.4 + 6, 9);

        ensureSpace(decHeight);

        // Decision Row Card
        doc.setFillColor(240, 253, 250); // Mint / Slate tinted 50
        doc.roundedRect(margin, currentY, contentWidth, decHeight, 1.5, 1.5, 'F');
        doc.setDrawColor(204, 251, 241); // Teal 100
        doc.roundedRect(margin, currentY, contentWidth, decHeight, 1.5, 1.5, 'S');

        // Draw crisp vector checkmark badge
        drawCheckmarkBadge(doc, margin + 3.5, currentY + (decHeight - 4.2) / 2, 4.2);

        // Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        doc.setTextColor(...colorSecondary);
        doc.text(decLines, margin + 11, currentY + 4.8);

        currentY += decHeight + 3;
      });

      currentY += 4;
    }

    // ==========================================
    // 6. SECTION 4: ACTION ITEMS & DELIVERABLES
    // ==========================================
    if (mom.action_items && mom.action_items.length > 0) {
      drawSectionHeader('4', 'Action Items & Deliverables');

      const actionTableData = mom.action_items.map((item, i) => [
        `${i + 1}`,
        cleanText(item.task),
        cleanText(item.assigned_to || 'Unassigned'),
        cleanText(item.deadline || 'TBD'),
      ]);

      runAutoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['#', 'Action Item / Deliverable', 'Owner', 'Deadline']],
        body: actionTableData,
        theme: 'grid',
        headStyles: {
          fillColor: colorPrimary,
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 3,
        },
        styles: {
          fontSize: 8.2,
          cellPadding: 2.8,
          textColor: colorSecondary,
          lineColor: colorBorder,
          lineWidth: 0.3,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center', fontStyle: 'bold', textColor: colorMuted },
          1: { cellWidth: 'auto', textColor: colorPrimary },
          2: { cellWidth: 42, fontStyle: 'bold', textColor: colorSecondary },
          3: { cellWidth: 32, textColor: colorTeal },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY = getLastAutoTableY(doc, currentY + mom.action_items.length * 8) + 8;
    }

    // ==========================================
    // 7. SECTION 5: UNRESOLVED ISSUES & BLOCKERS
    // ==========================================
    if (mom.unresolved_issues && mom.unresolved_issues.length > 0) {
      drawSectionHeader('5', 'Unresolved Issues & Blockers', true);

      mom.unresolved_issues.forEach((issue) => {
        const cleanIssue = cleanText(issue);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        const issueLines = doc.splitTextToSize(cleanIssue, contentWidth - 16);
        const issueHeight = Math.max(issueLines.length * 4.4 + 6, 9);

        ensureSpace(issueHeight);

        // Alert Box Card
        doc.setFillColor(...colorRoseBg);
        doc.roundedRect(margin, currentY, contentWidth, issueHeight, 1.5, 1.5, 'F');
        doc.setDrawColor(...colorRoseBorder);
        doc.roundedRect(margin, currentY, contentWidth, issueHeight, 1.5, 1.5, 'S');

        // Draw crisp warning badge
        drawWarningBadge(doc, margin + 3.5, currentY + (issueHeight - 4.2) / 2, 4.2);

        // Issue Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        doc.setTextColor(159, 18, 57); // Rose 900
        doc.text(issueLines, margin + 11, currentY + 4.8);

        currentY += issueHeight + 3;
      });
    }

    // ==========================================
    // 8. MULTI-PAGE FOOTER PASS
    // ==========================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer Divider Line
      doc.setDrawColor(...colorBorder);
      doc.setLineWidth(0.3);
      doc.line(margin, 283, pageWidth - margin, 283);

      // Left Footer Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...colorMuted);
      doc.text('Confidential  |  AI-Generated Minutes of Meeting (MoM)', margin, 288);

      // Right Footer Page Count
      doc.setFont('helvetica', 'bold');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 288, { align: 'right' });
    }

    // Trigger download
    const pdfBlob = doc.output('blob');
    const safeTitle = (mom.meeting_title || 'Meeting_Minutes')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = `${safeTitle || 'Meeting'}_MoM.pdf`;

    triggerFileDownload(pdfBlob, filename, 'application/pdf');
  } catch (err) {
    console.error('PDF export fatal error:', err);
    throw err;
  }
}
