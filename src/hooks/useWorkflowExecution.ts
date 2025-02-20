
import { Edge } from '@xyflow/react';
import { FlowNodeWithData } from '@/types/flow';
import { generateScript } from '@/utils/scriptGenerator';
import { toast } from 'sonner';
import { getStoredSessionPort } from '@/hooks/task-execution/useSessionManagement';

const API_URL = 'http://localhost:3001';

export interface WorkflowExecutionParams {
  browserType: 'chrome' | 'linkenSphere';
  browserPort: number;
  sessionId?: string;
}

export const useWorkflowExecution = (selectedServer: string | null, serverToken: string) => {
  const startWorkflow = async (
    nodes: FlowNodeWithData[], 
    edges: Edge[], 
    params: WorkflowExecutionParams
  ) => {
    console.log('=== useWorkflowExecution.startWorkflow ===');
    console.log('Server:', selectedServer);
    console.log('Token:', serverToken);
    console.log('Params:', params);

    if (!selectedServer) {
      console.error('No server selected');
      toast.error('Please select a server before running the workflow');
      throw new Error('No server selected');
    }

    if (!nodes.length) {
      console.error('No nodes in workflow');
      toast.error('Workflow is empty');
      throw new Error('No nodes in workflow');
    }

    if (!params.browserPort || params.browserPort <= 0) {
      console.error(`Invalid browser port: ${params.browserPort}`);
      toast.error('Invalid browser port');
      throw new Error(`Invalid browser port: ${params.browserPort}`);
    }
    
    try {
      const script = generateScript(nodes, edges);
      console.log('Generated script:', script);

      let targetPort = params.browserPort;
      let browserInfo = null;
      let wsEndpoint = null;

      // Проверяем сессию LinkenSphere
      if (params.browserType === 'linkenSphere') {
        if (!params.sessionId) {
          throw new Error('Session ID is required for LinkenSphere connections');
        }

        // Get the stored debug port for this session
        const debugPort = getStoredSessionPort(params.sessionId);
        console.log(`Retrieved debug port for session ${params.sessionId}:`, debugPort);

        if (!debugPort) {
          console.warn(`No debug port found for session ${params.sessionId}, using provided port: ${params.browserPort}`);
          targetPort = params.browserPort;
        } else {
          targetPort = debugPort;
        }

        // Пытаемся получить информацию о браузере
        try {
          // Сначала проверяем список страниц
          const listResponse = await fetch(`http://127.0.0.1:${targetPort}/json/list`);
          if (listResponse.ok) {
            const pagesList = await listResponse.json();
            console.log('Active pages:', pagesList);

            // Используем WebSocket URL из первой страницы, если он есть
            if (pagesList.length > 0 && pagesList[0].webSocketDebuggerUrl) {
              wsEndpoint = pagesList[0].webSocketDebuggerUrl;
              console.log('Using WebSocket endpoint from first page:', wsEndpoint);
            } else if (pagesList.length > 0 && pagesList[0].devtoolsFrontendUrl) {
              // Извлекаем WebSocket URL из devtoolsFrontendUrl
              const match = pagesList[0].devtoolsFrontendUrl.match(/ws=([^&]+)/);
              if (match) {
                wsEndpoint = decodeURIComponent(match[1]);
                console.log('Extracted WebSocket endpoint from devtools URL:', wsEndpoint);
              }
            }
          }

          // Если не нашли в списке страниц, пробуем через version
          if (!wsEndpoint) {
            const versionResponse = await fetch(`http://127.0.0.1:${targetPort}/json/version`);
            if (versionResponse.ok) {
              browserInfo = await versionResponse.json();
              console.log('Browser version info:', browserInfo);
              
              if (browserInfo.webSocketDebuggerUrl) {
                wsEndpoint = browserInfo.webSocketDebuggerUrl;
                console.log('Using WebSocket endpoint from version info:', wsEndpoint);
              }
            }
          }
        } catch (error) {
          console.warn(`Could not verify port ${targetPort}, but continuing:`, error);
        }

        // Если все еще нет WebSocket URL, формируем его для основного окна
        if (!wsEndpoint) {
          wsEndpoint = `ws://127.0.0.1:${targetPort}/devtools/page/page`;
          console.log('Using constructed WebSocket endpoint:', wsEndpoint);
        }

        console.log(`Using port ${targetPort} for session ${params.sessionId}`);
      }
      
      const executionPayload = {
        script,
        browserConnection: {
          port: params.browserType === 'linkenSphere' ? 
            Number(localStorage.getItem('linkenSpherePort')) || 40080 : 
            params.browserPort,
          debugPort: targetPort,
          browserType: params.browserType,
          sessionId: params.sessionId,
          browserInfo,
          wsEndpoint,
          isAutomationRunning: true
        },
        nodes,
        edges,
        serverId: selectedServer
      };

      console.log('Sending execution payload:', executionPayload);
      
      const response = await fetch(`${API_URL}/execute-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serverToken}`
        },
        body: JSON.stringify(executionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      console.log('Workflow execution response:', data);
      return data;
    } catch (error) {
      console.error('Workflow execution error:', error);
      throw error;
    }
  };

  return { startWorkflow };
};
