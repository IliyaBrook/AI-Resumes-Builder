'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';

type TFirstRenderState = 'firstRender' | 'notFirstRender' | 'pending';
type tSetHasBeenFirstRender = React.Dispatch<React.SetStateAction<TFirstRenderState>>;

interface FirstRenderContextType {
  firstRender: TFirstRenderState;
}

interface FirstRenderProviderProps {
  children: React.ReactNode;
}

export const FirstRenderContext = createContext<FirstRenderContextType>({
  firstRender: 'pending',
});

export const FirstRenderProvider: React.FC<FirstRenderProviderProps> = ({ children }) => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading: isLoadingData } = useGetDocumentById(documentId);
  const [isLoading, setIsLoading] = useState(true);
  const [firstRender, setFirstRender] = useState<TFirstRenderState>('pending');
  const [hasBeenFirstRender, setHasBeenFirstRender] = useState(false);
  useEffect(() => {
    setIsLoading(false);
    return () => {
      setIsLoading(true);
    };
  }, []);

  useEffect(() => {
    if (!isLoadingData && !isLoading && data?.data) {
      if (!hasBeenFirstRender) {
        setFirstRender('firstRender');
        setHasBeenFirstRender(true);
      } else {
        setFirstRender('notFirstRender');
      }
    }
  }, [isLoadingData, data, isLoading]);

  useEffect(() => {
    setFirstRender('pending');
    setHasBeenFirstRender(false);
  }, [documentId]);

  return <FirstRenderContext.Provider value={{ firstRender }}>{children}</FirstRenderContext.Provider>;
};
