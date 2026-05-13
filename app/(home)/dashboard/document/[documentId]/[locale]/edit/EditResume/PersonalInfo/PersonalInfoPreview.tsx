'use client';
import { Skeleton } from '@/components';
import { GITHUB_BASE_URL, INITIAL_THEME_COLOR, LINKEDIN_BASE_URL, normalizeProfileUrl } from '@/lib/helper';
import { DocumentType } from '@/types';
import React, { FC } from 'react';
import { Mail, Phone, MapPin, GitBranch as Github, Briefcase as Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PropsType {
  resumeInfo: DocumentType | undefined;
  isLoading: boolean;
}

const PersonalInfoPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const t = useTranslations('PersonalInfo');
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  const displayFormat = resumeInfo?.personalInfoDisplayFormat || 'default';
  const isCompact = displayFormat === 'compact';

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isCompact) {
    const compactInfo: React.ReactNode[] = [];
    if (resumeInfo?.personalInfo?.jobTitle && [...resumeInfo.personalInfo.jobTitle].some(word => word === '|')) {
      compactInfo.push(
        <span key="jobTitle" className="font-bold">
          {[...resumeInfo.personalInfo.jobTitle].map((word, idx) => {
            return word === '|' ? (
              <span style={{ color: themeColor }} key={`job-title-with-sep-${idx}`}>
                |
              </span>
            ) : (
              word
            );
          })}
        </span>
      );
    } else {
      if (resumeInfo?.personalInfo?.jobTitle) {
        compactInfo.push(
          <span key="jobTitle" className="font-bold">
            {resumeInfo.personalInfo.jobTitle}
          </span>
        );
      }
    }

    if (resumeInfo?.personalInfo?.address) {
      compactInfo.push(<span key="address">{resumeInfo.personalInfo.address}</span>);
    }

    if (resumeInfo?.personalInfo?.phone) {
      compactInfo.push(<span key="phone">{resumeInfo.personalInfo.phone}</span>);
    }

    if (resumeInfo?.personalInfo?.email) {
      compactInfo.push(<span key="email">{resumeInfo.personalInfo.email}</span>);
    }

    if (resumeInfo?.personalInfo?.github) {
      compactInfo.push(
        <a
          key="github"
          href={normalizeProfileUrl(resumeInfo.personalInfo.github, GITHUB_BASE_URL)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline hover:underline"
        >
          {resumeInfo.personalInfo.github}
        </a>
      );
    }

    if (resumeInfo?.personalInfo?.linkedin) {
      compactInfo.push(
        <a
          key="linkedin"
          href={normalizeProfileUrl(resumeInfo.personalInfo.linkedin, LINKEDIN_BASE_URL)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline hover:underline"
        >
          {resumeInfo.personalInfo.linkedin}
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
          {resumeInfo?.personalInfo?.firstName || t('First Name')}{' '}
          {resumeInfo?.personalInfo?.lastName || t('Last Name')}
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
                      const globalIndex = startIndex + index;
                      const isLastInRow = index === rowItems.length - 1;
                      return (
                        <span key={globalIndex} className="whitespace-nowrap">
                          {item}
                          {!isLastInRow && (
                            <span
                              className="mx-1 font-bold"
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
          className="mt-2 mb-4 border-[1px]"
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
        className="mb-2 cursor-default text-center text-2xl font-bold"
        style={{
          color: themeColor,
        }}
      >
        {resumeInfo?.personalInfo?.firstName || 'First Name'} {resumeInfo?.personalInfo?.lastName || 'Last Name'}
      </h2>
      <div className="mb-2 w-full text-center text-base font-medium text-gray-600">
        <div className="flex items-center justify-center">
          <span className="cursor-default font-bold">{resumeInfo?.personalInfo?.jobTitle || t('Job Title')}</span>
          {resumeInfo?.personalInfo?.address && (
            <span className="ml-2 flex cursor-default items-center gap-1 !text-[13px] !leading-[19.5px] whitespace-nowrap transition-colors hover:text-gray-900">
              <MapPin size={15} className="shrink-0 opacity-70" />
              <span className="pdf-position-fix cursor-default">{resumeInfo.personalInfo.address}</span>
            </span>
          )}
        </div>
      </div>
      <div className="pdf-padding-bottom-0 mx-auto flex max-w-[600px] flex-col items-center justify-center gap-y-1 pb-3 !text-[13px] text-gray-600">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {resumeInfo?.personalInfo?.phone && (
            <span className="flex items-center gap-1 !text-[13px] whitespace-nowrap transition-colors hover:text-gray-900">
              <Phone size={15} className="shrink-0 opacity-70" />
              <p className="pdf-position-fix cursor-default">{resumeInfo.personalInfo.phone}</p>
            </span>
          )}
          {resumeInfo?.personalInfo?.email && (
            <span className="flex items-center gap-1 !text-[13px] whitespace-nowrap transition-colors hover:text-gray-900">
              <Mail size={15} className="shrink-0 opacity-70" />
              <p className="pdf-position-fix cursor-default">{resumeInfo.personalInfo.email}</p>
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {resumeInfo?.personalInfo?.github && (
            <a
              href={normalizeProfileUrl(resumeInfo.personalInfo.github, GITHUB_BASE_URL)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 !text-[13px] whitespace-nowrap text-inherit no-underline transition-colors hover:text-gray-900 hover:underline"
            >
              <Github size={15} className="shrink-0 opacity-70" />
              <span className="pdf-position-fix">{resumeInfo.personalInfo.github}</span>
            </a>
          )}
          {resumeInfo?.personalInfo?.linkedin && (
            <a
              href={normalizeProfileUrl(resumeInfo.personalInfo.linkedin, LINKEDIN_BASE_URL)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 !text-[13px] whitespace-nowrap text-inherit no-underline transition-colors hover:text-gray-900 hover:underline"
            >
              <Linkedin size={15} className="shrink-0 opacity-70" />
              <span className="pdf-position-fix">{resumeInfo.personalInfo.linkedin}</span>
            </a>
          )}
        </div>
      </div>

      <hr
        className="mt-2 mb-4 border-[1px]"
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
