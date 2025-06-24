'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById } from '@/hooks';

interface FirstRenderContextType {
  isDataLoaded: boolean;
}

interface FirstRenderProviderProps {
  children: React.ReactNode;
}

export const FirstRenderContext = createContext<FirstRenderContextType>({
  isDataLoaded: false,
});

export const FirstRenderProvider: React.FC<FirstRenderProviderProps> = ({ children }) => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && data?.data) {
      setTimeout(() => {
        setIsDataLoaded(true);
      }, 100);
    }
  }, [isLoading, data]);

  useEffect(() => {
    setIsDataLoaded(false);
  }, [documentId]);

  return <FirstRenderContext.Provider value={{ isDataLoaded }}>{children}</FirstRenderContext.Provider>;
};
