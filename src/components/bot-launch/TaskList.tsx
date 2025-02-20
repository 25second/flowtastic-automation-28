
import { format } from "date-fns";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Play,
  StopCircle,
  Trash,
  Edit,
  Terminal,
  Download
} from "lucide-react";
import type { Task } from "@/types/task";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskListProps {
  tasks: Task[];
  selectedTasks: Set<string>;
  onSelectTask: (taskId: string) => void;
  onSelectAll: () => void;
  onStartTask: (taskId: string) => void;
  onStopTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onViewLogs: (taskId: string) => void;
}

export function TaskList({ 
  tasks,
  selectedTasks,
  onSelectTask,
  onSelectAll,
  onStartTask,
  onStopTask,
  onDeleteTask,
  onEditTask,
  onViewLogs
}: TaskListProps) {
  const [selectedTaskLogs, setSelectedTaskLogs] = useState<{ id: string; logs: string[] } | null>(null);

  const getStatusDisplay = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-[#F2FCE2] text-green-700",
          text: "Pending"
        };
      case "in_process":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: "bg-orange-100 text-orange-700",
          text: "In Process"
        };
      case "done":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "bg-[#D3E4FD] text-blue-700",
          text: "Done"
        };
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-700",
          text: "Error"
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-700",
          text: status
        };
    }
  };

  const handleViewLogs = (taskId: string) => {
    // In a real application, you would fetch the logs from your backend
    // For now, we'll use mock data
    const mockLogs = [
      `[${new Date().toISOString()}] Task ${taskId} started`,
      `[${new Date().toISOString()}] Connecting to server...`,
      `[${new Date().toISOString()}] Server connection established`,
      `[${new Date().toISOString()}] Running workflow...`,
      `[${new Date().toISOString()}] Workflow completed successfully`,
    ];
    
    setSelectedTaskLogs({ id: taskId, logs: mockLogs });
    onViewLogs(taskId);
  };

  const handleDownloadLogs = () => {
    if (!selectedTaskLogs) return;
    
    const logsText = selectedTaskLogs.logs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-${selectedTaskLogs.id}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isAllSelected = tasks.length > 0 && selectedTasks.size === tasks.length;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const status = getStatusDisplay(task.status);
            const isSelected = selectedTasks.has(task.id);
            const isRunning = task.status === "in_process";

            return (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelectTask(task.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.icon}
                    {status.text}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(task.created_at), "PPp")}
                </TableCell>
                <TableCell>
                  {task.updated_at ? format(new Date(task.updated_at), "PPp") : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewLogs(task.id)}
                    >
                      <Terminal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => isRunning ? onStopTask(task.id) : onStartTask(task.id)}
                    >
                      {isRunning ? <StopCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Sheet open={!!selectedTaskLogs} onOpenChange={() => setSelectedTaskLogs(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Task Logs</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-12rem)] mt-6 rounded border p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {selectedTaskLogs?.logs.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))}
            </pre>
          </ScrollArea>
          <div className="mt-6">
            <Button 
              onClick={handleDownloadLogs}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Logs
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
