'use client';

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { useParams } from 'next/navigation';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
];

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const documentId = params.documentId as string;
  
  const { data: document, isLoading } = useGetDocumentById(documentId);
  const { mutate: updateDocument, isPending } = useUpdateDocument();
  
  const currentLocale = document?.data?.locale || 'en';
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];
  
  const handleLanguageChange = (locale: string) => {
    if (locale !== currentLocale) {
      updateDocument({ locale });
    }
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
        <Globe className="w-4 h-4 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Globe className="w-4 h-4" />
        <span className="flex items-center gap-1">
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.label}</span>
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  currentLocale === language.code
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700'
                }`}
              >
                <span>{language.flag}</span>
                <span>{language.label}</span>
                {currentLocale === language.code && (
                  <span className="ml-auto text-indigo-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}