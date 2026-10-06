import { MoMData } from '@/types/mom';

export function formatMoMToMarkdown(mom: MoMData): string {
  const meta = mom.metadata;
  let md = `# ${mom.meeting_title || 'Minutes of Meeting'}\n\n`;

  if (meta) {
    md += `**Date:** ${meta.date || 'N/A'}  \n`;
    if (meta.startTime || meta.endTime) {
      md += `**Time:** ${meta.startTime || '--'} - ${meta.endTime || '--'}  \n`;
    }
    if (meta.venue) {
      md += `**Venue:** ${meta.venue}  \n`;
    }
    if (meta.attendees && meta.attendees.length > 0) {
      md += `**Attendees:** ${meta.attendees.join(', ')}  \n`;
    }
    md += `\n---\n\n`;
  }

  md += `## 1. Executive Summary\n\n${mom.summary || 'No summary available.'}\n\n`;

  if (mom.discussion_points && mom.discussion_points.length > 0) {
    md += `## 2. Key Discussion Points\n\n`;
    mom.discussion_points.forEach((p, i) => {
      md += `### ${i + 1}. ${p.topic}\n${p.details}\n\n`;
    });
  }

  if (mom.decisions && mom.decisions.length > 0) {
    md += `## 3. Decisions & Approvals\n\n`;
    mom.decisions.forEach((d) => {
      md += `- [x] ${d}\n`;
    });
    md += `\n`;
  }

  if (mom.action_items && mom.action_items.length > 0) {
    md += `## 4. Action Items & Deliverables\n\n`;
    md += `| # | Task / Deliverable | Responsible | Deadline | Status |\n`;
    md += `|---|---|---|---|---|\n`;
    mom.action_items.forEach((item, i) => {
      md += `| ${i + 1} | ${item.task} | ${item.assigned_to || 'Unassigned'} | ${item.deadline || 'TBD'} | ${item.status || 'Pending'} |\n`;
    });
    md += `\n`;
  }

  if (mom.unresolved_issues && mom.unresolved_issues.length > 0) {
    md += `## 5. Unresolved Issues & Blockers\n\n`;
    mom.unresolved_issues.forEach((issue) => {
      md += `- ⚠️ ${issue}\n`;
    });
    md += `\n`;
  }

  return md;
}
