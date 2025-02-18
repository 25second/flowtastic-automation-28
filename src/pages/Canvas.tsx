
import { WorkflowStateProvider } from "@/components/flow/WorkflowStateProvider";
import { FlowLayout } from "@/components/flow/FlowLayout";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useState } from "react";
import { FlowNodeWithData } from "@/types/flow";
import { Edge, ReactFlowProvider } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { EyeIcon, PlayIcon, SaveIcon, SparklesIcon, VideoIcon } from "lucide-react";
import { ScriptDialog } from "@/components/flow/ScriptDialog";
import { WorkflowRunDialog } from "@/components/workflow/WorkflowRunDialog";
import { useServerState } from "@/hooks/useServerState";
import { toast } from "sonner";
import '@xyflow/react/dist/style.css';

const CanvasContent = () => {
  const [showScript, setShowScript] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showBrowserDialog, setShowBrowserDialog] = useState(false);
  const [isForRecording, setIsForRecording] = useState(false);

  const {
    startRecording,
    stopRecording,
    selectedBrowser,
    startWorkflow
  } = useServerState();

  const handleStartWorkflow = () => {
    setIsForRecording(false);
    setShowBrowserDialog(true);
  };

  const handleCreateWithAI = () => {
    toast.info("AI workflow creation coming soon!");
  };

  const handleSave = () => {
    toast.info("Workflow save functionality coming soon!");
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      try {
        const recordedNodes = await stopRecording();
        console.log("Recorded nodes:", recordedNodes);
        setIsRecording(false);
        toast.success("Recording stopped successfully");
      } catch (error) {
        console.error("Error stopping recording:", error);
        toast.error("Failed to stop recording");
      }
    } else {
      setIsForRecording(true);
      setShowBrowserDialog(true);
    }
  };

  return (
    <WorkflowStateProvider>
      {(flowState) => {
        const { handleDragOver, handleDrop } = useDragAndDrop(flowState.nodes, flowState.setNodes);
        
        const handleBrowserConfirm = async () => {
          if (!selectedBrowser) {
            toast.error("Please select a browser");
            return;
          }

          try {
            if (isForRecording) {
              const port = typeof selectedBrowser === 'number' 
                ? selectedBrowser 
                : selectedBrowser.debug_port || 0;
              
              await startRecording(port);
              setIsRecording(true);
              toast.success("Recording started");
            } else {
              const executionParams = typeof selectedBrowser === 'object' && selectedBrowser !== null
                ? {
                    browserType: 'linkenSphere' as const,
                    browserPort: selectedBrowser.debug_port || 0,
                    sessionId: selectedBrowser.id
                  }
                : {
                    browserType: 'chrome' as const,
                    browserPort: selectedBrowser as number
                  };

              await startWorkflow(flowState.nodes, flowState.edges, executionParams);
              toast.success("Workflow started successfully");
            }
            setShowBrowserDialog(false);
          } catch (error) {
            console.error("Error in browser confirmation:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred");
          }
        };
        
        return (
          <FlowLayout
            nodes={flowState.nodes}
            edges={flowState.edges}
            onNodesChange={flowState.onNodesChange}
            onEdgesChange={flowState.onEdgesChange}
            onConnect={flowState.onConnect}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="h-full w-full relative">
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <Button
                  onClick={handleStartWorkflow}
                  className="flex items-center gap-2 bg-gradient-to-br from-[#9b87f5] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Start Workflow</span>
                </Button>

                <Button
                  onClick={handleCreateWithAI}
                  className="flex items-center gap-2 bg-gradient-to-br from-[#F97316] to-[#FEC6A1] hover:from-[#EA580C] hover:to-[#FB923C] text-white"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>Create with AI</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleSave}
                  >
                    <SaveIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleRecordClick}
                    className={isRecording ? "text-red-500" : ""}
                  >
                    <VideoIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowScript(true)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScriptDialog
                open={showScript}
                onOpenChange={setShowScript}
                nodes={flowState.nodes}
                edges={flowState.edges}
              />
              <WorkflowRunDialog
                showBrowserDialog={showBrowserDialog}
                setShowBrowserDialog={setShowBrowserDialog}
                onConfirm={handleBrowserConfirm}
                isForRecording={isForRecording}
              />
            </div>
          </FlowLayout>
        );
      }}
    </WorkflowStateProvider>
  );
};

const Canvas = () => {
  return (
    <div className="w-full h-screen bg-background">
      <ReactFlowProvider>
        <CanvasContent />
      </ReactFlowProvider>
    </div>
  );
};

export default Canvas;
