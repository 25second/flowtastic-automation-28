import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritedWorkflows } from '@/hooks/workflow/useFavoritedWorkflows';
import { useWorkflowCategories } from '@/hooks/workflow/useWorkflowCategories';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, MenuSquare, Bot, Users, GitBranch, Star, Edit, Play } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export function FavoritedWorkflows() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useLanguage();
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'workflows' | 'agents'>('workflows');
  
  const { categories } = useWorkflowCategories();
  
  const {
    favoritedWorkflows,
    favoritedAgents,
    isLoading,
    toggleFavorite
  } = useFavoritedWorkflows(session);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const handleWorkflowDelete = async (ids: string[]) => {
    toast('Delete functionality would go here');
  };

  const handleWorkflowEditDetails = (workflow: any) => {
    navigate('/workflows', {
      state: {
        workflow
      }
    });
  };

  const handleWorkflowRun = (workflow: any) => {
    toast.success(`Workflow "${workflow.name}" run`);
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavorite.mutate({
      workflowId: id,
      isFavorite
    });
  };

  const handleToggleAgentFavorite = (id: string, isFavorite: boolean) => {
    toggleFavorite.mutate({
      workflowId: id,
      isFavorite
    });
  };

  const handleSelect = (id: string) => {
    setSelectedWorkflows(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  };

  const handleCreateWorkflow = () => {
    navigate('/workflows');
  };

  const handleEditCanvas = (workflow: any) => {
    navigate('/canvas', {
      state: {
        workflow
      }
    });
  };

  const renderContent = () => {
    if (viewMode === 'workflows') {
      if (favoritedWorkflows && favoritedWorkflows.length > 0) {
        return <div className="space-y-2">
          {favoritedWorkflows.map(workflow => (
            <div key={workflow.id} className="flex items-center justify-between py-2 px-4 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
              <div className="flex-shrink-0 flex items-center gap-2">
                <h4 className="font-medium truncate">{workflow.name || "Untitled Workflow"}</h4>
                {workflow.category && <Badge variant="outline" className="bg-background/50 text-xs px-2">
                  {getCategoryName(workflow.category)}
                </Badge>}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditCanvas(workflow)} className="h-8 w-8" title="Edit Workflow">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleWorkflowRun(workflow)} className="h-8 w-8" title="Run Workflow">
                  <Play className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(workflow.id, false)} className="h-8 w-8" title="Remove from Favorites">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>;
      } else {
        return <div className="text-center py-6 text-muted-foreground">
          <p>{t('workflow.noFavorites')}</p>
          <Button variant="outline" className="mt-3" onClick={() => navigate('/workflows')}>
            {t('workflow.goToList')}
          </Button>
        </div>;
      }
    } else {
      if (favoritedAgents && favoritedAgents.length > 0) {
        return <div className="space-y-2">
          {favoritedAgents.map(agent => (
            <div key={agent.id} className="flex items-center justify-between py-2 px-4 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
              <div className="flex-shrink-0 flex items-center gap-2">
                <h4 className="font-medium truncate">{agent.name || "Untitled Agent"}</h4>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/agents/${agent.id}`)} className="h-8 w-8">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success(`Agent "${agent.name}" started`)} className="h-8 w-8">
                  <Play className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleToggleAgentFavorite(agent.id, false)} className="h-8 w-8" title="Remove from Favorites">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>;
      } else {
        return <div className="text-center py-6 text-muted-foreground">
          <p>{t('agents.noFavorites')}</p>
          <Button variant="outline" className="mt-3" onClick={() => navigate('/agents')}>
            {t('agents.goToList')}
          </Button>
        </div>;
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">{t('favorites.title')}</h2>
          <Tabs value={viewMode} onValueChange={value => setViewMode(value as 'workflows' | 'agents')} className="ml-4">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="workflows" className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                <span>{t('workflow.plural')}</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                <span>{t('agents.plural')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(viewMode === 'workflows' ? '/workflows' : '/agents')}>
          <Plus className="h-4 w-4" />
          {viewMode === 'workflows' ? t('workflow.create') : t('agents.create')}
        </Button>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : renderContent()}
      </div>
    </div>
  );
}
