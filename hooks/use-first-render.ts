import { useContext } from 'react';
import { FirstRenderContext } from '@/context';

const useFirstRender = () => {
  const context = useContext(FirstRenderContext);
  if (!context) {
    throw new Error('useFirstRender must be used within FirstRenderProvider');
  }
  return context;
};

export default useFirstRender;
