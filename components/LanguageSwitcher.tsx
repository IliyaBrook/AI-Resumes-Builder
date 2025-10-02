'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const languages = [
  { code: 'en', label: 'English', flag: '/flags/us.svg' },
  { code: 'he', label: 'עברית', flag: '/flags/il.svg' },
];

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const { data: document } = useGetDocumentById(documentId);
  const { mutate: updateDocument, isPending } = useUpdateDocument();

  const currentLocale = document?.data?.locale || 'en';
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (locale: string) => {
    if (locale !== currentLocale) {
      // Update database
      updateDocument({ locale });

      // Get current path and replace locale parameter
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/');

      // Find and replace the locale segment (should be at index that contains current locale)
      const localeIndex = pathSegments.findIndex(segment => segment === currentLocale);
      if (localeIndex !== -1) {
        pathSegments[localeIndex] = locale;
        const newPath = pathSegments.join('/');

        // Navigate to new path and reload
        router.push(newPath);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center gap-1">
          <Image src={currentLanguage.flag} alt={currentLanguage.label} width={20} height={20} />
          <span>{currentLanguage.label}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="py-1">
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                  currentLocale === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                <Image src={language.flag} alt={language.label} width={20} height={20} />
                <span>{language.label}</span>
                {currentLocale === language.code && <span className="ml-auto text-indigo-500">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
