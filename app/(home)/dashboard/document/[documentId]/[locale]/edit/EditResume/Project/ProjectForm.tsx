'use client';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { ProjectType } from '@/types';
import { useTranslations } from 'next-intl';
import { useCreateProject, useDeleteProject, useUpdateDocument, useGetDocumentById } from '@/hooks';
import { RichTextEditor, Label, Input, Button, TranslateSection } from '@/components';

const ProjectForm = () => {
  const t = useTranslations('Projects');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const { projects = [], projectsSectionTitle = null, locale = undefined } = data?.data ?? {};

  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutate: deleteProject } = useDeleteProject();

  const [sectionTitle, setSectionTitle] = useState(projectsSectionTitle || t('Projects'));
  const [localProjects, setLocalProjects] = useState<ProjectType[]>(projects || []);
  useEffect(() => {
    if (projects && projects.length > 0) {
      setLocalProjects(projects);
    }
  }, [JSON.stringify(projects)]);

  useEffect(() => {
    if (projectsSectionTitle) {
      setSectionTitle(projectsSectionTitle);
    }
  }, [projectsSectionTitle]);

  const handleChange = (e: { target: { name: string; value: string } }, index: number) => {
    const { name, value } = e.target;
    setLocalProjects(prev => prev.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)));
  };

  const handleBlur = () => {
    setResumeInfo({ projects: localProjects });
  };

  const handleSectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSectionTitle(e.target.value);
  };

  const handleSectionTitleBlur = () => {
    setResumeInfo({ projectsSectionTitle: sectionTitle });
  };

  const addNewProject = async () => {
    const newProject = { name: '', url: '', git: '', description: '', order: localProjects.length };
    const created = await createProject(newProject);
    setLocalProjects(prev => [...prev, created]);
  };

  const removeProject = (index: number, id?: number) => {
    if (!id) return;
    deleteProject({ projectId: id });
    setLocalProjects(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveProject = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localProjects.length) return;
    const newProjects = [...localProjects];
    const [movedItem] = newProjects.splice(fromIndex, 1);
    newProjects.splice(toIndex, 0, movedItem);
    const reordered = newProjects.map((proj, idx) => ({ ...proj, order: idx }));
    setLocalProjects(reordered);
    setResumeInfo({ projects: reordered });
  };

  const handleTranslate = (translatedText: string, index: number) => {
    setLocalProjects(prev =>
      prev.map((proj, idx) => (idx === index ? { ...proj, description: translatedText } : proj))
    );
  };

  const handleAddProject = useCallback(() => {
    void addNewProject();
  }, [addNewProject]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {localProjects.length > 1 && (
          <div className="text-muted-foreground text-sm">{t('Use arrows to reorder experiences')}</div>
        )}
      </div>
      <div className="mb-2 flex w-full items-center gap-2">
        <Input
          className="flex-1 text-lg font-bold"
          value={sectionTitle}
          onChange={handleSectionTitleChange}
          onBlur={handleSectionTitleBlur}
          aria-label={t('Section title')}
        />
      </div>
      <form>
        <div className="my-3 h-auto w-full divide-y-[1px] rounded-md border px-3 pb-4">
          {localProjects.length === 0 && (
            <Button
              className="border-primary/50 text-primary mt-1 gap-1"
              variant="outline"
              type="button"
              onClick={handleAddProject}
            >
              <Plus size="15px" />
              {t('Add More Project')}
            </Button>
          )}
          {localProjects.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative mb-5 grid grid-cols-2 gap-3 pt-4">
                {localProjects.length > 1 && (
                  <div className="absolute top-4 -left-8 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={() => moveProject(index, index - 1)}
                      disabled={index === 0}
                      aria-label={t('Move project up')}
                    >
                      <MoveUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={() => moveProject(index, index + 1)}
                      disabled={index === localProjects.length - 1}
                      aria-label={t('Move project down')}
                    >
                      <MoveDown size={14} />
                    </Button>
                  </div>
                )}
                <Button
                  variant="secondary"
                  type="button"
                  className="absolute -top-3 -right-5 size-[20px] rounded-full !bg-black text-center text-white dark:!bg-gray-600"
                  size="icon"
                  onClick={() => removeProject(index, item.id)}
                  aria-label={t('Remove project')}
                >
                  <X size="13px" />
                </Button>
                <div className="col-span-2">
                  <Label className="text-sm">{t('Project Name')}</Label>
                  <Input
                    aria-label={t('Project name')}
                    name="name"
                    placeholder={t('Project name')}
                    required
                    value={item?.name || ''}
                    onChange={e => handleChange(e, index)}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">{t('Project URL')}</Label>
                  <Input
                    name="url"
                    placeholder="https://project-url.com"
                    value={item?.url || ''}
                    onChange={e => handleChange(e, index)}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">{t('Git Repository')}</Label>
                  <Input
                    name="git"
                    placeholder="https://github.com/user/repo"
                    value={item?.git || ''}
                    onChange={e => handleChange(e, index)}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="col-span-2 mt-1">
                  <Label className="text-sm">{t('Description')}</Label>
                  <RichTextEditor
                    improve_formatting_options={{ list: false }}
                    value={item?.description || ''}
                    onEditorChange={val => {
                      handleChange({ target: { name: 'description', value: val } }, index);
                    }}
                    onBlur={handleBlur}
                    placeholder={t('Project description')}
                    resumeLocale={locale || ''}
                  />
                  <div className="mt-3 flex justify-end">
                    <TranslateSection
                      onTranslate={translatedText => {
                        handleTranslate(translatedText, index);
                        handleBlur();
                      }}
                      currentText={item?.description || ''}
                      placeholder={t('Enter target language')}
                    />
                  </div>
                </div>
              </div>
              {index === localProjects.length - 1 && localProjects.length < 10 && (
                <Button
                  className="border-primary/50 text-primary mt-1 gap-1"
                  variant="outline"
                  type="button"
                  onClick={handleAddProject}
                >
                  <Plus size="15px" />
                  {t('Add More Project')}
                </Button>
              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
