'use client';
import React, { useEffect, useCallback, useMemo } from 'react';
import { Input, Button } from '@/components';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { ResumeDataType, SkillType } from '@/types/resume.type';
// import { useDebounce, useCreateSkill, useDeleteSkill } from '@/hooks';
// import { useSkillInputHandler } from './hooks';

interface CategorySkillsFormProps {
  resumeInfo: ResumeDataType | undefined;
}

// for test we remove this later
const toJsonString = (value: any) => JSON.stringify(value, null);

const CategorySkillsForm: React.FC<CategorySkillsFormProps> = ({ resumeInfo }) => {
  // COMMENTED OUT - Database operations for testing local logic
  // const { mutate: deleteSkill } = useDeleteSkill();
  // const { mutateAsync: createSkill, isPending: isCreating } = useCreateSkill();

  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');
  const [localSkillInputs, setLocalSkillInputs] = React.useState<Record<number, string>>({});
  const [localCategoryInputs, setLocalCategoryInputs] = React.useState<Record<number, string>>({});

  // COMMENTED OUT - Database sync for testing local logic
  // const debouncedSkillInputs = useDebounce(localSkillInputs, 500);
  // const debouncedCategoryInputs = useDebounce(localCategoryInputs, 500);

  // COMMENTED OUT - Database updates for testing local logic
  // const { updateSkill } = useSkillInputHandler({
  //   debouncedSkillInputs,
  //   debouncedCategoryInputs,
  //   resumeInfo,
  // });

  // LOCAL STATE for testing - simulating skills data
  const [localSkillsData, setLocalSkillsData] = React.useState<SkillType[]>([]);

  // Initialize local data from resumeInfo once
  useEffect(() => {
    if (resumeInfo?.skills && localSkillsData.length === 0) {
      setLocalSkillsData(resumeInfo.skills.map(skill => ({ ...skill })));
    }
  }, [resumeInfo?.skills, localSkillsData.length]);

  // Group skills by category with proper sorting - USING LOCAL DATA
  const { skillsByCategory, sortedCategoryKeys } = useMemo(() => {
    console.log('LOCAL TEST - Recalculating skillsByCategory, localSkillsData:', toJsonString(localSkillsData));

    if (!localSkillsData.length) return { skillsByCategory: {}, sortedCategoryKeys: [] };

    const grouped: Record<string, SkillType[]> = {};
    localSkillsData.forEach((skill: SkillType) => {
      const category = skill.category || '';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        ...skill,
        hideRating: !!skill.hideRating,
      });
    });

    console.log('LOCAL TEST - Grouped before sorting:', toJsonString(grouped));

    const categoryKeys = Object.keys(grouped);

    console.log('LOCAL TEST - Category keys before sorting:', toJsonString(categoryKeys));

    const sortedKeys = categoryKeys.sort((a, b) => {
      const aMinOrder =
        grouped[a].length > 0 ? Math.min(...grouped[a].map((skill: SkillType) => skill.categoryOrder || 0)) : 0;
      const bMinOrder =
        grouped[b].length > 0 ? Math.min(...grouped[b].map((skill: SkillType) => skill.categoryOrder || 0)) : 0;

      console.log(`LOCAL TEST - Sorting categories: ${a}(${aMinOrder}) vs ${b}(${bMinOrder})`);
      return aMinOrder - bMinOrder;
    });

    console.log('LOCAL TEST - Sorted category keys:', toJsonString(sortedKeys));

    // Sort skills within each category by skillOrder
    const skillsByCategory: Record<string, SkillType[]> = {};
    sortedKeys.forEach(categoryName => {
      skillsByCategory[categoryName] = grouped[categoryName].sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0));
    });

    console.log('LOCAL TEST - Final sorted grouped:', toJsonString(skillsByCategory));
    console.log('LOCAL TEST - Final sortedCategoryKeys:', toJsonString(sortedKeys));

    return { skillsByCategory, sortedCategoryKeys: sortedKeys };
  }, [localSkillsData]);

  // COMMENTED OUT - Database sync for testing local logic
  // useEffect(() => {
  //   if (resumeInfo?.skills) {
  //     setLocalSkillInputs(prev => {
  //       const newInputs: Record<number, string> = {};
  //       resumeInfo.skills!.forEach((skill: SkillType) => {
  //         if (skill.id) {
  //           newInputs[skill.id] = prev[skill.id] !== undefined ? prev[skill.id] : skill.name || '';
  //         }
  //       });
  //       return newInputs;
  //     });

  //     setLocalCategoryInputs(prev => {
  //       const newInputs: Record<number, string> = {};
  //       resumeInfo.skills!.forEach((skill: SkillType) => {
  //         if (skill.id) {
  //           // Only set if not already set or if it's actually different
  //           const currentValue = prev[skill.id];
  //           const serverValue = skill.category || '';
  //           newInputs[skill.id] = currentValue !== undefined ? currentValue : serverValue;
  //         }
  //       });
  //       return newInputs;
  //     });
  //   }
  // }, [resumeInfo?.skills?.length]);

  // Initialize local inputs from local skills data
  useEffect(() => {
    if (localSkillsData.length > 0) {
      const skillInputs: Record<number, string> = {};
      const categoryInputs: Record<number, string> = {};

      localSkillsData.forEach((skill: SkillType) => {
        if (skill.id) {
          skillInputs[skill.id] = skill.name || '';
          categoryInputs[skill.id] = skill.category || '';
        }
      });

      setLocalSkillInputs(skillInputs);
      setLocalCategoryInputs(categoryInputs);
    }
  }, [localSkillsData.length]);

  const handleAddSkillToCategory = (category: string) => {
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

    // LOCAL TESTING - Create new skill with random ID
    const newSkillId = Math.max(...localSkillsData.map(s => s.id || 0), 0) + 1;
    const newSkill: SkillType = {
      id: newSkillId,
      name: '',
      rating: 0,
      hideRating: false,
      skillOrder: maxSkillOrder + 1,
      categoryOrder: categoryOrder,
      category: category || '',
    };

    console.log('LOCAL TEST - Adding skill:', toJsonString(newSkill));

    // Add to local data
    setLocalSkillsData(prev => [...prev, newSkill]);

    // Add to local inputs
    setLocalSkillInputs(prev => ({
      ...prev,
      [newSkillId]: '',
    }));
    setLocalCategoryInputs(prev => ({
      ...prev,
      [newSkillId]: category || '',
    }));
  };

  const handleRemoveSkillFromCategory = (skillId: number) => {
    console.log('LOCAL TEST - Removing skill:', toJsonString(skillId));

    // Remove from local data
    setLocalSkillsData(prev => prev.filter(skill => skill.id !== skillId));

    // Remove from local inputs
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
    console.log('LOCAL TEST - Skill name change:', skillId, name);

    // Update local data
    setLocalSkillsData(prev => prev.map(skill => (skill.id === skillId ? { ...skill, name } : skill)));

    // Update local inputs
    setLocalSkillInputs(prev => ({ ...prev, [skillId]: name }));
  };

  const handleSkillCategoryChange = (skillId: number, category: string) => {
    console.log('LOCAL TEST - Skill category change:', skillId, category);

    // Update local data with new category and categoryOrder
    setLocalSkillsData(prev => {
      const targetCategorySkills = prev.filter(s => s.category === category);
      const newCategoryOrder =
        targetCategorySkills.length > 0 ? Math.max(...targetCategorySkills.map(s => s.categoryOrder || 0)) : 0;

      return prev.map(skill =>
        skill.id === skillId ? { ...skill, category, categoryOrder: newCategoryOrder } : skill
      );
    });

    // Update local inputs
    setLocalCategoryInputs(prev => ({ ...prev, [skillId]: category }));
  };

  const handleRemoveCategory = (categoryName: string) => {
    console.log('LOCAL TEST - Removing category:', categoryName);

    const skillsInCategory = skillsByCategory[categoryName] || [];
    skillsInCategory.forEach((skill: SkillType) => {
      if (skill.id) {
        handleRemoveSkillFromCategory(skill.id);
      }
    });
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;
    handleAddSkillToCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleStartEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleSaveCategoryName = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    console.log('LOCAL TEST - Saving category name:', editingCategory, '->', editCategoryName.trim());

    const skillsInCategory = skillsByCategory[editingCategory] || [];

    // Update local data
    setLocalSkillsData(prev =>
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

  const handleMoveCategoryUp = (categoryName: string) => {
    const sortedCategories = sortedCategoryKeys;
    const currentIndex = sortedCategories.indexOf(categoryName);

    console.log(
      'LOCAL TEST - Moving category up:',
      toJsonString({
        categoryName,
        currentIndex,
        sortedCategories,
        currentSkillsByCategory: skillsByCategory,
      })
    );

    if (currentIndex <= 0) {
      console.log('LOCAL TEST - Cannot move up: already at top or not found');
      return;
    }

    const currentCategorySkills = skillsByCategory[categoryName] || [];
    const targetCategoryName = sortedCategories[currentIndex - 1];
    const targetCategorySkills = skillsByCategory[targetCategoryName] || [];

    console.log(
      'LOCAL TEST - Move up details:',
      toJsonString({
        currentCategorySkills: currentCategorySkills.map(s => ({
          id: s.id,
          name: s.name,
          categoryOrder: s.categoryOrder,
        })),
        targetCategoryName,
        targetCategorySkills: targetCategorySkills.map(s => ({
          id: s.id,
          name: s.name,
          categoryOrder: s.categoryOrder,
        })),
      })
    );

    if (currentCategorySkills.length === 0) {
      console.log('LOCAL TEST - Cannot move up: no skills in current category');
      return;
    }

    // Get the target category order (the category we want to move above)
    const targetCategoryOrder =
      targetCategorySkills.length > 0
        ? Math.min(...targetCategorySkills.map((skill: SkillType) => skill.categoryOrder || 0))
        : 0;

    const newCategoryOrder = targetCategoryOrder - 1;

    console.log(
      'LOCAL TEST - Move up calculation:',
      toJsonString({
        targetCategoryOrder,
        newCategoryOrder,
      })
    );

    // Update local data - all skills in the current category get new categoryOrder
    setLocalSkillsData(prev => {
      const updated = prev.map(skill =>
        skill.category === categoryName ? { ...skill, categoryOrder: newCategoryOrder } : skill
      );

      console.log('LOCAL TEST - Updated localSkillsData after move up:', updated);
      return updated;
    });
  };

  const handleMoveCategoryDown = (categoryName: string) => {
    const sortedCategories = sortedCategoryKeys;
    const currentIndex = sortedCategories.indexOf(categoryName);

    console.log(
      'LOCAL TEST - Moving category down:',
      toJsonString({
        categoryName,
        currentIndex,
        sortedCategories,
        maxIndex: sortedCategories.length - 1,
      })
    );

    if (currentIndex >= sortedCategories.length - 1) {
      console.log('LOCAL TEST - Cannot move down: already at bottom or not found');
      return;
    }

    const currentCategorySkills = skillsByCategory[categoryName] || [];
    const targetCategoryName = sortedCategories[currentIndex + 1];
    const targetCategorySkills = skillsByCategory[targetCategoryName] || [];

    console.log(
      'LOCAL TEST - Move down details:',
      toJsonString({
        currentCategorySkills: currentCategorySkills.map(s => ({
          id: s.id,
          name: s.name,
          categoryOrder: s.categoryOrder,
        })),
        targetCategoryName,
        targetCategorySkills: targetCategorySkills.map(s => ({
          id: s.id,
          name: s.name,
          categoryOrder: s.categoryOrder,
        })),
      })
    );

    if (currentCategorySkills.length === 0) {
      console.log('LOCAL TEST - Cannot move down: no skills in current category');
      return;
    }

    // Get the target category order (the category we want to move below)
    const targetCategoryOrder =
      targetCategorySkills.length > 0
        ? Math.max(...targetCategorySkills.map((skill: SkillType) => skill.categoryOrder || 0))
        : 0;

    const newCategoryOrder = targetCategoryOrder + 1;

    console.log(
      'LOCAL TEST - Move down calculation:',
      toJsonString({
        targetCategoryOrder,
        newCategoryOrder,
      })
    );

    // Update local data - all skills in the current category get new categoryOrder
    setLocalSkillsData(prev => {
      const updated = prev.map(skill =>
        skill.category === categoryName ? { ...skill, categoryOrder: newCategoryOrder } : skill
      );

      console.log('LOCAL TEST - Updated localSkillsData after move down:', toJsonString(updated));
      return updated;
    });
  };

  const getSkillValue = (skill: SkillType, field: keyof SkillType) => {
    return skill[field];
  };

  const handleAddNewCategoryClick = useCallback(() => {
    handleAddNewCategory();
  }, [handleAddNewCategory]);

  const handleAddSkillToCategoryClick = useCallback(
    (categoryName: string) => {
      handleAddSkillToCategory(categoryName);
    },
    [handleAddSkillToCategory]
  );

  const handleSaveCategoryNameClick = useCallback(() => {
    handleSaveCategoryName();
  }, [handleSaveCategoryName]);

  return (
    <div className="mt-4">
      {sortedCategoryKeys.length > 1 && (
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
                  disabled={false}
                >
                  <Plus size="15px" /> Add skill
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
            disabled={false}
          >
            <Plus size="15px" /> Add first skill
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategorySkillsForm;
