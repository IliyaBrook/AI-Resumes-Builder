import { useState, useEffect, useRef } from 'react';

export const useSectionSelection = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSection(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedSection(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSection = (sectionKey: string) => {
    setSelectedSection(prev => (prev === sectionKey ? null : sectionKey));
  };

  return {
    selectedSection,
    setSelectedSection,
    toggleSection,
    containerRef,
  };
};
