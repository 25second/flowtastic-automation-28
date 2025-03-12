
import { useState, useEffect } from 'react';
import { AIProviderConfig } from './ai-providers/types';
import { useProviderQueries } from './ai-providers/useProviderQueries';
import { useProviderMutations } from './ai-providers/useProviderMutations';
import { useActiveSessions } from './ai-providers/useActiveSessions';

export function useAIProviders() {
  const [openaiConfig, setOpenaiConfig] = useState<AIProviderConfig>({
    name: 'OpenAI',
    api_key: '',
    is_custom: false
  });
  
  const [geminiConfig, setGeminiConfig] = useState<AIProviderConfig>({
    name: 'Gemini',
    api_key: '',
    is_custom: false
  });
  
  const [anthropicConfig, setAnthropicConfig] = useState<AIProviderConfig>({
    name: 'Anthropic',
    api_key: '',
    is_custom: false
  });
  
  const [customProviders, setCustomProviders] = useState<AIProviderConfig[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  
  const { providers, isLoading: providersLoading, refetch, error: providersError } = useProviderQueries();
  const { saveProvider, deleteProvider, isSubmitting } = useProviderMutations();
  const { 
    activeSessionsCount, 
    setActiveSessionsCount, 
    refreshActiveSessionsCount, 
    isLoading: sessionsLoading,
    error: sessionsError
  } = useActiveSessions();
  
  // Check for network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load providers data
  useEffect(() => {
    if (providers && !providersLoading) {
      const openai = providers.find(p => p.name === 'OpenAI' && !p.is_custom);
      const gemini = providers.find(p => p.name === 'Gemini' && !p.is_custom);
      const anthropic = providers.find(p => p.name === 'Anthropic' && !p.is_custom);
      const custom = providers.filter(p => p.is_custom);
      
      if (openai) setOpenaiConfig(openai);
      if (gemini) setGeminiConfig(gemini);
      if (anthropic) setAnthropicConfig(anthropic);
      if (custom.length > 0) setCustomProviders(custom);
      
      console.log('AI Providers loaded:', {
        openai: !!openai,
        gemini: !!gemini,
        anthropic: !!anthropic,
        customCount: custom.length
      });
    }
  }, [providers, providersLoading]);
  
  const addCustomProvider = (provider: AIProviderConfig) => {
    setCustomProviders(prev => [...prev, provider]);
  };
  
  const deleteCustomProvider = async (providerId: string) => {
    try {
      await deleteProvider(providerId);
      setCustomProviders(prev => prev.filter(p => p.id !== providerId));
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  };
  
  return {
    openaiConfig,
    setOpenaiConfig,
    geminiConfig,
    setGeminiConfig,
    anthropicConfig,
    setAnthropicConfig,
    customProviders,
    isLoading: providersLoading || sessionsLoading,
    isSubmitting,
    saveProvider,
    deleteCustomProvider,
    addCustomProvider,
    activeSessionsCount,
    setActiveSessionsCount,
    refreshActiveSessionsCount,
    isOffline,
    error: providersError || sessionsError
  };
}
