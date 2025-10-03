'use client';
// components
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Textarea,
  TranslateSection,
} from '@/components';
import { ChevronDown, Plus, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
//hooks
import { useCreateEducation, useDebounce, useDeleteEducation, useGetDocumentById, useUpdateDocument } from '@/hooks';
import { EducationType } from '@/types';

const getToday = () => {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const EducationForm = () => {
  const t = useTranslations('Education');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutate: deleteEducation, isPending: isDeleting } = useDeleteEducation();
  const { mutateAsync: createEducation } = useCreateEducation();

  const [localEducationList, setLocalEducationList] = React.useState<EducationType[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const debouncedEducationList = useDebounce(localEducationList, 500);

  React.useEffect(() => {
    if (resumeInfo?.educations && !isInitialized) {
      setLocalEducationList(resumeInfo.educations);
      setIsInitialized(true);
    }
  }, [resumeInfo?.educations, isInitialized]);

  React.useEffect(() => {
    if (isInitialized && debouncedEducationList.length >= 0) {
      const sanitized = debouncedEducationList.map((edu: EducationType) => ({
        ...edu,
        endDate: edu.currentlyStudying ? null : edu.endDate,
        yearsOnly: edu.yearsOnly ?? false,
      }));
      setResumeInfo({ education: sanitized });
    }
  }, [debouncedEducationList, isInitialized]);

  const handleChange = (e: { target: { name: string; value: string } }, index: number) => {
    const { name, value } = e.target;
    setLocalEducationList((prev: EducationType[]) =>
      prev.map((item, idx) => (idx === index ? { ...item, [name]: value } : item))
    );
  };

  const handleEducationTypeChange = (type: 'university' | 'course', index: number) => {
    setLocalEducationList((prev: EducationType[]) =>
      prev.map((item, idx) => (idx === index ? { ...item, educationType: type } : item))
    );
  };

  const addNewEducation = async () => {
    const newEdu = {
      educationType: 'university' as const,
      universityName: '',
      startDate: getToday(),
      endDate: getToday(),
      degree: '',
      major: '',
      description: '',
      yearsOnly: false,
      hideDates: false,
    };
    const created = await createEducation(newEdu);
    setLocalEducationList((prev: EducationType[]) => [...prev, created]);
  };

  const removeEducation = (id?: number) => {
    if (!id) return;
    deleteEducation({ educationId: id });
    setLocalEducationList((prev: EducationType[]) => prev.filter(item => item.id !== id));
  };

  const handleAddEducation = useCallback(() => {
    void addNewEducation();
  }, [addNewEducation]);

  const handleTranslate = useCallback((translatedText: string, index: number) => {
    setLocalEducationList(prev =>
      prev.map((edu, idx) => (idx === index ? { ...edu, description: translatedText } : edu))
    );
  }, []);

  const educations = localEducationList;

  return (
    <div>
      <div className="w-full">
        <h2 className="text-lg font-bold">{t('Education')}</h2>
        <p className="text-sm">{t('Add your education details')}</p>
      </div>
      <form>
        <div className="my-3 h-auto w-full divide-y-[1px] rounded-md border px-3 pb-4">
          {educations.length === 0 && (
            <Button
              className="mt-1 gap-1 border-primary/50 text-primary"
              variant="outline"
              type="button"
              onClick={handleAddEducation}
            >
              <Plus size="15px" />
              {t('Add Education')}
            </Button>
          )}
          {educations.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative mb-5 grid grid-cols-2 gap-3 pt-4">
                {educations.length > 1 && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={isDeleting}
                    className="absolute -right-5 -top-3 size-[20px] rounded-full !bg-black text-center text-white dark:!bg-gray-600"
                    size="icon"
                    onClick={() => removeEducation(item.id)}
                  >
                    <X size="13px" />
                  </Button>
                )}

                <div className="col-span-2">
                  <Label className="text-sm">{t('Education Type')}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {item?.educationType === 'course' ? t('Course') : t('University')}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleEducationTypeChange('university', index)}>
                        {t('University')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEducationTypeChange('course', index)}>
                        {t('Course')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="col-span-2">
                  <Label className="text-sm">
                    {item?.educationType === 'course' ? t('Institution Name') : t('University Name')}
                  </Label>
                  <Input
                    name="universityName"
                    placeholder=""
                    required
                    value={item?.universityName || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">{item?.educationType === 'course' ? t('Course Name') : t('Degree')}</Label>
                  <Input
                    name="degree"
                    placeholder=""
                    required
                    value={item?.degree || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                {item?.educationType !== 'course' && (
                  <div>
                    <Label className="text-sm">{t('Major')}</Label>
                    <Input
                      name="major"
                      placeholder=""
                      value={item?.major || ''}
                      onChange={e => handleChange(e, index)}
                    />
                  </div>
                )}
                {!item?.hideDates && (
                  <>
                    <div className={item?.educationType === 'course' ? 'col-span-1' : ''}>
                      <Label className="text-sm">{t('Start Date')}</Label>
                      <Input
                        type="date"
                        name="startDate"
                        value={item?.startDate || ''}
                        onChange={e => handleChange(e, index)}
                      />
                    </div>
                    <div className={item?.educationType === 'course' ? 'col-span-1' : ''}>
                      <Label className="text-sm">{t('End Date')}</Label>
                      <Input
                        type="date"
                        name="endDate"
                        value={item?.endDate || ''}
                        onChange={e => handleChange(e, index)}
                      />
                    </div>
                  </>
                )}
                <div className="col-span-2 flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`hide-dates-checkbox-${index}`}
                      checked={item?.hideDates || false}
                      onChange={e => {
                        setLocalEducationList(prev =>
                          prev.map((edu, idx) => (idx === index ? { ...edu, hideDates: e.target.checked } : edu))
                        );
                      }}
                    />
                    <Label htmlFor={`hide-dates-checkbox-${index}`} className="ml-2 cursor-pointer select-none text-xs">
                      {t('Hide Dates')}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`years-only-checkbox-${index}`}
                      checked={item?.yearsOnly || false}
                      onChange={e => {
                        setLocalEducationList(prev =>
                          prev.map((edu, idx) => (idx === index ? { ...edu, yearsOnly: e.target.checked } : edu))
                        );
                      }}
                    />
                    <Label htmlFor={`years-only-checkbox-${index}`} className="ml-2 cursor-pointer select-none text-xs">
                      {t('Years only')}
                    </Label>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">{t('Description')}</Label>
                  <Textarea name="description" value={item?.description || ''} onChange={e => handleChange(e, index)} />
                  <div className="mt-3 flex justify-end">
                    <TranslateSection
                      onTranslate={translatedText => handleTranslate(translatedText, index)}
                      currentText={item?.description || ''}
                      placeholder={t('Enter target language')}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {educations.length > 0 && (
            <div className="flex justify-center">
              <Button
                className="mt-1 gap-1 border-primary/50 text-primary"
                variant="outline"
                type="button"
                onClick={handleAddEducation}
              >
                <Plus size="15px" />
                {t('Add More Education')}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default EducationForm;
