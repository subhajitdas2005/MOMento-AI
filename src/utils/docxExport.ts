import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
} from 'docx';
import { MoMData } from '@/types/mom';
import { triggerFileDownload } from './downloadHelper';

export async function exportToDocx(mom: MoMData): Promise<void> {
  try {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        text: mom.meeting_title || 'Minutes of Meeting',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
      })
    );

    // Subtitle
    const genDate = mom.generatedAt
      ? new Date(mom.generatedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Official Meeting Record  •  Generated on ${genDate}`,
            italics: true,
            color: '64748B',
            size: 18,
          }),
        ],
        spacing: { after: 240 },
      })
    );

    // Metadata Table if available
    const meta = mom.metadata;
    if (meta) {
      const metaRows: TableRow[] = [];

      const addMetaRow = (label: string, value: string) => {
        metaRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })],
              }),
            ],
          })
        );
      };

      if (meta.date) addMetaRow('Date', meta.date);
      if (meta.startTime || meta.endTime) addMetaRow('Time', `${meta.startTime || '--'} to ${meta.endTime || '--'}`);
      if (meta.venue) addMetaRow('Venue / Channel', meta.venue);
      if (meta.attendees && meta.attendees.length > 0) addMetaRow('Attendees', meta.attendees.join(', '));

      if (metaRows.length > 0) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: metaRows,
          })
        );
        children.push(new Paragraph({ spacing: { after: 200 } }));
      }
    }

    // 1. Executive Summary
    children.push(
      new Paragraph({
        text: '1. Executive Summary',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: mom.summary || 'No summary available.',
            size: 22,
          }),
        ],
        spacing: { after: 240 },
      })
    );

    // 2. Key Discussion Points
    if (mom.discussion_points && mom.discussion_points.length > 0) {
      children.push(
        new Paragraph({
          text: '2. Key Discussion Points',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );

      mom.discussion_points.forEach((point, index) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${point.topic}`,
                bold: true,
                size: 22,
                color: '0D9488',
              }),
            ],
            spacing: { before: 100, after: 60 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: point.details,
                size: 20,
              }),
            ],
            spacing: { after: 140 },
          })
        );
      });
    }

    // 3. Key Decisions
    if (mom.decisions && mom.decisions.length > 0) {
      children.push(
        new Paragraph({
          text: '3. Key Decisions & Approvals',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );

      mom.decisions.forEach((dec) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `✔  ${dec}`,
                size: 21,
              }),
            ],
            spacing: { after: 80 },
          })
        );
      });
      children.push(new Paragraph({ spacing: { after: 140 } }));
    }

    // 4. Action Items Table
    if (mom.action_items && mom.action_items.length > 0) {
      children.push(
        new Paragraph({
          text: '4. Action Items & Deliverables',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );

      const actionTableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '0F172A' },
              children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 20 })] })],
            }),
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '0F172A' },
              children: [new Paragraph({ children: [new TextRun({ text: 'Action Item / Task', bold: true, color: 'FFFFFF', size: 20 })] })],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '0F172A' },
              children: [new Paragraph({ children: [new TextRun({ text: 'Owner', bold: true, color: 'FFFFFF', size: 20 })] })],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '0F172A' },
              children: [new Paragraph({ children: [new TextRun({ text: 'Deadline', bold: true, color: 'FFFFFF', size: 20 })] })],
            }),
          ],
        }),
      ];

      mom.action_items.forEach((item, index) => {
        const isAlt = index % 2 === 1;
        actionTableRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 10, type: WidthType.PERCENTAGE },
                shading: isAlt ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
                children: [new Paragraph({ text: `${index + 1}` })],
              }),
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                shading: isAlt ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
                children: [new Paragraph({ text: item.task })],
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                shading: isAlt ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
                children: [new Paragraph({ text: item.assigned_to || 'Unassigned' })],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: isAlt ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
                children: [new Paragraph({ text: item.deadline || 'TBD' })],
              }),
            ],
          })
        );
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: actionTableRows,
        })
      );
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // 5. Unresolved Issues
    if (mom.unresolved_issues && mom.unresolved_issues.length > 0) {
      children.push(
        new Paragraph({
          text: '5. Unresolved Issues & Blockers',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );

      mom.unresolved_issues.forEach((issue) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `⚠  ${issue}`,
                size: 21,
                color: 'DC2626',
              }),
            ],
            spacing: { after: 80 },
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const safeTitle = (mom.meeting_title || 'Meeting_Minutes')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = `${safeTitle || 'Meeting'}_MoM.docx`;

    triggerFileDownload(
      blob,
      filename,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  } catch (err) {
    console.error('DOCX export fatal error:', err);
    throw err;
  }
}
