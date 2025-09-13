'use client';

import { cn } from '@/lib/utils';
import { FileText, Lock, Globe, Trash2 } from 'lucide-react';
import React, { FC, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ResumeTitleProps {
  initialTitle: string;
  isLoading: boolean;
  status?: 'archived' | 'private' | 'public' | null;
  onSave?: (newTitle: string) => void;
}

const ResumeTitle: FC<ResumeTitleProps> = ({ initialTitle, isLoading, status, onSave }) => {
  const tCommon = useTranslations('Common');
  const [title, setTitle] = useState(tCommon('untitledResume'));

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  const handleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const newTitle = e.target.innerText;
    setTitle(newTitle);
    if (onSave && typeof onSave === 'function') {
      onSave(newTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-center gap-1 pr-4">
      <FileText className="stroke-primary" size="20px" />
      <h5
        className={cn(`px-1 text-[20px] font-semibold text-gray-700 opacity-100 dark:text-gray-300`, {
          '!pointer-events-none !opacity-70': isLoading || status === 'archived',
        })}
        contentEditable={!(isLoading || status === 'archived')}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      >
        {title}
      </h5>
      <span>
        {status === 'private' ? (
          <Lock size="14px" className="" />
        ) : status === 'public' ? (
          <Globe size="14px" />
        ) : status === 'archived' ? (
          <Trash2 size="14px" />
        ) : null}
      </span>
    </div>
  );
};

export default ResumeTitle;
