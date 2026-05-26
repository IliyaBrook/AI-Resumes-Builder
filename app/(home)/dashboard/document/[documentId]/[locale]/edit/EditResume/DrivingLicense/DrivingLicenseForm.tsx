'use client';

import React, { useEffect, useState } from 'react';
import { CarFront } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Input, Label } from '@/components';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';

const DrivingLicenseForm = () => {
  const t = useTranslations('DrivingLicense');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const [enabled, setEnabled] = useState(false);
  const [localDrivingLicense, setLocalDrivingLicense] = useState('');

  useEffect(() => {
    const drivingLicense = resumeInfo?.drivingLicense || '';
    setLocalDrivingLicense(drivingLicense);
    setEnabled(Boolean(drivingLicense.trim()));
  }, [resumeInfo?.drivingLicense]);

  const handleToggle = () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);

    if (!nextEnabled) {
      setLocalDrivingLicense('');
      setResumeInfo({ drivingLicense: '' });
    }
  };

  const handleBlur = () => {
    const normalizedValue = localDrivingLicense.trim();

    if (normalizedValue !== resumeInfo?.drivingLicense) {
      setResumeInfo({ drivingLicense: normalizedValue });
    }
  };

  return (
    <div>
      <div className="w-full">
        <h2 className="text-lg font-bold">{t('Driving License')}</h2>
        <p className="text-sm">{t('Add driving license categories')}</p>
      </div>

      <form className="mt-5 space-y-4">
        <Button
          type="button"
          variant={enabled ? 'default' : 'outline'}
          className="gap-2"
          onClick={handleToggle}
          aria-pressed={enabled}
        >
          <CarFront size={16} />
          {enabled ? t('Included in resume') : t('Add driving license')}
        </Button>

        {enabled && (
          <div className="max-w-md space-y-2">
            <Label htmlFor="driving-license">{t('Categories')}</Label>
            <Input
              id="driving-license"
              name="drivingLicense"
              value={localDrivingLicense}
              onChange={event => setLocalDrivingLicense(event.target.value)}
              onBlur={handleBlur}
              placeholder={t('A2, B, C1')}
              autoComplete="off"
            />
            <p className="text-muted-foreground text-xs">{t('Separate categories with commas')}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default DrivingLicenseForm;
