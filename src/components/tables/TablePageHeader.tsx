
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TablePageHeaderProps {
  onAddTable: () => void;
}

export const TablePageHeader = ({
  onAddTable
}: TablePageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Tables</h1>
      <Button onClick={onAddTable}>
        <Plus className="h-4 w-4 mr-2" />
        Add Table
      </Button>
    </div>
  );
};
