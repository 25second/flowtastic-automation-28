
import { ReactFlow } from '@xyflow/react';
import { Edge } from '@xyflow/react';
import { FlowNodeWithData } from '@/types/flow';
import { nodeTypes } from './CustomNode';
import { FlowControls } from './FlowControls';

interface FlowCanvasProps {
  nodes: FlowNodeWithData[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
}

export const FlowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: FlowCanvasProps) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2 },
          animated: true
        }}
        connectOnClick={true}
      >
        <FlowControls />
      </ReactFlow>
    </div>
  );
};
