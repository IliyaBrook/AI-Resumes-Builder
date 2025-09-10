'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Languages, Loader } from 'lucide-react';
import { getAIChatSession } from '@/lib/google-ai-model';
import { toast } from '@/hooks';

interface TranslateSectionProps {
  onTranslate: (translatedText: string) => void;
  currentText: string;
  className?: string;
  placeholder?: string;
}

export const TranslateSection: React.FC<TranslateSectionProps> = ({
  onTranslate,
  currentText,
  className = '',
  placeholder = 'Enter target language (e.g. Spanish, French, Arabic)',
}) => {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!targetLanguage.trim()) {
      toast({
        title: 'Language required',
        description: 'Please enter a target language',
        variant: 'destructive',
      });
      return;
    }

    if (!currentText.trim()) {
      toast({
        title: 'No content to translate',
        description: 'No text content found to translate',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const prompt = `Translate the following text to ${targetLanguage}. Preserve all HTML formatting, structure, and tags exactly as they are. Only translate the text content inside the HTML tags, do not modify the HTML structure itself. Return only the translated HTML without any additional explanations:

${currentText}`;

      const chat = getAIChatSession();
      const result = await chat.sendMessage({ message: prompt });
      const translatedText = result.text || '';

      if (translatedText.trim()) {
        onTranslate(translatedText.trim());
        toast({
          title: 'Translation completed',
          description: `Text translated to ${targetLanguage}`,
        });
      } else {
        throw new Error('Empty translation result');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: 'Failed to translate the text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={targetLanguage}
        onChange={e => setTargetLanguage(e.target.value)}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            void handleTranslate();
          }
        }}
        className="min-w-[200px]"
        disabled={loading}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => void handleTranslate()}
        disabled={loading || !targetLanguage.trim()}
        className="gap-2 whitespace-nowrap"
      >
        <Languages size="16px" className="text-blue-500" />
        Translate to
        {loading && <Loader size="14px" className="animate-spin" />}
      </Button>
    </div>
  );
};

export default TranslateSection;
