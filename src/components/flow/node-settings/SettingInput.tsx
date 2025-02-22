import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MousePointer, Wand2, Table } from "lucide-react";
import { toast } from "sonner";
import { faker } from '@faker-js/faker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SettingInputProps {
  settingKey: string;
  value: any;
  localSettings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
}

export const SettingInput = ({ settingKey, value, localSettings, onSettingChange }: SettingInputProps) => {
  const [isMouseSelectOpen, setIsMouseSelectOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [showGoogleSheets, setShowGoogleSheets] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [columnName, setColumnName] = useState("");

  const generateRandomData = (type: string) => {
    switch (type) {
      case 'name':
        return faker.person.fullName();
      case 'firstName':
        return faker.person.firstName();
      case 'lastName':
        return faker.person.lastName();
      case 'birthDate':
        return faker.date.birthdate().toLocaleDateString();
      case 'phone':
        return faker.phone.number();
      case 'country':
        return faker.location.country();
      case 'email':
        return faker.internet.email();
      case 'password':
        return faker.internet.password();
      default:
        return '';
    }
  };

  const handleMouseSelect = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setIsLoading(true);

      const fullUrl = url.startsWith('http') ? url : `https://${url}`;

      setShowIframe(true);

      try {
        const response = await fetch('/api/workflow/mouse-select', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: fullUrl })
        });

        if (response.status === 404) {
          throw new Error('The mouse selection service is not available. Please try again later or contact support.');
        }

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to initialize mouse selection: ${errorData}`);
        }

        const { selector } = await response.json();
        if (selector) {
          onSettingChange(settingKey, selector);
          setIsMouseSelectOpen(false);
          setShowIframe(false);
          toast.success("Element selected successfully!");
        }
      } catch (error: any) {
        if (error.name === 'TypeError') {
          console.error('Network error:', error);
          toast.error('Could not connect to the selection service. Please check your connection.');
        } else {
          console.error('Mouse selection error:', error);
          toast.error(error.message || 'Failed to start element selection');
        }
        setShowIframe(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={settingKey}
          checked={localSettings[settingKey] || false}
          onCheckedChange={(checked) => onSettingChange(settingKey, checked)}
        />
        <Label htmlFor={settingKey} className="capitalize">
          {settingKey.replace(/([A-Z])/g, ' $1')}
        </Label>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <Label htmlFor={settingKey} className="capitalize">
          {settingKey.replace(/([A-Z])/g, ' $1')}
        </Label>
        <Select
          value={Array.isArray(localSettings[settingKey]) ? localSettings[settingKey].join(',') : ''}
          onValueChange={(val) => onSettingChange(settingKey, val.split(','))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            {value.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (settingKey === 'selector') {
    return (
      <div className="space-y-2">
        <Label htmlFor={settingKey} className="capitalize">
          {settingKey.replace(/([A-Z])/g, ' $1')}
        </Label>
        <div className="flex gap-2">
          <Input
            type={typeof value === 'number' ? 'number' : 'text'}
            id={settingKey}
            value={localSettings[settingKey] || value}
            onChange={(e) => onSettingChange(settingKey, e.target.type === 'number' ? Number(e.target.value) : e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsMouseSelectOpen(true)}
            title="Select element with mouse"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
        </div>

        <Sheet open={isMouseSelectOpen} onOpenChange={setIsMouseSelectOpen}>
          <SheetContent side="right" className="w-[90vw] sm:w-[80vw] max-w-[1200px]">
            <SheetHeader>
              <SheetTitle>Select Element with Mouse</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4 h-full flex flex-col">
              <div className="space-y-2">
                <Label>Enter URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleMouseSelect} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Start Selection'}
              </Button>
              
              {showIframe && (
                <div className="flex-1 mt-4 min-h-[500px] relative">
                  <iframe
                    src={url.startsWith('http') ? url : `https://${url}`}
                    className="w-full h-full border rounded-lg"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              )}
              
              {!showIframe && (
                <div className="text-sm text-muted-foreground mt-4">
                  <p className="font-medium mb-2">Instructions:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Enter the URL of the page where you want to select an element</li>
                    <li>Click "Start Selection" to load the page</li>
                    <li>Hold Shift and click on the desired element</li>
                    <li>The selector will be automatically copied back to the settings</li>
                  </ul>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  if (settingKey === 'text' && (localSettings.type === 'page-type' || localSettings.type === 'input-text')) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={settingKey} className="capitalize">
            {settingKey.replace(/([A-Z])/g, ' $1')}
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              id={settingKey}
              value={localSettings[settingKey] || value}
              onChange={(e) => onSettingChange(settingKey, e.target.value)}
              className="flex-1"
            />
            <Select onValueChange={(val) => onSettingChange(settingKey, generateRandomData(val))}>
              <SelectTrigger className="w-[180px]">
                <Wand2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Generate random..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Random Name</SelectItem>
                <SelectItem value="firstName">Random First Name</SelectItem>
                <SelectItem value="lastName">Random Last Name</SelectItem>
                <SelectItem value="birthDate">Random Birth Date</SelectItem>
                <SelectItem value="phone">Random Phone</SelectItem>
                <SelectItem value="country">Random Country</SelectItem>
                <SelectItem value="email">Random Email</SelectItem>
                <SelectItem value="password">Random Password</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveToSheets"
                checked={localSettings.saveToSheets || false}
                onCheckedChange={(checked) => {
                  onSettingChange('saveToSheets', checked);
                  if (checked) {
                    setShowGoogleSheets(true);
                  }
                }}
              />
              <Label htmlFor="saveToSheets">Save entered data?</Label>
            </div>
            {localSettings.saveToSheets && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGoogleSheets(true)}
              >
                <Table className="h-4 w-4 mr-2" />
                Configure Google Sheets
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showGoogleSheets} onOpenChange={setShowGoogleSheets}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Google Sheets Configuration</DialogTitle>
              <DialogDescription>
                Enter your Google Sheets details to save the generated data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Spreadsheet URL</Label>
                <Input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sheet Name</Label>
                <Input
                  placeholder="Sheet1"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Column Name</Label>
                <Input
                  placeholder="e.g., Name, Email, etc."
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  onSettingChange('googleSheets', {
                    url: sheetsUrl,
                    sheet: sheetName,
                    column: columnName
                  });
                  setShowGoogleSheets(false);
                  toast.success('Google Sheets configuration saved');
                }}
              >
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    return (
      <div className="space-y-2">
        <Label className="capitalize">{settingKey.replace(/([A-Z])/g, ' $1')}</Label>
        <div className="pl-4 space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <SettingInput
                settingKey={`${settingKey}.${subKey}`}
                value={subValue}
                localSettings={localSettings}
                onSettingChange={onSettingChange}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (settingKey === 'time') {
    return (
      <div className="space-y-2">
        <Label htmlFor={settingKey} className="capitalize">
          {settingKey.replace(/([A-Z])/g, ' $1')}
        </Label>
        <Input
          type="time"
          id={settingKey}
          value={localSettings[settingKey] || value}
          onChange={(e) => onSettingChange(settingKey, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={settingKey} className="capitalize">
        {settingKey.replace(/([A-Z])/g, ' $1')}
      </Label>
      <Input
        type={typeof value === 'number' ? 'number' : 'text'}
        id={settingKey}
        value={localSettings[settingKey] || value}
        onChange={(e) => onSettingChange(settingKey, e.target.type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );
};
