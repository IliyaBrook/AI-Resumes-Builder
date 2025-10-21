'use client';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Button, Input } from '@/components';
import { MoveDown, MoveUp, Plus, X } from 'lucide-react';
import { DocumentType, SkillType } from '@/types';
import { useCreateSkill, useDebounce, useDeleteSkill } from '@/hooks';
import { useSkillInputHandler, groupSkillsByCategory } from './utils';
import { QueryObserverResult, RefetchOptions } from '@tanstack/query-core';
import { useTranslations } from 'next-intl';

interface CategorySkillsFormProps {
  resumeInfo: DocumentType | undefined;
  refetchResumeInfo: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      {
        data: any;
        success: any;
      },
      Error
    >
  >;
}

const CategorySkillsForm: React.FC<CategorySkillsFormProps> = ({ resumeInfo, refetchResumeInfo }) => {
  const t = useTranslations('Skills');
  const { mutate: deleteSkill } = useDeleteSkill();
  const { mutateAsync: createSkill, isPending: isCreating } = useCreateSkill();
  const [skills, setSkills] = React.useState<SkillType[] | []>(resumeInfo?.skills || []);

  useEffect(() => {
    refetchResumeInfo()
      .then(result => {
        const skills: SkillType[] = result.data?.data?.skills;
        if (skills?.length > 0) {
          setSkills(skills);
        }
      })
      .catch(console.error);
  }, []);

  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');
  const [localSkillInputs, setLocalSkillInputs] = React.useState<Record<number, string>>({});
  const [localCategoryInputs, setLocalCategoryInputs] = React.useState<Record<number, string>>({});

  const debouncedSkillInputs = useDebounce(localSkillInputs, 500);
  const debouncedCategoryInputs = useDebounce(localCategoryInputs, 500);

  const { updateSkill } = useSkillInputHandler({
    debouncedSkillInputs,
    debouncedCategoryInputs,
    resumeInfo,
  });

  const { skillsByCategory, sortedCategoryKeys } = useMemo(() => {
    return groupSkillsByCategory(skills);
  }, [skills]);

  useEffect(() => {
    if (skills.length > 0) {
      const skillInputs: Record<number, string> = {};
      const categoryInputs: Record<number, string> = {};

      skills.forEach((skill: SkillType) => {
        if (skill.id) {
          skillInputs[skill.id] = skill.name || '';
          categoryInputs[skill.id] = skill.category || '';
        }
      });

      setLocalSkillInputs(skillInputs);
      setLocalCategoryInputs(categoryInputs);
    }
  }, [skills.length]);

  const handleAddSkillToCategory = async (category: string) => {
    const categorySkills = skillsByCategory[category] || [];
    const maxSkillOrder =
      categorySkills.length > 0 ? Math.max(...categorySkills.map(skill => skill.skillOrder || 0)) : -1;

    let categoryOrder;
    if (categorySkills.length > 0) {
      categoryOrder = categorySkills[0].categoryOrder || 0;
    } else {
      const allCategories = Object.keys(skillsByCategory);
      categoryOrder = allCategories.length;
    }

    const newSkill = {
      rating: 0,
      hideRating: false,
      skillOrder: maxSkillOrder + 1,
      categoryOrder: categoryOrder,
      category: category || '',
    };

    try {
      const created = await createSkill(newSkill);
      if (created.id) {
        setSkills(prev => [...prev, created]);

        setLocalSkillInputs(prev => ({
          ...prev,
          [created.id!]: created.name || '',
        }));
        setLocalCategoryInputs(prev => ({
          ...prev,
          [created.id!]: created.category || '',
        }));
      }
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  const handleRemoveSkillFromCategory = (skillId: number) => {
    deleteSkill({ skillId });
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
    setLocalSkillInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[skillId];
      return newInputs;
    });
    setLocalCategoryInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[skillId];
      return newInputs;
    });
  };

  const handleSkillNameChange = (skillId: number, name: string) => {
    setSkills(prev => prev.map(skill => (skill.id === skillId ? { ...skill, name } : skill)));
    setLocalSkillInputs(prev => ({ ...prev, [skillId]: name }));
  };

  const handleSkillCategoryChange = (skillId: number, category: string) => {
    setSkills(prev => {
      const targetCategorySkills = prev.filter(s => s.category === category);
      const newCategoryOrder =
        targetCategorySkills.length > 0 ? Math.max(...targetCategorySkills.map(s => s.categoryOrder || 0)) : 0;

      return prev.map(skill =>
        skill.id === skillId ? { ...skill, category, categoryOrder: newCategoryOrder } : skill
      );
    });
    setLocalCategoryInputs(prev => ({ ...prev, [skillId]: category }));
  };

  const handleRemoveCategory = (categoryName: string) => {
    const skillsInCategory = skillsByCategory[categoryName] || [];
    skillsInCategory.forEach((skill: SkillType) => {
      if (skill.id) {
        handleRemoveSkillFromCategory(skill.id);
      }
    });
  };

  const handleStartEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleSaveCategoryName = () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    const skillsInCategory = skillsByCategory[editingCategory] || [];
    skillsInCategory.forEach(skill => {
      if (skill.id) {
        updateSkill({
          skillId: skill.id,
          data: { category: editCategoryName.trim() },
        });
      }
    });

    setSkills(prev =>
      prev.map(skill => (skill.category === editingCategory ? { ...skill, category: editCategoryName.trim() } : skill))
    );

    // Update local inputs
    skillsInCategory.forEach(skill => {
      if (skill.id) {
        setLocalCategoryInputs(prev => ({ ...prev, [skill.id!]: editCategoryName.trim() }));
      }
    });

    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleMoveCategory = (categoryIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;

    if (toIndex < 0 || toIndex >= sortedCategoryKeys.length) return;

    const newCategoryKeys = [...sortedCategoryKeys];
    const [movedCategory] = newCategoryKeys.splice(categoryIndex, 1);
    newCategoryKeys.splice(toIndex, 0, movedCategory);

    const updatedSkills = skills.map(skill => {
      const newCategoryIndex = newCategoryKeys.indexOf(skill.category || '');
      return { ...skill, categoryOrder: newCategoryIndex };
    });

    setSkills(updatedSkills);

    updatedSkills.forEach(skill => {
      if (skill.id !== undefined) {
        updateSkill({
          skillId: skill.id,
          data: { categoryOrder: skill.categoryOrder },
        });
      }
    });
  };

  const getSkillValue = (skill: SkillType, field: keyof SkillType) => {
    return skill[field];
  };

  const handleAddNewCategoryClick = () => {
    const existingNewCategories = Object.keys(skillsByCategory).filter(name => name.startsWith('new-category'));
    const nextNumber = existingNewCategories.length + 1;
    const newName = existingNewCategories.length === 0 ? 'new-category' : `new-category-${nextNumber}`;
    void handleAddSkillToCategory(newName);
  };

  const handleAddSkillToCategoryClick = useCallback(
    (categoryName: string) => {
      void handleAddSkillToCategory(categoryName);
    },
    [handleAddSkillToCategory]
  );

  const handleSaveCategoryNameClick = useCallback(() => {
    handleSaveCategoryName();
  }, [handleSaveCategoryName]);

  return (
    <div className="mt-4">
      {sortedCategoryKeys.length > 1 && (
        <div className="mb-2 text-sm text-muted-foreground">{t('Use arrows to reorder categories')}</div>
      )}
      <div className="mb-4 flex gap-2">
        <Button type="button" onClick={handleAddNewCategoryClick} variant="outline">
          <Plus size="15px" /> {t('Add category')}
        </Button>
      </div>
      <div className="space-y-6">
        {sortedCategoryKeys.map((categoryName, categoryIndex) => {
          const skills = skillsByCategory[categoryName] || [];
          return (
            <div key={categoryName} className="rounded-md border p-3">
              <div className="relative mb-2 flex items-center gap-2">
                {sortedCategoryKeys.length > 1 && (
                  <div className="absolute -left-8 top-0 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={() => handleMoveCategory(categoryIndex, 'up')}
                      disabled={categoryIndex === 0}
                    >
                      <MoveUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-6"
                      onClick={() => handleMoveCategory(categoryIndex, 'down')}
                      disabled={categoryIndex === sortedCategoryKeys.length - 1}
                    >
                      <MoveDown size={14} />
                    </Button>
                  </div>
                )}
                {editingCategory === categoryName ? (
                  <>
                    <Input
                      value={editCategoryName}
                      onChange={e => setEditCategoryName(e.target.value)}
                      className="w-48 font-semibold"
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveCategoryNameClick();
                        if (e.key === 'Escape') handleCancelEditCategory();
                      }}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveCategoryNameClick}
                      disabled={!editCategoryName.trim()}
                    >
                      {t('Save')}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={handleCancelEditCategory}>
                      {t('Cancel')}
                    </Button>
                  </>
                ) : (
                  <>
                    <h3
                      className="cursor-pointer text-lg font-semibold hover:text-blue-600"
                      onClick={() => handleStartEditCategory(categoryName)}
                      title={t('Click to edit category name')}
                    >
                      {categoryName}
                    </h3>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveCategory(categoryName)}
                      title={t('Delete category and all skills')}
                    >
                      <X size="15px" />
                    </Button>
                  </>
                )}
              </div>
              <div className="space-y-2">
                {skills.map(skill => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <Input
                      value={
                        localSkillInputs[skill.id!] !== undefined
                          ? localSkillInputs[skill.id!]
                          : (getSkillValue(skill, 'name') as string) || ''
                      }
                      onChange={e => skill.id && handleSkillNameChange(skill.id, e.target.value)}
                      onBlur={e => {
                        if (skill.id && e.target.value.trim()) {
                          updateSkill({
                            skillId: skill.id,
                            data: { name: e.target.value.trim() },
                          });
                        }
                      }}
                      placeholder={t('Skill name')}
                      className="w-64"
                    />
                    <select
                      value={
                        localCategoryInputs[skill.id!] !== undefined
                          ? localCategoryInputs[skill.id!]
                          : (getSkillValue(skill, 'category') as string) || categoryName
                      }
                      onChange={e => skill.id && handleSkillCategoryChange(skill.id, e.target.value)}
                      className="rounded border px-1 py-0.5 text-xs"
                    >
                      {Object.keys(skillsByCategory).map(catName => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => skill.id && handleRemoveSkillFromCategory(skill.id)}
                    >
                      <X size="13px" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 gap-1"
                  onClick={() => handleAddSkillToCategoryClick(categoryName)}
                  disabled={isCreating}
                >
                  <Plus size="15px" /> {t('Add skill')}
                </Button>
              </div>
            </div>
          );
        })}
        {sortedCategoryKeys.length === 0 && (
          <Button
            type="button"
            variant="outline"
            className="gap-1"
            onClick={() => handleAddSkillToCategoryClick('')}
            disabled={isCreating}
          >
            <Plus size="15px" /> {t('Add first skill')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategorySkillsForm;
