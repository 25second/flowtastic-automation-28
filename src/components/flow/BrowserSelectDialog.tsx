
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useServerState } from "@/hooks/useServerState";
import { useState, useEffect } from "react";
import { LinkenSphereSessions } from "./LinkenSphereSessions";
import { ServerSelect } from "./browser-select/ServerSelect";
import { BrowserTypeSelect } from "./browser-select/BrowserTypeSelect";
import { ChromeBrowserSelect } from "./browser-select/ChromeBrowserSelect";
import { useSessionManagement } from "./browser-select/useSessionManagement";
import { WorkflowStartDialog } from "./WorkflowStartDialog";

interface BrowserSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  dialogTitle: string;
  dialogDescription: string;
  isForRecording: boolean;
}

export const BrowserSelectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  dialogTitle,
  dialogDescription,
  isForRecording
}: BrowserSelectDialogProps) => {
  const {
    selectedServer,
    setSelectedServer,
    browsers,
    selectedBrowser,
    setSelectedBrowser,
    servers,
    serverToken,
    setServerToken
  } = useServerState();

  const [browserType, setBrowserType] = useState<'chrome' | 'linkenSphere'>('chrome');

  const {
    sessions,
    loading,
    selectedSessions,
    searchQuery,
    setSearchQuery,
    startSession,
    stopSession,
    startSelectedSessions,
    stopSelectedSessions,
    loadingSessions,
    setSelectedSessions,
    isSessionActive,
    resetFetchState
  } = useSessionManagement(open, browserType, setSelectedBrowser);

  // If this is not for recording, use the WorkflowStartDialog instead
  if (!isForRecording) {
    return (
      <WorkflowStartDialog
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );
  }

  const serverOptions = servers.map((server) => ({
    id: server.id,
    label: server.name || server.url,
    value: server.id
  }));

  const handleBrowserTypeChange = (value: 'chrome' | 'linkenSphere') => {
    setBrowserType(value);
    setSelectedBrowser(null);
    setSelectedSessions(new Set());
    if (value === 'linkenSphere') {
      resetFetchState();
    }
  };

  const handleToggleSession = (sessionId: string) => {
    if (!sessionId) return;
    
    const selectedSession = sessions.find(session => session.id === sessionId);
    console.log('Toggling session:', selectedSession);
    
    if (selectedSession && isSessionActive(selectedSession.status)) {
      setSelectedSessions(new Set([sessionId]));
      
      const sessionData = {
        id: selectedSession.id,
        status: selectedSession.status,
        debug_port: selectedSession.debug_port || 0
      };
      
      console.log('Setting selected browser to:', sessionData);
      setSelectedBrowser(sessionData);
    } else {
      setSelectedSessions(new Set());
      setSelectedBrowser(null);
    }
  };

  const handleConfirm = async () => {
    console.log('Confirming with browser:', selectedBrowser);
    console.log('Server:', selectedServer);
    console.log('Server token:', serverToken);
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <ServerSelect
            serverOptions={serverOptions}
            selectedServer={selectedServer}
            setSelectedServer={setSelectedServer}
          />

          {selectedServer && (
            <BrowserTypeSelect
              browserType={browserType}
              onBrowserTypeChange={handleBrowserTypeChange}
            />
          )}

          {selectedServer && browserType === 'chrome' ? (
            <ChromeBrowserSelect
              browsers={browsers}
              selectedBrowser={typeof selectedBrowser === 'number' ? selectedBrowser : null}
              setSelectedBrowser={(port) => setSelectedBrowser(port)}
            />
          ) : selectedServer && browserType === 'linkenSphere' ? (
            <div className="max-h-[400px] overflow-y-auto">
              <LinkenSphereSessions
                loading={loading}
                sessions={sessions}
                selectedSessions={selectedSessions}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleSession={handleToggleSession}
                onStartSession={startSession}
                onStopSession={stopSession}
                onStartSelected={startSelectedSessions}
                onStopSelected={stopSelectedSessions}
                isSessionActive={isSessionActive}
                loadingSessions={loadingSessions}
              />
            </div>
          ) : null}

          {selectedServer && (
            <Button 
              onClick={handleConfirm}
              className="w-full"
              disabled={!selectedBrowser || !selectedServer}
            >
              Confirm
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
