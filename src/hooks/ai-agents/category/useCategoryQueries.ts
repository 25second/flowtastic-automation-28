
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category } from '@/types/workflow';
import { useAuth } from '@/components/auth/AuthProvider';

export function useCategoryQueries(
  setCategories: (categories: Category[]) => void,
  setLoading: (loading: boolean) => void,
  createDefaultCategory: () => Promise<void>
) {
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchCategories();
    }
  }, [session]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      if (!session?.user) {
        console.error('No user session found');
        setLoading(false);
        return;
      }
      
      // First, get all agents to find associated category IDs
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('category_id')
        .eq('user_id', session.user.id);

      if (agentsError) {
        console.error('Error fetching agent category IDs:', agentsError);
        toast.error('Failed to load agent categories');
        setLoading(false);
        return;
      }

      // Extract unique category IDs from agents
      const categoryIds = Array.from(new Set(
        agents
          .map(agent => agent.category_id)
          .filter(id => id !== null)
      ));
      
      // If no categories associated with agents, create default category and return
      if (categoryIds.length === 0) {
        await createDefaultCategory();
        setLoading(false);
        return;
      }
      
      // Get categories that are associated with agents
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('agent_categories')
        .select('*')
        .eq('user_id', session.user.id)
        .in('id', categoryIds)
        .order('created_at', { ascending: false });

      if (categoriesError) {
        console.error('Error fetching agent categories:', categoriesError);
        toast.error('Failed to load agent categories');
      } else {
        // Transform data to match Category type
        const formattedCategories: Category[] = categoriesData.map(item => ({
          id: item.id,
          name: item.name,
          user_id: item.user_id,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setCategories(formattedCategories);
        
        // If no categories found, create default
        if (categoriesData.length === 0) {
          await createDefaultCategory();
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      setLoading(false);
    }
  };

  return {
    fetchCategories
  };
}
