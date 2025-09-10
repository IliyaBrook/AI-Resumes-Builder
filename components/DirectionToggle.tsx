'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';

interface DirectionToggleProps {
  className?: string;
}

export const DirectionToggle: React.FC<DirectionToggleProps> = ({ className = '' }) => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const { mutate: updateDocument } = useUpdateDocument();
  const [isRtl, setIsRtl] = useState(false);

  // Initialize direction from database on first render
  useEffect(() => {
    if (data?.data?.direction) {
      const isRtlFromDb = data.data.direction === 'rtl';
      setIsRtl(isRtlFromDb);
    }
  }, [data?.data?.direction]);

  useEffect(() => {
    // Apply direction to the html element
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-direction', isRtl ? 'rtl' : 'ltr');
  }, [isRtl]);

  const toggleDirection = () => {
    const newDirection = !isRtl;
    setIsRtl(newDirection);
    // Save to database
    updateDocument({
      direction: newDirection ? 'rtl' : 'ltr',
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDirection}
      className={`gap-2 ${className}`}
      title={`Switch to ${isRtl ? 'LTR' : 'RTL'} direction`}
    >
      <RotateCcw size="16px" className={isRtl ? 'rotate-180' : ''} />
      {isRtl ? 'RTL' : 'LTR'}
    </Button>
  );
};

export default DirectionToggle;
