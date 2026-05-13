'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ImportResumeDialog from './ImportResumeDialog';

const AIImportResume: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full max-w-[218.4px] cursor-pointer p-[2px] text-left"
        aria-label="AI Import Resume"
      >
        <div className="hover:border-primary dark:bg-secondary flex h-[218.4px] w-full max-w-full flex-col items-center justify-center gap-2 rounded-lg border bg-white py-24 transition hover:shadow">
          <span className="text-primary">
            <Sparkles size="30px" />
          </span>
          <p className="text-sm font-semibold">AI Import Resume</p>
          <p className="text-muted-foreground px-3 text-center text-xs">Upload a PDF or DOCX</p>
        </div>
      </button>
      <ImportResumeDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default AIImportResume;
