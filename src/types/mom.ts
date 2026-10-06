export interface MeetingMetadata {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  attendees?: string[];
}

export interface ActionItem {
  id: string;
  task: string;
  assigned_to: string;
  deadline: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface DiscussionPoint {
  id?: string;
  topic: string;
  details: string;
}

export interface MoMData {
  meeting_title: string;
  summary: string;
  discussion_points: Array<{ topic: string; details: string }>;
  decisions: string[];
  action_items: ActionItem[];
  unresolved_issues: string[];
  metadata?: MeetingMetadata;
  transcript?: string;
  generatedAt?: string;
}

export interface TranscriptionResponse {
  transcript: string;
  durationSeconds?: number;
  wordCount?: number;
  detectedLanguage?: string;
}

export interface GenerationProgress {
  stage: 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'completed' | 'error';
  message: string;
  percent?: number;
}
