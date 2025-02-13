
import '@xyflow/react/dist/style.css';
import { AIDialog } from '@/components/flow/AIDialog';
import { ServerDialog } from '@/components/flow/ServerDialog';
import { Toolbar } from '@/components/flow/Toolbar';
import { useFlowState } from '@/hooks/useFlowState';
import { useServerState } from '@/hooks/useServerState';
import { BrowserSelectDialog } from '@/components/flow/BrowserSelectDialog';
import { FlowLayout } from '@/components/flow/FlowLayout';
import { useFlowActions } from '@/hooks/useFlowActions';
import { SaveWorkflowDialog } from '@/components/flow/SaveWorkflowDialog';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const location = useLocation();
  const existingWorkflow = location.state?.workflow;

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    resetFlow,
  } = useFlowState();

  useEffect(() => {
    console.log('Loading workflow:', existingWorkflow);
    if (existingWorkflow) {
      setNodes(existingWorkflow.nodes || []);
      setEdges(existingWorkflow.edges || []);
    } else {
      resetFlow();
    }
  }, [existingWorkflow, setNodes, setEdges, resetFlow]);

  const {
    workflowName,
    setWorkflowName,
    workflowDescription,
    setWorkflowDescription,
    tags,
    setTags,
    showSaveDialog,
    setShowSaveDialog,
    saveWorkflow,
  } = useWorkflowManager(nodes, edges);

  useEffect(() => {
    if (existingWorkflow) {
      setWorkflowName(existingWorkflow.name || '');
      setWorkflowDescription(existingWorkflow.description || '');
      setTags(existingWorkflow.tags || []);
    }
  }, [existingWorkflow, setWorkflowName, setWorkflowDescription, setTags]);

  const {
    selectedServer,
    setSelectedServer,
    serverToken,
    setServerToken,
    showServerDialog,
    setShowServerDialog,
    registerServer,
    startWorkflow,
    browsers,
    selectedBrowser,
    setSelectedBrowser,
    startRecording,
    stopRecording,
  } = useServerState();

  const {
    showAIDialog,
    setShowAIDialog,
    showBrowserDialog,
    setShowBrowserDialog,
    actionType,
    prompt,
    setPrompt,
    isRecording,
    handleDragOver,
    handleDrop,
    handleStartWorkflow,
    handleRecordClick,
    handleStartWithDialog,
    handleRecordWithDialog,
  } = useFlowActions(nodes, setNodes, edges, startWorkflow, startRecording, stopRecording);

  const handleSave = () => {
    if (existingWorkflow) {
      saveWorkflow.mutate({ id: existingWorkflow.id, nodes, edges });
    } else {
      setShowSaveDialog(true);
    }
  };

  // Handle the workflow start based on the selected browser
  const handleConfirmAction = async () => {
    if (selectedBrowser === null) return;

    if (actionType === 'run') {
      await handleStartWorkflow(selectedBrowser);
    } else if (actionType === 'record') {
      await handleRecordClick();
    }
  };

  return (
    <FlowLayout
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Toolbar 
        browsers={browsers}
        selectedBrowser={selectedBrowser}
        onBrowserSelect={setSelectedBrowser}
        onStartWorkflow={handleStartWorkflow}
        onCreateWithAI={() => setShowAIDialog(true)}
        onSave={handleSave}
        isRecording={isRecording}
        onRecordClick={handleRecordClick}
        onStartWithDialog={handleStartWithDialog}
        onRecordWithDialog={handleRecordWithDialog}
      />

      <SaveWorkflowDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        onNameChange={setWorkflowName}
        onDescriptionChange={setWorkflowDescription}
        onSave={() => saveWorkflow.mutate({ nodes, edges })}
        tags={tags}
        onTagsChange={setTags}
      />

      <AIDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        prompt={prompt}
        setPrompt={setPrompt}
      />

      <ServerDialog
        open={showServerDialog}
        onOpenChange={setShowServerDialog}
        serverToken={serverToken}
        setServerToken={setServerToken}
        onRegister={registerServer}
      />

      <BrowserSelectDialog
        open={showBrowserDialog}
        onOpenChange={setShowBrowserDialog}
        servers={servers}
        selectedServer={selectedServer}
        onServerSelect={setSelectedServer}
        browsers={browsers}
        selectedBrowser={selectedBrowser}
        onBrowserSelect={setSelectedBrowser}
        onConfirm={handleConfirmAction}
      />
    </FlowLayout>
  );
};

export default Index;
