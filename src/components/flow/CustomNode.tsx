
import { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { FlowNodeData } from '@/types/flow';
import { SettingsDialog } from './node-settings/SettingsDialog';
import { NodeControls } from './node-components/NodeControls';
import { NodeHeader } from './node-components/NodeHeader';
import { NodeOutputs } from './node-components/NodeOutputs';
import { availableOutputs } from './node-utils/availableOutputs';
import { getSettingsHandlesCount } from './node-utils/handleUtils';
import { getNodeTypes } from './node-types';

interface CustomNodeProps {
  data: FlowNodeData;
  id: string;
  selected: boolean;
  dragging?: boolean;
}

export const CustomNode = ({ data, id, selected, dragging }: CustomNodeProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const { deleteElements, setNodes } = useReactFlow();

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
    toast.success('Node deleted');
  };

  const handleSettingsChange = useCallback((nodeId: string, settings: Record<string, any>) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, settings }
        };
      }
      return node;
    }));
  }, [setNodes]);

  const handleSettingsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowSettings(true);
  };

  const isGeneratePerson = data.type === 'generate-person';
  const isStartScript = data.type === 'start-script';
  const isStop = data.type === 'stop';
  const isLinkenSphereStopSession = data.type === 'linken-sphere-stop-session';

  // Calculate the number of inputs and outputs for math nodes
  const isMathNode = data.type.startsWith('math-');
  const settingsInputsCount = isMathNode && data.settings?.inputs ? data.settings.inputs.length : 0;
  const settingsOutputsCount = isMathNode && data.settings?.outputs ? data.settings.outputs.length : 0;

  const settingsHandlesCount = getSettingsHandlesCount(data.settings);
  const outputsCount = isGeneratePerson && data.settings?.selectedOutputs 
    ? data.settings.selectedOutputs.length 
    : 0;

  const minHeight = Math.max(
    100,
    settingsHandlesCount * 28 + 60,
    outputsCount * 28 + 60,
    (settingsInputsCount + settingsOutputsCount) * 28 + 60
  );

  const nodeClassNames = [
    'group',
    'relative',
    'w-[200px]',
    'bg-background',
    'rounded-lg',
    'border',
    'border-border',
    selected ? 'shadow-lg ring-2 ring-orange-200' : 'shadow-sm hover:shadow-md',
    'transition-shadow duration-200',
    dragging ? 'dragging' : '',
  ].join(' ');

  const style = {
    minHeight: `${minHeight}px`,
    borderLeft: `4px solid ${isLinkenSphereStopSession ? '#DC2626' : (data.color || '#9b87f5')}`,
    opacity: dragging ? 0.5 : 1
  };

  const generatePersonOutputs = isGeneratePerson 
    ? availableOutputs.filter(output => 
        !data.settings?.selectedOutputs || 
        data.settings.selectedOutputs.includes(output.id)
      )
    : undefined;

  const showSettingsButton = !isStartScript && !isStop && !isLinkenSphereStopSession;

  // Prepare math node inputs and outputs for rendering
  const mathNodeInputs = isMathNode ? data.settings?.inputs?.map(input => ({
    id: input.id,
    label: input.label
  })) : [];

  const mathNodeOutputs = isMathNode ? data.settings?.outputs?.map(output => ({
    id: output.id,
    label: output.label
  })) : [];

  return (
    <>
      <div 
        className={nodeClassNames} 
        style={style}
      >
        <NodeControls
          selected={selected}
          onSettingsClick={showSettingsButton ? handleSettingsClick : undefined}
          onDelete={handleDelete}
        />

        <div className="px-4 py-3">
          <NodeHeader
            label={data.label}
            icon={data.icon}
            description={data.description}
          />
          
          <NodeOutputs
            isGeneratePerson={isGeneratePerson}
            outputs={generatePersonOutputs}
            isStop={isStop || isLinkenSphereStopSession}
            settings={data.settings}
            isStartScript={isStartScript}
            mathInputs={mathNodeInputs}
            mathOutputs={mathNodeOutputs}
          />
        </div>
      </div>
      
      {showSettingsButton && (
        <SettingsDialog 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          nodeId={id}
          nodeData={data}
          onSettingsChange={handleSettingsChange}
          initialSettings={data.settings}
        />
      )}
    </>
  );
};

export const nodeTypes = getNodeTypes(CustomNode);
