import { useAgents } from "@/hooks/ai-agents/useAgents";
import { useAgentCategories } from "@/hooks/ai-agents/useAgentCategories";
import { AgentCategories } from "./categories/AgentCategories";
import { AgentListView } from "./AgentListView";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
export function AIAgentsContent() {
  const [showFavorites, setShowFavorites] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedAgents,
    filteredAgents,
    handleSelectAgent,
    handleSelectAll,
    handleStartAgent,
    handleStopAgent,
    handleDeleteAgent,
    handleToggleFavorite,
    handleBulkStart,
    handleBulkStop,
    handleBulkDelete,
    fetchAgents
  } = useAgents();
  const {
    categories,
    loading: categoriesLoading,
    selectedCategory,
    setSelectedCategory,
    addCategory,
    deleteCategory,
    editCategory
  } = useAgentCategories();

  // Filter agents by category and favorites
  const filteredByCategory = filteredAgents.filter(agent => {
    const matchesCategory = !selectedCategory || agent.category_id === selectedCategory;
    const matchesFavorite = !showFavorites || agent.is_favorite;
    return matchesCategory && matchesFavorite;
  });
  const toggleFavoritesFilter = () => {
    setShowFavorites(!showFavorites);
  };
  return <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        
      </div>

      <AgentCategories categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} onAddCategory={addCategory} onDeleteCategory={deleteCategory} onEditCategory={editCategory} isLoading={categoriesLoading} />

      <AgentListView searchQuery={searchQuery} onSearchChange={setSearchQuery} isAddDialogOpen={isAddDialogOpen} setIsAddDialogOpen={setIsAddDialogOpen} selectedAgents={selectedAgents} filteredAgents={filteredByCategory} onSelectAgent={handleSelectAgent} onSelectAll={handleSelectAll} onStartAgent={handleStartAgent} onStopAgent={handleStopAgent} onDeleteAgent={handleDeleteAgent} onToggleFavorite={handleToggleFavorite} onBulkStart={handleBulkStart} onBulkStop={handleBulkStop} onBulkDelete={handleBulkDelete} fetchAgents={fetchAgents} />
    </div>;
}