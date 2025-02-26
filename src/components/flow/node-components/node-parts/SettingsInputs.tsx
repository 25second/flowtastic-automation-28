
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface SettingsInputsProps {
  settings: { id: string; label: string }[];
}

export const SettingsInputs: React.FC<SettingsInputsProps> = ({ settings }) => {
  if (settings.length === 0) return null;

  return (
    <div className="mb-4">
      {settings.map((setting) => (
        <div key={setting.id} className="relative flex items-center justify-between h-8">
          <Handle
            type="target"
            position={Position.Left}
            id={setting.id}
            className="w-2 h-1 !bg-primary"
            style={{ left: -8 }}
          />
          <span className="text-xs text-muted-foreground ml-4">{setting.label}</span>
        </div>
      ))}
    </div>
  );
};
