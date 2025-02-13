
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Play, Video, Save } from 'lucide-react';

interface ToolbarProps {
  browsers: Array<{port: number, name: string, type: string}>;
  selectedBrowser: number | null;
  onBrowserSelect: (port: number) => void;
  onStartWorkflow: () => Promise<void>;
  onCreateWithAI: () => void;
  onSave: () => void;
  isRecording: boolean;
  onRecordClick: () => void;
  onStartWithDialog: () => void;
  onRecordWithDialog: () => void;
}

export const Toolbar = ({
  browsers,
  selectedBrowser,
  onBrowserSelect,
  onStartWorkflow,
  onCreateWithAI,
  onSave,
  isRecording,
  onRecordClick,
  onStartWithDialog,
  onRecordWithDialog,
}: ToolbarProps) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {browsers.length > 0 && (
        <Select value={selectedBrowser?.toString()} onValueChange={(value) => onBrowserSelect(Number(value))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select browser" />
          </SelectTrigger>
          <SelectContent>
            {browsers.map(browser => (
              <SelectItem key={browser.port} value={browser.port.toString()}>
                {browser.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <Button 
        onClick={onStartWithDialog}
        className="bg-green-500 hover:bg-green-600 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_20px_rgba(34,197,94,0.7)] flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        Start Workflow
      </Button>

      <Button 
        onClick={onRecordWithDialog}
        className={`${
          isRecording 
            ? "bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]" 
            : "bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.7)]"
        } transition-all duration-300 flex items-center gap-2`}
      >
        <Video className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
        {isRecording ? "Stop Recording" : "Record Workflow"}
      </Button>
      
      <Button 
        onClick={onCreateWithAI}
        className="bg-[#9b87f5] hover:bg-[#8B5CF6] transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Create with AI ✨
      </Button>
      
      <Button 
        onClick={onSave}
        className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save
      </Button>
    </div>
  );
};
