export interface Participant {
  id: string;
  name: string;
  color: string;
  gradient: string;
  online: boolean;
  avatarUrl?: string;
  isAdmin?: boolean;
  canEdit?: boolean;
}

export interface WsMessage {
  type: string;
  user_id?: string;
  target_user_id?: string;
  code?: string;
  language?: string;
  users?: string[];
  output?: string;
  is_error?: boolean;
  line?: number;
  column?: number;
  name?: string;
  avatar_url?: string;
  profiles?: Record<string, { name?: string; avatar_url?: string }>;
  cursors?: Record<string, { line: number; column: number }>;
}
