'use client';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';
import { LanguageType } from '@/types';
// components
import { Label, Input, Button } from '@/components';
//hooks
import { useDeleteLanguage, useUpdateDocument, useGetDocumentById, useDebounce } from '@/hooks';

const LANGUAGE_LEVELS = [
  { value: '', label: 'Do not specify' },
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper-Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficient' },
  { value: 'Native', label: 'Native' },
];

const LanguageForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutate: deleteLanguage } = useDeleteLanguage();

  const [sectionTitle, setSectionTitle] = React.useState(resumeInfo?.languagesSectionTitle || 'Languages');
  const [localLanguages, setLocalLanguages] = React.useState<LanguageType[]>(resumeInfo?.languages || []);
  const debouncedSectionTitle = useDebounce(sectionTitle, 500);

  React.useEffect(() => {
    if (debouncedSectionTitle && debouncedSectionTitle !== resumeInfo?.languagesSectionTitle) {
      setResumeInfo({ languagesSectionTitle: debouncedSectionTitle });
    }
  }, [debouncedSectionTitle]);

  const handleChange = (e: { target: { name: string; value: string } }, index: number) => {
    const { name, value } = e.target;
    setLocalLanguages(prev => prev.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)));
  };

  const handleLevelChange = (value: string, index: number) => {
    setLocalLanguages(prev => prev.map((item, idx) => (idx === index ? { ...item, level: value } : item)));
  };

  const addNewLanguage = () => {
    setLocalLanguages(prev => [...prev, { name: '', level: '', order: prev.length }]);
  };

  const removeLanguage = (index: number, id?: number) => {
    if (id) {
      deleteLanguage({ languageId: id });
    }
    setLocalLanguages(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveLanguage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localLanguages.length) return;
    setLocalLanguages(prev => {
      const newLanguages = [...prev];
      const [movedItem] = newLanguages.splice(fromIndex, 1);
      newLanguages.splice(toIndex, 0, movedItem);
      return newLanguages.map((lang, idx) => ({ ...lang, order: idx }));
    });
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {localLanguages.length > 1 && (
          <div className="text-sm text-muted-foreground">Use arrows to reorder languages</div>
        )}
      </div>
      <div className="mb-2 flex w-full items-center gap-2">
        <Input
          className="flex-1 text-lg font-bold"
          value={sectionTitle}
          onChange={e => setSectionTitle(e.target.value)}
        />
      </div>
      <form>
        <div className="my-3 h-auto w-full divide-y-[1px] rounded-md border px-3 pb-4">
          {localLanguages.length === 0 && (
            <Button
              className="mt-1 gap-1 border-primary/50 text-primary"
              variant="outline"
              type="button"
              onClick={addNewLanguage}
            >
              <Plus size="15px" />
              Add Language
            </Button>
          )}
          {localLanguages.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative mb-5 grid grid-cols-2 gap-3 pt-4">
                {localLanguages.length > 1 && (
                  <div className="absolute -left-8 top-4 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={() => moveLanguage(index, index - 1)}
                      disabled={index === 0}
                    >
                      <MoveUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={() => moveLanguage(index, index + 1)}
                      disabled={index === localLanguages.length - 1}
                    >
                      <MoveDown size={14} />
                    </Button>
                  </div>
                )}
                <Button
                  variant="secondary"
                  type="button"
                  className="absolute -right-5 -top-3 size-[20px] rounded-full !bg-black text-center text-white dark:!bg-gray-600"
                  size="icon"
                  onClick={() => removeLanguage(index, item.id)}
                >
                  <X size="13px" />
                </Button>
                <div>
                  <Label className="text-sm">Language</Label>
                  <Input
                    name="name"
                    placeholder="English, Spanish, etc."
                    required
                    value={item?.name || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Proficiency Level</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={item?.level || ''}
                    onChange={e => handleLevelChange(e.target.value, index)}
                  >
                    {LANGUAGE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {index === localLanguages.length - 1 && localLanguages.length < 20 && (
                <Button
                  className="mt-1 gap-1 border-primary/50 text-primary"
                  variant="outline"
                  type="button"
                  onClick={addNewLanguage}
                >
                  <Plus size="15px" />
                  Add Language
                </Button>
              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default LanguageForm;
