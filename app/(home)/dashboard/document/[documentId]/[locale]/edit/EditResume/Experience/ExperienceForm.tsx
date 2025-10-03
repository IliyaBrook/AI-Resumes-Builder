'use client';
//hooks
import { useDebounce, useUpdateDocument, useGetDocumentById, useDeleteExperience, useCreateExperience } from '@/hooks';
import { ExperienceType, SkillType } from '@/types';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
// components
import { parseAIResult, Label, Input, Button, RichTextEditor, TranslateSection } from '@/components';

const ExperienceForm = () => {
  const t = useTranslations('Experience');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const direction = data?.data?.direction;
  const allSkills = data?.data?.skills ? resumeInfo?.skills?.map((skill: SkillType) => skill.name).join(', ') : '';

  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutate: deleteExperience, isPending: isDeleting } = useDeleteExperience();
  const { mutateAsync: createExperience } = useCreateExperience();

  const [localExperiences, setLocalExperiences] = React.useState<ExperienceType[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const debouncedExperiences = useDebounce(localExperiences, 500);

  React.useEffect(() => {
    if (resumeInfo?.experiences && !isInitialized) {
      setLocalExperiences(resumeInfo.experiences);
      setIsInitialized(true);
    }
  }, [resumeInfo?.experiences, isInitialized]);

  React.useEffect(() => {
    if (isInitialized && debouncedExperiences.length >= 0) {
      const sanitized = debouncedExperiences.map(exp => ({
        ...exp,
        endDate: exp.currentlyWorking ? null : exp.endDate,
        yearsOnly: exp.yearsOnly ?? false,
      }));
      setResumeInfo({ experience: sanitized });
    }
  }, [debouncedExperiences, isInitialized]);

  const handleChange = (e: { target: { name: string; value: string } }, index: number) => {
    const { name, value } = e.target;
    setLocalExperiences(prev => prev.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)));
  };

  const addNewExperience = async () => {
    const newExp = {
      title: '',
      companyName: '',
      city: '',
      state: '',
      startDate: '',
      endDate: '',
      workSummary: '',
      currentlyWorking: false,
      yearsOnly: false,
      order: localExperiences.length,
    };
    const created = await createExperience(newExp);
    setLocalExperiences(prev => [...prev, created]);
  };

  const removeExperience = (id?: number) => {
    if (!id) return;
    deleteExperience({ experienceId: id });
    setLocalExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const handEditor = (value: string, name: string, index: number) => {
    setLocalExperiences(prev => prev.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)));
  };

  const moveExperience = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localExperiences.length) return;

    setLocalExperiences(prev => {
      const newExperiences = [...prev];
      const [movedItem] = newExperiences.splice(fromIndex, 1);
      newExperiences.splice(toIndex, 0, movedItem);

      const result = newExperiences.map((exp, idx) => ({
        ...exp,
        order: idx,
      }));

      return result;
    });
  };

  const experiences = localExperiences;

  const buildExperiencePrompt = (item: ExperienceType, skills: string) => {
    let prompt = `Based on the following experience: Position title: ${
      item.title || ''
    }. Company: ${item.companyName || ''}. Summary: ${item.workSummary || ''}.`;

    if (skills) {
      prompt += ` Available skills: ${skills}.`;
    }

    prompt += ` Generate a <ul> HTML list with {bulletCount} <li> items of achievements relevant ONLY to the Position title mentioned above. Return ONLY HTML string, no JSON/arrays/quotes. Inside <li> highlight key skills with <b> or <strong> tags. Each <li> MUST use at least 90% of the allowed {maxLineLength} characters but never exceed it. IMPORTANT: Each bullet point MUST be about a DIFFERENT project/achievement - avoid repeating the same technologies or projects in multiple bullets. Make each bullet detailed with specific metrics and accomplishments. No job titles, dates, or headings in output. CRITICAL: ONLY mention technologies, frameworks, languages and tools that are EXPLICITLY mentioned in the Position title, Summary, or Available skills - DO NOT invent or add any technologies that aren't mentioned. Make bullets detailed, diverse and engaging.`;
    return prompt;
  };

  const handleAddExperience = useCallback(() => {
    void addNewExperience();
  }, [addNewExperience]);

  const handleTranslate = useCallback((translatedText: string, index: number) => {
    setLocalExperiences(prev =>
      prev.map((exp, idx) => (idx === index ? { ...exp, workSummary: translatedText } : exp))
    );
  }, []);

  return (
    <div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{t('Professional Experience')}</h2>
            <p className="text-sm">{t('Add previous job experience')}</p>
          </div>
          {experiences.length > 1 && (
            <div className="text-sm text-muted-foreground">{t('Use arrows to reorder experiences')}</div>
          )}
        </div>
      </div>
      <form>
        <div className="my-3 h-auto w-full divide-y-[1px] rounded-md border px-3 pb-4">
          {experiences.length === 0 && (
            <Button
              className="mt-1 gap-1 border-primary/50 text-primary"
              variant="outline"
              type="button"
              onClick={handleAddExperience}
            >
              <Plus size="15px" />
              {t('Add More Experience')}
            </Button>
          )}
          {experiences.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative mb-5 grid grid-cols-2 gap-3 pt-4">
                {experiences.length > 1 && (
                  <div className="absolute -left-8 top-4 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveExperience(index, index - 1);
                      }}
                      disabled={index === 0}
                    >
                      <MoveUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveExperience(index, index + 1);
                      }}
                      disabled={index === experiences.length - 1}
                    >
                      <MoveDown size={14} />
                    </Button>
                  </div>
                )}
                {experiences.length > 1 && item.id && (
                  <Button
                    variant="secondary"
                    type="button"
                    className="absolute -right-5 -top-3 size-[20px] rounded-full !bg-black text-center text-white dark:!bg-gray-600"
                    size="icon"
                    disabled={isDeleting}
                    onClick={() => removeExperience(item.id)}
                  >
                    <X size="13px" />
                  </Button>
                )}
                <div>
                  <Label className="text-sm">{t('Position title')}</Label>
                  <Input
                    name="title"
                    placeholder=""
                    required
                    value={item?.title || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">{t('Company Name')}</Label>
                  <Input
                    name="companyName"
                    placeholder=""
                    required
                    value={item?.companyName || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">{t('City')}</Label>
                  <Input
                    name="city"
                    placeholder=""
                    required
                    value={item?.city || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">{t('State')}</Label>
                  <Input
                    name="state"
                    placeholder=""
                    required
                    value={item?.state || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">{t('Start Date')}</Label>
                  <Input
                    name="startDate"
                    type="date"
                    placeholder=""
                    required
                    value={item?.startDate || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-sm">{t('End Date')}</Label>
                    <Input
                      name="endDate"
                      type="date"
                      placeholder=""
                      required={!item?.currentlyWorking}
                      value={item?.endDate || ''}
                      onChange={e => handleChange(e, index)}
                      disabled={item?.currentlyWorking}
                    />
                  </div>
                  <div className="ml-2 mt-6 flex h-full flex-col justify-start gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`present-checkbox-${index}`}
                        checked={item?.currentlyWorking || false}
                        onChange={e => {
                          setLocalExperiences(prev =>
                            prev.map((exp, idx) =>
                              idx === index
                                ? {
                                    ...exp,
                                    currentlyWorking: e.target.checked,
                                    endDate: e.target.checked ? '' : exp.endDate,
                                  }
                                : exp
                            )
                          );
                        }}
                        className={direction === 'rtl' ? 'ml-2' : 'mr-1'}
                      />
                      <Label htmlFor={`present-checkbox-${index}`} className="cursor-pointer select-none text-xs">
                        {t('Present')}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`years-only-checkbox-${index}`}
                        checked={item?.yearsOnly || false}
                        onChange={e => {
                          setLocalExperiences(prev =>
                            prev.map((exp, idx) =>
                              idx === index
                                ? {
                                    ...exp,
                                    yearsOnly: e.target.checked,
                                  }
                                : exp
                            )
                          );
                        }}
                        className={direction === 'rtl' ? 'ml-2' : 'mr-1'}
                      />
                      <Label htmlFor={`years-only-checkbox-${index}`} className="cursor-pointer select-none text-xs">
                        {t('Years Only')}
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 mt-1">
                  <RichTextEditor
                    jobTitle={item.title}
                    initialValue={item.workSummary || ''}
                    onEditorChange={value => {
                      const parsedResult = parseAIResult(value);
                      const stringValue = typeof parsedResult === 'string' ? parsedResult : '';
                      handEditor(stringValue, 'workSummary', index);
                    }}
                    prompt={buildExperiencePrompt(item, allSkills || '')}
                    title={undefined}
                    showBullets={true}
                    showLineLengthSelector={true}
                    resumeLocale={resumeInfo?.locale || undefined}
                  />
                  <div className="mt-3 flex justify-end">
                    <TranslateSection
                      onTranslate={translatedText => handleTranslate(translatedText, index)}
                      currentText={item.workSummary || ''}
                      placeholder={t('Enter target language')}
                    />
                  </div>
                </div>
              </div>
              {index === experiences.length - 1 && experiences.length && (
                <Button
                  className="mt-1 gap-1 border-primary/50 text-primary"
                  variant="outline"
                  type="button"
                  onClick={handleAddExperience}
                >
                  <Plus size="15px" />
                  {t('Add More Experience')}
                </Button>
              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default ExperienceForm;
