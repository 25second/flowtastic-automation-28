
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, StopCircle } from "lucide-react";

interface LinkenSphereSessionProps {
  session: {
    id: string;
    name: string;
    status: string;
    uuid: string;
    debug_port?: number;
  };
  isSelected: boolean;
  onToggle: (id: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  isSessionActive: (status: string) => boolean;
}

export const LinkenSphereSession = ({
  session,
  isSelected,
  onToggle,
  onStart,
  onStop,
  isSessionActive,
}: LinkenSphereSessionProps) => {
  const isActive = isSessionActive(session.status) || session.debug_port !== undefined;

  return (
    <div className="flex items-center justify-between p-2 border rounded hover:bg-accent">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(session.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <div>
          <div className="font-medium flex items-center gap-2">
            {session.name}
            {isActive && (
              <span className="text-xs text-green-500 font-normal">
                Running
              </span>
            )}
            {session.debug_port && (
              <span className="text-xs text-muted-foreground font-normal">
                Port: {session.debug_port}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            UUID: {session.uuid}
          </div>
        </div>
      </div>
      {isActive ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onStop(session.id)}
        >
          <StopCircle className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onStart(session.id)}
          disabled={isSelected}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
