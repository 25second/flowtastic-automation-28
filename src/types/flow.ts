
import { Node } from '@xyflow/react';

// Make FlowNodeData extend Record<string, unknown> to satisfy Node type constraints
export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  settings?: NodeSettings;
}

export interface FlowNode {
  type: string;
  label: string;
  description: string;
  settings: Record<string, any>;
  style: {
    background: string;
    padding: string;
    borderRadius: string;
    width: number;
  };
}

export interface NodeCategory {
  name: string;
  nodes: FlowNode[];
}

export interface NodeSettings {
  // Trigger node settings
  cronExpression?: string;
  eventType?: string;
  delay?: number;

  // Tab node settings
  url?: string;

  // Page node settings
  selector?: string;
  text?: string;
  behavior?: 'smooth' | 'auto';

  // JavaScript node settings
  code?: string;
  expression?: string;

  // Data node settings
  data?: any;
  filename?: string;
  format?: string;
  attribute?: string;

  // Flow node settings
  condition?: string;
  description?: string;
  times?: number;
  duration?: number;
}

export type FlowNodeWithData = Node<FlowNodeData>;
