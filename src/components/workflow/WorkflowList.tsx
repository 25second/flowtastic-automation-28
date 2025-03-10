
import { HeaderSection } from './list/HeaderSection';
import { WorkflowTableSection } from './list/WorkflowTableSection';
import { useWorkflowListState } from '@/hooks/workflow/useWorkflowListState';
import { Category } from '@/types/workflow';

interface WorkflowListProps {
  isLoading: boolean;
  workflows: any[] | undefined;
  onDelete?: (ids: string[]) => void;
  onEditDetails?: (workflow: any) => void;
  onRun?: (workflow: any) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  categories: Category[];
  categoriesLoading?: boolean;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onAddCategory?: (category: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onEditCategory?: (category: Category) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onAddWorkflow?: () => void;
}

export const WorkflowList = ({
  isLoading,
  workflows = [],
  onDelete,
  onEditDetails,
  onRun,
  onToggleFavorite,
  categories,
  categoriesLoading = false,
  selectedCategory,
  onCategorySelect,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onAddWorkflow
}: WorkflowListProps) => {
  const {
    selectedWorkflows,
    searchQuery: internalSearchQuery,
    setSearchQuery: internalSetSearchQuery,
    showFavorites,
    toggleFavoritesFilter,
    filteredWorkflows,
    filteredByCategory,
    handleSelectAll,
    handleSelect,
    handleBulkDelete
  } = useWorkflowListState(workflows, onDelete);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const handleSearchChange = (value: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(value);
    } else {
      internalSetSearchQuery(value);
    }
  };

  const workflowsToDisplay = selectedCategory ? 
    filteredByCategory(selectedCategory) : 
    filteredWorkflows;

  if (isLoading) {
    return <p className="text-muted-foreground">Loading workflows...</p>;
  }

  return (
    <div className="w-full space-y-4">
      <HeaderSection
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
        onEditCategory={onEditCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddWorkflow={onAddWorkflow}
        showFavorites={showFavorites}
        onToggleFavorites={toggleFavoritesFilter}
      />

      <WorkflowTableSection
        selectedWorkflows={selectedWorkflows}
        handleBulkDelete={handleBulkDelete}
        workflowsToDisplay={workflowsToDisplay}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onEditDetails={onEditDetails}
        onRun={onRun}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        categories={categories}
      />
    </div>
  );
};
