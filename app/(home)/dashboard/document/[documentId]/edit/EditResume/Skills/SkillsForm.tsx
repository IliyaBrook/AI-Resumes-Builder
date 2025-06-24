'use client';
import React, { useEffect, useCallback } from 'react';
// components
import { Label, Input, Button } from '@/components';
import { Rating } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { SkillType } from '@/types/resume.type';
// hooks
import {
  useDebounce,
  useUpdateSkill,
  useCreateSkill,
  useDeleteSkill,
  useUpdateDocument,
  useGetDocumentById,
} from '@/hooks';

const SkillsForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteSkill();
  const { mutateAsync: createSkill } = useCreateSkill();
  const { mutate: updateSkill } = useUpdateSkill();

  const [format, setFormat] = React.useState<'default' | 'byCategory'>('default');
  const [skillsList, setSkillsList] = React.useState<SkillType[]>([]);
  const [hideRating, setHideRating] = React.useState<boolean>(false);

  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');

  const [localSkillInputs, setLocalSkillInputs] = React.useState<Record<number, string>>({});
  const [localCategoryInputs, setLocalCategoryInputs] = React.useState<Record<number, string>>({});

  const debouncedSkillInputs = useDebounce(localSkillInputs, 500);
  const debouncedCategoryInputs = useDebounce(localCategoryInputs, 500);

  const skillsByCategory = React.useMemo(() => {
    if (format !== 'byCategory') return {};
    const grouped: Record<string, SkillType[]> = {};
    (resumeInfo?.skills || []).forEach((skill: SkillType) => {
      const category = skill.category || 'General';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        ...skill,
        hideRating: !!skill.hideRating,
        category: skill.category || undefined,
      });
    });

    const sortedGrouped: Record<string, SkillType[]> = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const aMinOrder = Math.min(...grouped[a].map((skill: SkillType) => skill.order || 0));
        const bMinOrder = Math.min(...grouped[b].map((skill: SkillType) => skill.order || 0));
        return aMinOrder - bMinOrder;
      })
      .forEach(categoryName => {
        sortedGrouped[categoryName] = grouped[categoryName].sort((a, b) => (a.order || 0) - (b.order || 0));
      });

    return sortedGrouped;
  }, [resumeInfo?.skills, format]);

  useEffect(() => {
    if (
      resumeInfo?.skillsDisplayFormat &&
      (resumeInfo.skillsDisplayFormat === 'default' || resumeInfo.skillsDisplayFormat === 'byCategory')
    ) {
      setFormat(resumeInfo.skillsDisplayFormat);
    }
  }, [resumeInfo?.skillsDisplayFormat]);

  useEffect(() => {
    if (resumeInfo?.skills) {
      setSkillsList(
        resumeInfo.skills.map((skill: SkillType) => ({
          ...skill,
          hideRating: !!skill.hideRating,
          category: skill.category || '',
        }))
      );

      if (resumeInfo.skills.length > 0) {
        setHideRating(!!resumeInfo.skills[0].hideRating);
      }

      setLocalSkillInputs(prev => {
        const newInputs: Record<number, string> = {};
        resumeInfo.skills.forEach((skill: SkillType) => {
          if (skill.id) {
            newInputs[skill.id] = prev[skill.id] !== undefined ? prev[skill.id] : skill.name || '';
          }
        });
        return newInputs;
      });

      setLocalCategoryInputs(prev => {
        const newInputs: Record<number, string> = {};
        resumeInfo.skills.forEach((skill: SkillType) => {
          if (skill.id) {
            newInputs[skill.id] = prev[skill.id] !== undefined ? prev[skill.id] : skill.category || '';
          }
        });
        return newInputs;
      });
    }
  }, [resumeInfo?.skills?.length]);

  useEffect(() => {
    Object.entries(debouncedSkillInputs).forEach(([skillId, name]) => {
      const currentSkill = resumeInfo?.skills?.find((s: SkillType) => s.id === Number(skillId));
      if (name !== undefined && currentSkill && currentSkill.name !== name) {
        updateSkill({ skillId: Number(skillId), data: { name } });
      }
    });
  }, [debouncedSkillInputs]);

  useEffect(() => {
    Object.entries(debouncedCategoryInputs).forEach(([skillId, category]) => {
      const currentSkill = resumeInfo?.skills?.find((s: SkillType) => s.id === Number(skillId));
      if (category !== undefined && currentSkill && currentSkill.category !== category) {
        updateSkill({ skillId: Number(skillId), data: { category } });
      }
    });
  }, [debouncedCategoryInputs]);

  const handleFormatChange = (newFormat: 'default' | 'byCategory') => {
    setFormat(newFormat);
    setResumeInfo({ skillsDisplayFormat: newFormat });
  };

  const handleChange = (value: string | number, name: string, index: number) => {
    const skill = skillsList[index];
    if (skill?.id && name === 'name' && typeof value === 'string') {
      setLocalSkillInputs(prev => ({ ...prev, [skill.id!]: value }));
    } else {
      setSkillsList(prevState => {
        const newSkillList = [...prevState];
        newSkillList[index] = {
          ...newSkillList[index],
          [name]: value,
        };
        return newSkillList;
      });

      if (skill?.id && name === 'rating') {
        updateSkill({ skillId: skill.id, data: { rating: value as number } });
      }
    }
  };

  const addNewSkill = async () => {
    const newSkill = {
      name: '',
      rating: 0,
      hideRating: hideRating,
      order: skillsList.length,
      category: '',
    };
    const created = await createSkill(newSkill);
    setSkillsList(prev => [...prev, { ...created, hideRating: !!created.hideRating }]);

    if (created.id) {
      setLocalSkillInputs(prev => ({
        ...prev,
        [created.id!]: created.name || '',
      }));
      setLocalCategoryInputs(prev => ({
        ...prev,
        [created.id!]: created.category || '',
      }));
    }
  };

  const removeSkill = (id?: number) => {
    if (id) {
      deleteSkill({ skillId: id });
      setLocalSkillInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });
      setLocalCategoryInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });
    } else {
      setSkillsList(prev => prev.filter(item => item.id !== id));
    }
  };

  const moveSkill = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= skillsList.length) return;
    setSkillsList(prev => {
      const newSkills = [...prev];
      const [moved] = newSkills.splice(fromIndex, 1);
      newSkills.splice(toIndex, 0, moved);
      return newSkills.map((skill, idx) => ({ ...skill, order: idx }));
    });
  };

  const handleAddSkillToCategory = async (category: string) => {
    const newSkill = {
      name: '',
      rating: 0,
      hideRating: false,
      order: 0,
      category: category,
    };
    const created = await createSkill(newSkill);

    if (created.id) {
      setLocalSkillInputs(prev => ({
        ...prev,
        [created.id!]: created.name || '',
      }));
      setLocalCategoryInputs(prev => ({
        ...prev,
        [created.id!]: created.category || category,
      }));
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
    const skillsInCategory = resumeInfo?.skills?.filter((skill: SkillType) => skill.category === categoryName) || [];
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

    const skillsInCategory = resumeInfo?.skills?.filter((skill: SkillType) => skill.category === editingCategory) || [];

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

  const moveCategorySkills = (fromCategoryName: string, toCategoryName: string) => {
    if (!resumeInfo?.skills) return;

    const fromSkills = resumeInfo.skills.filter((skill: SkillType) => skill.category === fromCategoryName);
    const toSkills = resumeInfo.skills.filter((skill: SkillType) => skill.category === toCategoryName);

    if (fromSkills.length === 0) return;

    const toMinOrder = Math.min(...toSkills.map((skill: SkillType) => skill.order || 0));

    const insertPosition = toMinOrder - 1;

    fromSkills.forEach((skill: SkillType, idx: number) => {
      if (skill.id) {
        updateSkill({
          skillId: skill.id,
          data: {
            category: toCategoryName,
            order: insertPosition - idx,
          },
        });
      }
    });
  };

  const handleMoveCategoryUp = (categoryName: string) => {
    const sortedCategories = Object.keys(skillsByCategory);
    const currentIndex = sortedCategories.indexOf(categoryName);
    if (currentIndex > 0) {
      moveCategorySkills(categoryName, sortedCategories[currentIndex - 1]);
    }
  };

  const handleMoveCategoryDown = (categoryName: string) => {
    const sortedCategories = Object.keys(skillsByCategory);
    const currentIndex = sortedCategories.indexOf(categoryName);
    if (currentIndex < sortedCategories.length - 1) {
      moveCategorySkills(categoryName, sortedCategories[currentIndex + 1]);
    }
  };

  const getSkillValue = (skill: SkillType, field: keyof SkillType) => {
    return skill[field];
  };

  // Wrapper functions for onClick handlers
  const handleAddSkillClick = useCallback(() => {
    void addNewSkill();
  }, [addNewSkill]);

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
    <div>
      <div className="mb-2 flex w-full items-center gap-4">
        <h2 className="text-lg font-bold">Skills</h2>
        <select
          className="rounded border px-2 py-1 text-sm"
          value={format}
          onChange={e => handleFormatChange(e.target.value as 'default' | 'byCategory')}
        >
          <option value="default">Default</option>
          <option value="byCategory">By category</option>
        </select>
      </div>
      <p className="text-sm">Add your skills information</p>
      {format === 'default' && (
        <>
          <div className="mb-2 mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="hideRating"
              checked={hideRating}
              onChange={e => setHideRating(e.target.checked)}
            />
            <label htmlFor="hideRating" className="cursor-pointer select-none text-sm">
              Hide rating
            </label>
          </div>
          <form>
            <div className="my-5 h-auto w-full divide-y-[1px] rounded-md border px-3 pb-4">
              {skillsList.length === 0 && (
                <Button
                  className="mt-1 gap-1 border-primary/50 text-primary"
                  variant="outline"
                  type="button"
                  disabled={isPending}
                  onClick={handleAddSkillClick}
                >
                  <Plus size="15px" />
                  Add More Skills
                </Button>
              )}
              {skillsList.map((item, index) => (
                <div key={item.id || index}>
                  <div className="relative mb-5 flex items-center justify-between gap-3 pt-4">
                    {skillsList.length > 1 && (
                      <div className="absolute -left-8 top-4 flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="size-6"
                          onClick={() => moveSkill(index, index - 1)}
                          disabled={index === 0}
                        >
                          <MoveUp size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="size-6"
                          onClick={() => moveSkill(index, index + 1)}
                          disabled={index === skillsList.length - 1}
                        >
                          <MoveDown size={14} />
                        </Button>
                      </div>
                    )}
                    {skillsList?.length > 1 && (
                      <Button
                        variant="secondary"
                        type="button"
                        className="absolute -right-5 -top-3 size-[20px] rounded-full !bg-black text-center text-white dark:!bg-gray-600"
                        size="icon"
                        disabled={isPending || isDeleting}
                        onClick={() => removeSkill(item.id)}
                      >
                        <X size="13px" />
                      </Button>
                    )}

                    <div className="flex-1">
                      <Label className="text-sm">Name</Label>
                      <Input
                        name="name"
                        placeholder=""
                        required
                        autoComplete="off"
                        value={
                          item.id && localSkillInputs[item.id] !== undefined
                            ? localSkillInputs[item.id]
                            : item.name || ''
                        }
                        onChange={e => handleChange(e.target.value, 'name', index)}
                      />
                    </div>

                    {!hideRating && (
                      <div className="shrink-0 pt-5">
                        <Rating
                          style={{ maxWidth: 120 }}
                          isDisabled={!item.name}
                          value={item?.rating || 0}
                          onChange={(value: number) => handleChange(value, 'rating', index)}
                        />
                      </div>
                    )}
                  </div>

                  {index === skillsList.length - 1 && skillsList.length < 35 && (
                    <Button
                      className="mt-1 gap-1 border-primary/50 text-primary"
                      variant="outline"
                      type="button"
                      disabled={isPending}
                      onClick={handleAddSkillClick}
                    >
                      <Plus size="15px" />
                      Add More Skills
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </form>
        </>
      )}
      {format === 'byCategory' && (
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
                onClick={() => handleAddSkillToCategoryClick('General')}
              >
                <Plus size="15px" /> Add first skill
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsForm;
