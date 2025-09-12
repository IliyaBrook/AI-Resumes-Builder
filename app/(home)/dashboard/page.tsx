import React from 'react';
import { TrashListBox, ResumeList, AddResume } from '@/app/(home)/dashboard/index';

const Page = () => {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-5 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl">Resume Builder</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <TrashListBox />
          </div>
        </div>

        <div className="w-full pt-11">
          <h5 className="mb-3 text-xl font-semibold dark:text-inherit">All Resume</h5>
          <div className="flex w-full flex-wrap gap-5">
            <AddResume />
            <ResumeList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
