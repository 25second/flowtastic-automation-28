
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Server {
  id: string;
  url: string;
  name: string | null;
  is_active: boolean;
}

interface Browser {
  port: number;
  name: string;
  type: string;
}

interface BrowserSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servers: Server[];
  selectedServer: string;
  onServerSelect: (serverId: string) => void;
  browsers: Browser[];
  selectedBrowser: number | null;
  onBrowserSelect: (port: number) => void;
  onConfirm: () => Promise<void>;
}

export const BrowserSelectDialog = ({
  open,
  onOpenChange,
  servers,
  selectedServer,
  onServerSelect,
  browsers,
  selectedBrowser,
  onBrowserSelect,
  onConfirm,
}: BrowserSelectDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBrowsers = browsers.filter((browser) =>
    browser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeServers = servers.filter(server => server.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Server and Browser</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Select value={selectedServer} onValueChange={onServerSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem 
                  key={server.id} 
                  value={server.id}
                  disabled={!server.is_active}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {server.name || server.url}
                    {!server.is_active && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </SelectItem>
              ))}
              {servers.length === 0 && (
                <SelectItem value="none" disabled>
                  No servers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {selectedServer && !activeServers.find(s => s.id === selectedServer)?.is_active && (
            <p className="text-sm text-destructive mt-2">
              Selected server is currently offline
            </p>
          )}
        </div>
        
        {selectedServer && activeServers.find(s => s.id === selectedServer)?.is_active && (
          <>
            <Input
              placeholder="Search browsers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredBrowsers.map((browser) => (
                  <div
                    key={browser.port}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                      selectedBrowser === browser.port
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary"
                    }`}
                    onClick={() => onBrowserSelect(browser.port)}
                  >
                    <span>{browser.name}</span>
                    {selectedBrowser === browser.port && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
                {filteredBrowsers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No browsers found
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={!selectedBrowser}
              >
                Run Workflow
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
