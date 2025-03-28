
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFlowState } from "@/hooks/useFlowState";

export const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingWorkflow = location.state?.workflow;

  const handleBack = () => {
    // Сохраняем текущее состояние воркфлоу в localStorage
    try {
      const currentWorkflow = JSON.parse(localStorage.getItem('workflow') || '{}');
      const currentVersions = JSON.parse(localStorage.getItem('workflow_versions') || '[]');
      
      if (currentWorkflow.nodes && currentWorkflow.edges) {
        const newVersion = {
          timestamp: Date.now(),
          nodes: currentWorkflow.nodes,
          edges: currentWorkflow.edges
        };
        
        const updatedVersions = [newVersion, ...currentVersions].slice(0, 5); // Максимум 5 версий
        localStorage.setItem('workflow_versions', JSON.stringify(updatedVersions));
        localStorage.setItem('workflow', JSON.stringify(currentWorkflow));
      }
    } catch (error) {
      console.error('Error saving workflow state:', error);
    }

    navigate('/dashboard');
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
    </div>
  );
};
