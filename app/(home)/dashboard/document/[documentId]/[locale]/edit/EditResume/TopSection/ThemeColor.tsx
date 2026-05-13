'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { INITIAL_THEME_COLOR } from '@/constant/colors';
// components
import { Popover, PopoverContent, PopoverTrigger, Button } from '@/components';
import { Palette, ChevronDown } from 'lucide-react';
import { generateThumbnail } from '@/lib/helper';
// hooks
import { useDebounce, useGetDocumentById, useUpdateDocument, toast } from '@/hooks';
import { useTranslations } from 'next-intl';

const ThemeColor = () => {
  const t = useTranslations('TopSection');
  const tCommon = useTranslations('Common');

  const colors = [
    '#FF6F61',
    '#33B679',
    '#4B9CD3',
    '#FF6F91',
    '#9B59B6',
    '#1ABC9C',
    '#FF8C00',
    '#B2D300',
    '#8E44AD',
    '#FF4F81',
    '#2ECC71',
    '#3498DB',
    '#A3D550',
    '#00BFFF',
    '#FF6F61',
    '#8E44AD',
    '#2ECC71',
    '#5B2C6F',
    '#FF4F81',
    '#2980B9',
  ];

  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const [selectedColor, setSelectedColor] = useState(resumeInfo?.themeColor || INITIAL_THEME_COLOR);
  const debouncedColor = useDebounce<string>(selectedColor, 1000);

  useEffect(() => {
    setSelectedColor(resumeInfo?.themeColor || INITIAL_THEME_COLOR);
  }, [resumeInfo?.themeColor]);

  const onColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const onSave = useCallback(async () => {
    if (!selectedColor) return;
    if (selectedColor === INITIAL_THEME_COLOR) return;
    const thumbnail = await generateThumbnail();
    setResumeInfo(
      {
        themeColor: selectedColor,
        thumbnail: thumbnail,
      },
      {
        onError() {
          toast({
            title: tCommon('Error'),
            description: t('Failed to update theme'),
            variant: 'destructive',
          });
        },
      }
    );
  }, [selectedColor, setResumeInfo]);

  useEffect(() => {
    if (debouncedColor) {
      void onSave();
    }
  }, [debouncedColor, onSave]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={resumeInfo?.status === 'archived'}
          variant="secondary"
          className="gap-1 border bg-white !p-2 dark:bg-gray-800 lg:w-auto lg:p-4"
        >
          <div className="flex items-center gap-1">
            <Palette size="17px" />
            <span className="hidden lg:flex">{t('Theme')}</span>
          </div>
          <ChevronDown size="14px" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="bg-background">
        <h2 className="mb-2 text-sm font-bold">{t('Select Theme Color')}</h2>

        <div className="grid grid-cols-5 gap-3">
          {colors.map((item: string, index: number) => (
            <div
              role="button"
              key={index}
              onClick={() => onColorSelect(item)}
              className={`h-5 w-8 rounded-[5px] border hover:border-black ${selectedColor === item && 'border border-black'} `}
              style={{
                background: item,
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeColor;
