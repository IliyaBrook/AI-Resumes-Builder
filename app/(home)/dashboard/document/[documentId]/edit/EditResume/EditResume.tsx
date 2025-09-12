import React from 'react';
import { ResumeForm, ResumePreview, TopSection } from '@/app/(home)/dashboard';
import { FirstRenderProvider } from '@/context';

const EditResume = () => {
  return (
    <div className="relative w-full">
      <div className="mx-auto w-full max-w-7xl px-5 py-4">
        <TopSection />
        <div className="mt-1 w-full">
          <div className="flex w-full flex-col items-start gap-6 py-3 lg:flex-row">
            <FirstRenderProvider>
              <ResumeForm />
              <ResumePreview />
            </FirstRenderProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResume;
