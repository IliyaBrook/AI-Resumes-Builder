'use client';
import React, { useEffect, useCallback, useMemo } from 'react';
import { Input, Button } from '@/components';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { ResumeDataType, SkillType } from '@/types/resume.type';
import { useDebounce, useCreateSkill, useDeleteSkill } from '@/hooks';
import { useSkillInputHandler } from './hooks';

interface CategorySkillsFormProps {
  resumeInfo: ResumeDataType | undefined;
}

const CategorySkillsForm: React.FC<CategorySkillsFormProps> = ({ resumeInfo }) => {
  const { mutate: deleteSkill } = useDeleteSkill();
  const { mutateAsync: createSkill, isPending: isCreating } = useCreateSkill();

  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');
  const [localSkillInputs, setLocalSkillInputs] = React.useState<Record<number, string>>({});
  const [localCategoryInputs, setLocalCategoryInputs] = React.useState<Record<number, string>>({});

  const debouncedSkillInputs = useDebounce(localSkillInputs, 500);
  const debouncedCategoryInputs = useDebounce(localCategoryInputs, 500);

  // Use the shared hook for handling debounced inputs
  const { updateSkill } = useSkillInputHandler({
    debouncedSkillInputs,
    debouncedCategoryInputs,
    resumeInfo,
  });

  // Group skills by category with proper sorting
  const skillsByCategory = useMemo(() => {
    if (!resumeInfo?.skills) return {};

    const grouped: Record<string, SkillType[]> = {};
    resumeInfo.skills.forEach((skill: SkillType) => {
      const category = skill.category || '';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        ...skill,
        hideRating: !!skill.hideRating,
      });
    });

    // Sort categories by minimum categoryOrder of their skills
    const sortedGrouped: Record<string, SkillType[]> = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const aMinOrder =
          grouped[a].length > 0 ? Math.min(...grouped[a].map((skill: SkillType) => skill.categoryOrder || 0)) : 0;
        const bMinOrder =
          grouped[b].length > 0 ? Math.min(...grouped[b].map((skill: SkillType) => skill.categoryOrder || 0)) : 0;
        return aMinOrder - bMinOrder;
      })
      .forEach(categoryName => {
        // Sort skills within category by skillOrder
        sortedGrouped[categoryName] = grouped[categoryName].sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0));
      });

    return sortedGrouped;
  }, [resumeInfo?.skills]);

  useEffect(() => {
    if (resumeInfo?.skills) {
      setLocalSkillInputs(prev => {
        const newInputs: Record<number, string> = {};
        resumeInfo.skills!.forEach((skill: SkillType) => {
          if (skill.id) {
            newInputs[skill.id] = prev[skill.id] !== undefined ? prev[skill.id] : skill.name || '';
          }
        });
        return newInputs;
      });

      setLocalCategoryInputs(prev => {
        const newInputs: Record<number, string> = {};
        resumeInfo.skills!.forEach((skill: SkillType) => {
          if (skill.id) {
            // Only set if not already set or if it's actually different
            const currentValue = prev[skill.id];
            const serverValue = skill.category || '';
            newInputs[skill.id] = currentValue !== undefined ? currentValue : serverValue;
          }
        });
        return newInputs;
      });
    }
  }, [resumeInfo?.skills?.length]);

  const handleAddSkillToCategory = async (category: string) => {
    const categorySkills = skillsByCategory[category] || [];
    const maxSkillOrder =
      categorySkills.length > 0 ? Math.max(...categorySkills.map(skill => skill.skillOrder || 0)) : -1;

    // For category order, use existing category order if category exists, or create new one
    let categoryOrder = 0;
    if (categorySkills.length > 0) {
      categoryOrder = categorySkills[0].categoryOrder || 0;
    } else {
      // New category gets highest order
      const allCategories = Object.keys(skillsByCategory);
      categoryOrder = allCategories.length;
    }

    const newSkill = {
      name: '',
      rating: 0,
      hideRating: false,
      skillOrder: maxSkillOrder + 1,
      categoryOrder: categoryOrder,
      category: category || '',
    };

    try {
      const created = await createSkill(newSkill);

      if (created.id) {
        // Only set the skill name input, avoid setting category input to prevent loops
        setLocalSkillInputs(prev => ({
          ...prev,
          [created.id!]: created.name || '',
        }));

        // DO NOT set localCategoryInputs here - let it be populated by the useEffect
        // from the server response to avoid triggering infinite loops
      }
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  const handleRemoveSkillFromCategory = (skillId: number) => {
    deleteSkill({ skillId });
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
    setLocalSkillInputs(prev => ({ ...prev, [skillId]: name }));
  };

  const handleSkillCategoryChange = (skillId: number, category: string) => {
    setLocalCategoryInputs(prev => ({ ...prev, [skillId]: category }));
  };

  const handleRemoveCategory = (categoryName: string) => {
    const skillsInCategory = skillsByCategory[categoryName] || [];
    skillsInCategory.forEach((skill: SkillType) => {
      if (skill.id) {
        deleteSkill({ skillId: skill.id });
      }
    });
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    await handleAddSkillToCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleStartEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleSaveCategoryName = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    const skillsInCategory = skillsByCategory[editingCategory] || [];

    for (const skill of skillsInCategory) {
      if (skill.id) {
        updateSkill({
          skillId: skill.id,
          data: { category: editCategoryName.trim() },
        });
      }
    }

    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleMoveCategoryUp = (categoryName: string) => {
    const sortedCategories = Object.keys(skillsByCategory);
    const currentIndex = sortedCategories.indexOf(categoryName);

    if (currentIndex <= 0) return;

    const currentCategorySkills = skillsByCategory[categoryName] || [];
    const targetCategorySkills = skillsByCategory[sortedCategories[currentIndex - 1]] || [];

    if (currentCategorySkills.length === 0) return;

    // Get the target category order (the category we want to move above)
    const targetCategoryOrder =
      targetCategorySkills.length > 0
        ? Math.min(...targetCategorySkills.map((skill: SkillType) => skill.categoryOrder || 0))
        : 0;

    const newCategoryOrder = targetCategoryOrder - 1;

    // Update all skills in the current category to have the new categoryOrder
    currentCategorySkills.forEach((skill: SkillType) => {
      if (skill.id) {
        updateSkill({
          skillId: skill.id,
          data: { categoryOrder: newCategoryOrder },
        });
      }
    });
  };

  const handleMoveCategoryDown = (categoryName: string) => {
    const sortedCategories = Object.keys(skillsByCategory);
    const currentIndex = sortedCategories.indexOf(categoryName);

    if (currentIndex >= sortedCategories.length - 1) return;

    const currentCategorySkills = skillsByCategory[categoryName] || [];
    const targetCategorySkills = skillsByCategory[sortedCategories[currentIndex + 1]] || [];

    if (currentCategorySkills.length === 0) return;

    // Get the target category order (the category we want to move below)
    const targetCategoryOrder =
      targetCategorySkills.length > 0
        ? Math.max(...targetCategorySkills.map((skill: SkillType) => skill.categoryOrder || 0))
        : 0;

    const newCategoryOrder = targetCategoryOrder + 1;

    // Update all skills in the current category to have the new categoryOrder
    currentCategorySkills.forEach((skill: SkillType) => {
      if (skill.id) {
        updateSkill({
          skillId: skill.id,
          data: { categoryOrder: newCategoryOrder },
        });
      }
    });
  };

  const getSkillValue = (skill: SkillType, field: keyof SkillType) => {
    return skill[field];
  };

  const handleAddNewCategoryClick = useCallback(() => {
    void handleAddNewCategory();
  }, [handleAddNewCategory]);

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
      {Object.keys(skillsByCategory).length > 1 && (
        <div className="mb-2 text-sm text-muted-foreground">Use arrows to reorder categories</div>
      )}
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          className="w-48"
        />
        <Button type="button" onClick={handleAddNewCategoryClick} variant="outline">
          <Plus size="15px" /> Add category
        </Button>
      </div>
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([categoryName, skills], categoryIndex) => (
          <div key={categoryName} className="rounded-md border p-3">
            <div className="relative mb-2 flex items-center gap-2">
              {Object.keys(skillsByCategory).length > 1 && (
                <div className="absolute -left-8 top-0 flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-6"
                    onClick={() => handleMoveCategoryUp(categoryName)}
                    disabled={categoryIndex === 0}
                  >
                    <MoveUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-6"
                    onClick={() => handleMoveCategoryDown(categoryName)}
                    disabled={categoryIndex === Object.keys(skillsByCategory).length - 1}
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
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleCancelEditCategory}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <h3
                    className="cursor-pointer text-lg font-semibold hover:text-blue-600"
                    onClick={() => handleStartEditCategory(categoryName)}
                    title="Click to edit category name"
                  >
                    {categoryName}
                  </h3>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveCategory(categoryName)}
                    title="Delete category and all skills"
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
                    placeholder="Skill name"
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
                <Plus size="15px" /> Add skill
              </Button>
            </div>
          </div>
        ))}
        {Object.keys(skillsByCategory).length === 0 && (
          <Button
            type="button"
            variant="outline"
            className="gap-1"
            onClick={() => handleAddSkillToCategoryClick('')}
            disabled={isCreating}
          >
            <Plus size="15px" /> Add first skill
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategorySkillsForm;
