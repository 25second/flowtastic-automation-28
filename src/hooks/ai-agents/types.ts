
export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  is_favorite?: boolean;
  color?: string;
  task_description?: string;
  take_screenshots?: boolean;
  table_id?: string;
  script?: string;
  tags?: string[] | string;
  category_id?: string;
  ai_provider?: string;
  model?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  api_key?: string;
  endpoint_url?: string;
  is_custom: boolean;
  model?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
