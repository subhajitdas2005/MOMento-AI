import { MeetingMetadata, MoMData } from '@/types/mom';

export interface PresetMeeting {
  id: string;
  name: string;
  badge: string;
  description: string;
  metadata: MeetingMetadata;
  transcript: string;
  sampleMoM: MoMData;
}

export const PRESET_MEETINGS: PresetMeeting[] = [
  {
    id: 'sprint-planning',
    name: 'Q3 Product & Engineering Sprint Planning',
    badge: 'Engineering & Product',
    description: 'Bi-weekly sprint planning focusing on AI search integration, PostgreSQL schema migration, and mobile responsiveness.',
    metadata: {
      title: 'Q3 Product & Engineering Sprint Planning',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      venue: 'Google Meet / Conf Room 4B',
      attendees: ['Alex Chen (Lead Eng)', 'Sarah Miller (Product)', 'David Ross (Backend)', 'Priya Patel (Design)']
    },
    transcript: `Alex Chen (Lead Eng): Good morning everyone, thanks for joining on time. Today our main agenda is locking down the deliverables for Sprint 34. Sarah, do you want to start with the product priorities?

Sarah Miller (Product): Thanks Alex. Our primary objective this sprint is finalizing the AI Semantic Search feature for enterprise customers. From customer interviews, 78% of enterprise beta users requested faster indexing and filter options by department. We also need to fix the mobile layout on the analytics dashboard before next Tuesday's demo.

David Ross (Backend): On the backend side, we started the PostgreSQL database migration to add vector indexing with pgvector. The initial benchmark showed a 4x reduction in query latency. However, we have a schema migration dependency that requires about 12 hours of maintenance window.

Alex Chen (Lead Eng): Let's make sure we schedule that maintenance window during the weekend to avoid impacting US business hours. Sunday at 2:00 AM UTC works best. David, can you draft the maintenance notice and coordinate with DevOps?

David Ross (Backend): Absolutely, I will have the maintenance plan and email draft ready by Thursday at 5 PM.

Priya Patel (Design): Regarding the mobile dashboard layout, I finished the new responsive Figma components yesterday. The export includes updated CSS variable tokens and simplified card padding for small screens. I've shared the Figma link in the design channel.

Sarah Miller (Product): Perfect. Priya, can you also review the frontend PR with Alex once the UI team pushes their branch?

Priya Patel (Design): Yes, I will do the design QA review by Friday morning.

Alex Chen (Lead Eng): Great. To summarize decisions: 
1. We are prioritizing the AI Semantic Search and mobile analytics fixes for Sprint 34.
2. The database migration will be scheduled for this Sunday at 2:00 AM UTC.
3. David is handling DevOps notification by Thursday 5 PM.
4. Priya will complete Design QA on Friday.

Sarah Miller (Product): One unresolved point: we still need legal approval for the updated data privacy disclaimer on the AI search prompt. I've pinged Marcus in Legal, but haven't received a final sign-off yet.

Alex Chen (Lead Eng): Let's flag that as a potential blocker. Sarah, please escalate to Marcus today so we don't delay the staging release. Thanks everyone, meeting adjourned!`,
    sampleMoM: {
      meeting_title: 'Q3 Product & Engineering Sprint Planning',
      summary: 'The team aligned on the primary deliverables for Sprint 34, focusing on AI Semantic Search indexing filters and mobile analytics dashboard fixes. A critical PostgreSQL vector migration was scheduled for Sunday at 2:00 AM UTC to minimize business disruption. Outstanding legal approval for data privacy remains the main release blocker.',
      discussion_points: [
        {
          topic: 'AI Semantic Search & Indexing Filters',
          details: '78% of enterprise beta customers requested faster indexing and department filtering options. Identified as top priority for Sprint 34.'
        },
        {
          topic: 'PostgreSQL Database & Vector Migration',
          details: 'pgvector benchmark showed a 4x reduction in query latency. Requires a 12-hour maintenance window scheduled for Sunday 2:00 AM UTC.'
        },
        {
          topic: 'Mobile Analytics Dashboard Polish',
          details: 'Priya Patel finalized updated Figma components with responsive tokens and streamlined card padding for smaller viewports.'
        }
      ],
      decisions: [
        'Prioritize AI Semantic Search indexing and mobile dashboard fixes for Sprint 34.',
        'Schedule database pgvector migration for Sunday at 2:00 AM UTC.',
        'Deploy mobile layout updates before next Tuesday demo.'
      ],
      action_items: [
        {
          id: 'action-1',
          task: 'Draft maintenance plan notice & coordinate with DevOps',
          assigned_to: 'David Ross (Backend)',
          deadline: 'Thursday 5:00 PM',
          status: 'pending'
        },
        {
          id: 'action-2',
          task: 'Conduct Design QA on frontend responsive PR',
          assigned_to: 'Priya Patel (Design)',
          deadline: 'Friday morning',
          status: 'pending'
        },
        {
          id: 'action-3',
          task: 'Escalate AI privacy disclaimer to Marcus in Legal',
          assigned_to: 'Sarah Miller (Product)',
          deadline: 'Today by EOD',
          status: 'in_progress'
        }
      ],
      unresolved_issues: [
        'Awaiting final sign-off from Legal (Marcus) on the updated data privacy disclaimer for the AI search prompt.'
      ],
      metadata: {
        title: 'Q3 Product & Engineering Sprint Planning',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        venue: 'Google Meet / Conf Room 4B',
        attendees: ['Alex Chen (Lead Eng)', 'Sarah Miller (Product)', 'David Ross (Backend)', 'Priya Patel (Design)']
      },
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: 'board-sync',
    name: 'Executive Board Strategy & Q4 Budget Sync',
    badge: 'Executive',
    description: 'Quarterly strategic alignment on European expansion, marketing allocation, and Series B investor relations.',
    metadata: {
      title: 'Executive Board Strategy & Q4 Budget Review',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:30',
      venue: 'Main Executive Boardroom',
      attendees: ['Elena Vance (CEO)', 'Robert King (CFO)', 'Michael Chang (Head of Growth)', 'Claire Wright (VP Sales)']
    },
    transcript: `Elena Vance (CEO): Welcome everyone to our Q4 Executive Strategy Sync. Today we need to formally approve the European market expansion budget and review our growth metrics leading up to our Series B conversations in November. Robert, please walk us through the revised financials.

Robert King (CFO): Thank you Elena. Following our revised projections, we have allocated $1.2M towards the EMEA launch for Q4. This includes hiring 4 senior sales reps in London and Berlin, local compliance certifications, and localized marketing campaigns. Our runway remains healthy at 22 months post-allocation.

Michael Chang (Head of Growth): On growth, our organic acquisition grew by 34% month-over-month in DACH and UK regions without paid spend. We estimate that with a $350k targeted digital ad spend across LinkedIn and search, we can capture 45 new enterprise accounts by end of December.

Claire Wright (VP Sales): My team has already pre-qualified 18 enterprise leads in Frankfurt and London. We urgently need the GDPR data residency compliance sign-off so we can sign contracts before their end-of-year budget freeze.

Elena Vance (CEO): Good points. Let's make the decisions:
1. We unanimously approve the $1.2M Q4 EMEA expansion budget.
2. Michael's growth team will proceed with the $350k digital marketing campaign starting October 1st.
3. Robert will finalize the Series B investor pitch deck and data room by October 15th.
4. Claire and Legal must finalize the EU data processing addendum (DPA) by next Wednesday.

Robert King (CFO): Noted. One remaining issue is currency hedging for our GBP and EUR revenues given recent volatility. I will consult our treasury bank and present an update next Monday.

Elena Vance (CEO): Agreed. Let's execute on these timelines. Thank you all.`,
    sampleMoM: {
      meeting_title: 'Executive Board Strategy & Q4 Budget Review',
      summary: 'The Executive Board approved a $1.2M Q4 expansion allocation for EMEA operations, covering sales hires and local compliance certifications. A $350k digital marketing campaign was authorized to accelerate DACH and UK market penetration ahead of the November Series B fundraise.',
      discussion_points: [
        {
          topic: 'EMEA Expansion Budget & Runway',
          details: 'Approved $1.2M allocation for hiring 4 enterprise sales representatives in London and Berlin. Financial runway stands strong at 22 months post-allocation.'
        },
        {
          topic: 'Targeted Marketing & Enterprise Pipeline',
          details: 'Organic acquisition grew 34% MoM in DACH. Claire pre-qualified 18 enterprise leads awaiting final GDPR data residency addendums.'
        },
        {
          topic: 'Series B Fundraising Timeline',
          details: 'Pitch deck and investor data room preparation scheduled for mid-October ahead of partner meetings in November.'
        }
      ],
      decisions: [
        'Unanimously approved the $1.2M Q4 European expansion budget.',
        'Approved $350k targeted digital ad spend commencing October 1st.',
        'Finalize Series B data room by October 15th.'
      ],
      action_items: [
        {
          id: 'action-1',
          task: 'Finalize Series B pitch deck and investor data room',
          assigned_to: 'Robert King (CFO)',
          deadline: 'October 15',
          status: 'pending'
        },
        {
          id: 'action-2',
          task: 'Finalize EU Data Processing Addendum (DPA) with Legal',
          assigned_to: 'Claire Wright (VP Sales)',
          deadline: 'Next Wednesday',
          status: 'in_progress'
        },
        {
          id: 'action-3',
          task: 'Consult treasury bank regarding GBP/EUR foreign currency hedging',
          assigned_to: 'Robert King (CFO)',
          deadline: 'Next Monday',
          status: 'pending'
        }
      ],
      unresolved_issues: [
        'Foreign exchange (FX) currency hedging strategy for European revenue volatility to be reviewed next Monday.'
      ],
      metadata: {
        title: 'Executive Board Strategy & Q4 Budget Review',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30',
        venue: 'Main Executive Boardroom',
        attendees: ['Elena Vance (CEO)', 'Robert King (CFO)', 'Michael Chang (Head of Growth)', 'Claire Wright (VP Sales)']
      },
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: 'client-kickoff',
    name: 'Enterprise Client Onboarding & System Kickoff',
    badge: 'Client Success',
    description: 'Technical architecture kickoff, SSO integration, SAML configuration, and delivery milestones.',
    metadata: {
      title: 'Enterprise Client Onboarding Kickoff - Acme Corp',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '17:00',
      venue: 'Zoom (Room ID: 839-201-9921)',
      attendees: ['Liam Scott (Solutions Architect)', 'Maya Lin (Customer Success)', 'Tom Bradley (Acme CTO)', 'Jessica Vance (Acme IT Lead)']
    },
    transcript: `Maya Lin (Customer Success): Hi Tom, Jessica, great to meet you both! Welcome to our enterprise onboarding kickoff for Acme Corp. Today we want to establish the milestones for deploying our platform across your 2,500 employees.

Tom Bradley (Acme CTO): Thanks Maya, Liam. Our key priority is ensuring Single Sign-On (SSO) via Okta is configured with SAML 2.0 and Role-Based Access Control (RBAC). We have an internal rollout deadline of November 1st for our entire sales and operations org.

Liam Scott (Solutions Architect): Understood Tom. We have native Okta integration with automated SCIM provisioning. The configuration typically takes 2 days. Jessica, I can provide our metadata XML and API keys by tomorrow noon.

Jessica Vance (Acme IT Lead): Perfect Liam. Once I receive the XML, I will set up the Okta application and test sandbox authentication by Thursday afternoon. We will also need webhooks configured to sync user de-provisioning with our internal HRIS.

Liam Scott (Solutions Architect): I will include webhook endpoint documentation and sample payload templates in the onboarding guide.

Maya Lin (Customer Success): Let's summarize the agreed schedule:
1. Liam will deliver the Okta metadata XML and webhook docs to Jessica by tomorrow, Oct 12 at 12:00 PM.
2. Jessica will configure Okta sandbox test by Thursday, Oct 13 at 5:00 PM.
3. Liam and Jessica will conduct live staging end-to-end testing on Friday, Oct 14 at 2:00 PM.
4. Target production go-live remains set for November 1st.

Tom Bradley (Acme CTO): One blocker: we need our security officer to approve the API IP allowlist before connecting the production database. Jessica will follow up internally with Security by Friday.

Maya Lin (Customer Success): Excellent. We will reconvene on Friday after the staging test. Thank you everyone!`,
    sampleMoM: {
      meeting_title: 'Enterprise Client Onboarding Kickoff - Acme Corp',
      summary: 'Kickoff meeting with Acme Corp technical leadership to establish SSO / SAML integration milestones for 2,500 employee rollout. Target production go-live is scheduled for November 1st, with sandbox testing commencing this Thursday.',
      discussion_points: [
        {
          topic: 'Single Sign-On (SSO) & SCIM Provisioning',
          details: 'Configuring Okta SAML 2.0 authentication and automated user provisioning/de-provisioning with HRIS webhook synchronization.'
        },
        {
          topic: 'Staging & Go-Live Schedule',
          details: 'Milestones agreed for metadata delivery (Oct 12), sandbox testing (Oct 13), staging verification (Oct 14), and production deployment (Nov 1).'
        }
      ],
      decisions: [
        'Use native Okta SAML 2.0 with SCIM for identity lifecycle management.',
        'Target firm production go-live on November 1st.'
      ],
      action_items: [
        {
          id: 'action-1',
          task: 'Deliver Okta metadata XML and webhook documentation',
          assigned_to: 'Liam Scott (Solutions Architect)',
          deadline: 'Tomorrow at 12:00 PM',
          status: 'pending'
        },
        {
          id: 'action-2',
          task: 'Configure Okta sandbox test environment',
          assigned_to: 'Jessica Vance (Acme IT Lead)',
          deadline: 'Thursday at 5:00 PM',
          status: 'pending'
        },
        {
          id: 'action-3',
          task: 'Conduct staging end-to-end integration walkthrough',
          assigned_to: 'Liam & Jessica',
          deadline: 'Friday at 2:00 PM',
          status: 'pending'
        }
      ],
      unresolved_issues: [
        'Acme Security Officer approval required for API IP allowlisting prior to connecting production environment.'
      ],
      metadata: {
        title: 'Enterprise Client Onboarding Kickoff - Acme Corp',
        date: new Date().toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:00',
        venue: 'Zoom (Room ID: 839-201-9921)',
        attendees: ['Liam Scott (Solutions Architect)', 'Maya Lin (Customer Success)', 'Tom Bradley (Acme CTO)', 'Jessica Vance (Acme IT Lead)']
      },
      generatedAt: new Date().toISOString()
    }
  }
];
