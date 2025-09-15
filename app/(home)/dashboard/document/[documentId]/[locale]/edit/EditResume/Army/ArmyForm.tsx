'use client';
import { RichTextEditor, RichTextEditorRef, TranslateSection } from '@/components';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const ArmyForm = () => {
  const t = useTranslations('Army');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const [localArmyService, setLocalArmyService] = useState('');
  const editorRef = React.useRef<RichTextEditorRef>(null);

  useEffect(() => {
    if (resumeInfo?.armyService) {
      setLocalArmyService(resumeInfo.armyService);
    }
  }, [resumeInfo?.armyService]);

  const handleChange = (value: string) => {
    setLocalArmyService(value);
  };

  const handleBlur = useCallback(
    (value: string) => {
      if (value !== resumeInfo?.armyService) {
        setResumeInfo({ armyService: value });
      }
    },
    [resumeInfo?.armyService, setResumeInfo]
  );

  const handleTranslate = useCallback(
    (translatedText: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(translatedText);
      }
      setLocalArmyService(translatedText);
      setResumeInfo({ armyService: translatedText });
    },
    [setResumeInfo]
  );

  return (
    <div>
      <div className="w-full">
        <h2 className="text-lg font-bold">{t('Military Service')}</h2>
        <p className="text-sm">{t('Add military service details')}</p>
      </div>
      <div>
        <form>
          <div className="mt-5 min-h-36">
            <RichTextEditor
              ref={editorRef}
              jobTitle={resumeInfo?.personalInfo?.jobTitle || null}
              initialValue={localArmyService}
              value={localArmyService}
              onEditorChange={handleChange}
              onBlur={handleBlur}
              showBullets={true}
              disabled={false}
              showLineLengthSelector={false}
              resumeLocale={resumeInfo?.locale || undefined}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <TranslateSection
              onTranslate={handleTranslate}
              currentText={localArmyService}
              placeholder={t('Enter target language')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArmyForm;
