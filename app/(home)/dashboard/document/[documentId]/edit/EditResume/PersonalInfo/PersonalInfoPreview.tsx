'use client';
import { Skeleton } from '@/components';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { DocumentType } from '@/types/resume.type';
import React, { FC } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const PersonalInfoPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  const displayFormat = resumeInfo?.personalInfoDisplayFormat || 'default';
  const isCompact = displayFormat === 'compact';

  const normalizeUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isCompact) {
    const compactInfo: React.ReactNode[] = [];

    if (resumeInfo?.personalInfo?.jobTitle) {
      compactInfo.push(
        <span key="jobTitle" className="font-bold">
          {resumeInfo.personalInfo.jobTitle}
        </span>
      );
    }

    if (resumeInfo?.personalInfo?.address) {
      compactInfo.push(<span key="address">{resumeInfo.personalInfo.address}</span>);
    }

    if (resumeInfo?.personalInfo?.phone) {
      compactInfo.push(<span key="phone">{resumeInfo.personalInfo.phone}</span>);
    }

    if (resumeInfo?.personalInfo?.email) {
      compactInfo.push(
        <a key="email" href={`mailto:${resumeInfo.personalInfo.email}`} className="hover:underline">
          {resumeInfo.personalInfo.email}
        </a>
      );
    }

    if (resumeInfo?.personalInfo?.github) {
      compactInfo.push(
        <a
          key="github"
          href={normalizeUrl(resumeInfo.personalInfo.github)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {resumeInfo.personalInfo.github.replace(/^https?:\/\//, '')}
        </a>
      );
    }

    if (resumeInfo?.personalInfo?.linkedin) {
      compactInfo.push(
        <a
          key="linkedin"
          href={normalizeUrl(resumeInfo.personalInfo.linkedin)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {resumeInfo.personalInfo.linkedin.replace(/^https?:\/\//, '')}
        </a>
      );
    }

    return (
      <div className="min-h-14 w-full">
        <h2
          className="mb-2 text-center text-2xl font-bold"
          style={{
            color: themeColor,
          }}
        >
          {resumeInfo?.personalInfo?.firstName || 'First Name'} {resumeInfo?.personalInfo?.lastName || 'Last Name'}
        </h2>
        <div className="mb-2 w-full text-center text-sm font-medium text-gray-600">
          <div className="flex flex-col items-center gap-y-1">
            {(() => {
              const totalItems = compactInfo.length;
              const maxItemsPerRow = 3;
              const rows = Math.ceil(totalItems / maxItemsPerRow);
              const itemsPerRow = Math.ceil(totalItems / rows);

              return Array.from({ length: rows }, (_, rowIndex) => {
                const startIndex = rowIndex * itemsPerRow;
                const endIndex = Math.min(startIndex + itemsPerRow, totalItems);
                const rowItems = compactInfo.slice(startIndex, endIndex);

                return (
                  <div key={rowIndex} className="flex flex-wrap justify-center gap-x-1">
                    {rowItems.map((item, index) => {
                      const isLast = index === rowItems.length - 1;
                      return (
                        <span key={startIndex + index} className="whitespace-nowrap">
                          {item}
                          {!isLast && (
                            <span
                              className="mx-[1px] font-bold"
                              style={{
                                color: themeColor,
                              }}
                            >
                              |
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        </div>
        <hr
          className="mb-4 mt-2 border-[1px]"
          style={{
            borderColor: themeColor,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-14 w-full">
      <h2
        className="mb-2 text-center text-2xl font-bold"
        style={{
          color: themeColor,
        }}
      >
        {resumeInfo?.personalInfo?.firstName || 'First Name'} {resumeInfo?.personalInfo?.lastName || 'Last Name'}
      </h2>
      <div className="mb-2 w-full text-center text-base font-medium text-gray-600">
        <div className="flex justify-center">
          <span className="font-bold">{resumeInfo?.personalInfo?.jobTitle || 'Job Title'}</span>
          <span>
            {resumeInfo?.personalInfo?.address && (
              <span className="ml-2 flex items-center gap-1 whitespace-nowrap !text-[13px] transition-colors hover:text-gray-900">
                <MapPin size={15} className="shrink-0 opacity-70" />
                <span className="pdf-position-fix">{resumeInfo.personalInfo.address}</span>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="pdf-padding-bottom-0 mx-auto flex max-w-[600px] flex-col items-center justify-center gap-y-1 pb-3 !text-[13px] text-gray-600">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {resumeInfo?.personalInfo?.phone && (
            <span className="flex items-center gap-1 whitespace-nowrap !text-[13px] transition-colors hover:text-gray-900">
              <Phone size={15} className="shrink-0 opacity-70" />
              <a href={`tel:${resumeInfo.personalInfo.phone}`} className="pdf-position-fix hover:underline">
                {resumeInfo.personalInfo.phone}
              </a>
            </span>
          )}
          {resumeInfo?.personalInfo?.email && (
            <span className="flex items-center gap-1 whitespace-nowrap !text-[13px] transition-colors hover:text-gray-900">
              <Mail size={15} className="shrink-0 opacity-70" />
              <a href={`mailto:${resumeInfo.personalInfo.email}`} className="pdf-position-fix hover:underline">
                {resumeInfo.personalInfo.email}
              </a>
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {resumeInfo?.personalInfo?.github && (
            <span className="flex items-center gap-1 whitespace-nowrap !text-[13px] transition-colors hover:text-gray-900">
              <Github size={15} className="shrink-0 opacity-70" />
              <a
                href={normalizeUrl(resumeInfo.personalInfo.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-position-fix hover:underline"
              >
                {resumeInfo.personalInfo.github.replace(/^https?:\/\//, '')}
              </a>
            </span>
          )}
          {resumeInfo?.personalInfo?.linkedin && (
            <span className="flex items-center gap-1 whitespace-nowrap !text-[13px] transition-colors hover:text-gray-900">
              <Linkedin size={15} className="shrink-0 opacity-70" />
              <a
                href={normalizeUrl(resumeInfo.personalInfo.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-position-fix hover:underline"
              >
                {resumeInfo.personalInfo.linkedin.replace(/^https?:\/\//, '')}
              </a>
            </span>
          )}
        </div>
      </div>

      <hr
        className="mb-4 mt-2 border-[1px]"
        style={{
          borderColor: themeColor,
        }}
      />
    </div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="min-h-14 w-full">
      <Skeleton className="mx-auto mb-2 h-6 w-1/2" />
      <Skeleton className="mx-auto mb-2 h-6 w-1/4" />
      <Skeleton className="mx-auto mb-2 h-6 w-1/3" />
      <div className="flex justify-between pt-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="my-2 h-[1.5px] w-full" />
    </div>
  );
};

export default PersonalInfoPreview;
