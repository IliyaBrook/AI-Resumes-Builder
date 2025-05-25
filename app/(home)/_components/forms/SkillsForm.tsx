import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGetDocument from "@/features/document/use-get-document-by-id";
import useUpdateDocument from "@/features/document/use-update-document";
import useDebounce from "@/hooks/use-debounce";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Plus, X, MoveUp, MoveDown } from "lucide-react";
import { useParams } from "next/navigation";
import { SkillType } from "@/types/resume.type";
import useDeleteSkill from "@/features/document/use-delete-skill";
import useCreateSkill from "@/features/document/use-create-skill";
import useUpdateSkill from "@/features/document/use-update-skill";

const SkillsForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteSkill();
  const { mutateAsync: createSkill } = useCreateSkill();
  const { mutate: updateSkill } = useUpdateSkill();

  const [format, setFormat] = React.useState<'default' | 'byCategory'>('default');
  const [skillsList, setSkillsList] = React.useState<SkillType[]>(() => (resumeInfo?.skills || []).map(skill => ({ ...skill, hideRating: !!skill.hideRating, category: skill.category || "" })));
  const [hideRating, setHideRating] = React.useState<boolean>(!!(resumeInfo?.skills?.[0]?.hideRating));
  const debouncedSkillsList = useDebounce(skillsList, 600);
  const sortedSkillsList = [...skillsList].sort((a, b) => (a.order || 0) - (b.order || 0));

  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState("");
  
  const [pendingUpdates, setPendingUpdates] = React.useState<Map<number, Partial<SkillType>>>(new Map());
  const debouncedPendingUpdates = useDebounce(pendingUpdates, 600);

  const skillsByCategory = React.useMemo(() => {
    if (format !== 'byCategory') return {};
    const grouped: Record<string, SkillType[]> = {};
    (resumeInfo?.skills || []).forEach(skill => {
      const category = skill.category || "General";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        ...skill,
        hideRating: !!skill.hideRating,
        category: skill.category || undefined
      });
    });
    return grouped;
  }, [resumeInfo?.skills, format]);

  useEffect(() => {
    if (format === 'default') {
      const sorted = (resumeInfo?.skills || [])
        .map(item => ({
          ...item,
          name: item.name || "",
          rating: item.rating || 0,
          hideRating: !!item.hideRating,
          order: typeof item.order === "number" ? item.order : 0,
          category: item.category || "",
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setSkillsList(sorted);
      setHideRating(!!(resumeInfo?.skills?.[0]?.hideRating));
    }
  }, [resumeInfo?.skills, format]);
  
  useEffect(() => {
    if (format === 'default') {
      if (!resumeInfo) return;
      if (
        debouncedSkillsList &&
        (JSON.stringify(debouncedSkillsList) !== JSON.stringify((resumeInfo?.skills || []).map(skill => ({ ...skill, hideRating: !!skill.hideRating }))) || hideRating !== !!(resumeInfo?.skills?.[0]?.hideRating))
      ) {
        setResumeInfo({ skills: [...debouncedSkillsList].sort((a, b) => (a.order || 0) - (b.order || 0)).map(skill => ({ ...skill, hideRating: hideRating ? 1 : 0 })) });
      }
    }
  }, [debouncedSkillsList, hideRating, format]);
  
  useEffect(() => {
    if (resumeInfo?.skillsDisplayFormat && (resumeInfo.skillsDisplayFormat === 'default' || resumeInfo.skillsDisplayFormat === 'byCategory')) {
      setFormat(resumeInfo.skillsDisplayFormat);
    }
  }, [resumeInfo?.skillsDisplayFormat]);

  useEffect(() => {
    if (debouncedPendingUpdates.size > 0) {
      debouncedPendingUpdates.forEach((data, skillId) => {
        updateSkill({ skillId, data });
      });
      setPendingUpdates(new Map());
    }
  }, [debouncedPendingUpdates, updateSkill]);

  const handleFormatChange = (newFormat: 'default' | 'byCategory') => {
    setFormat(newFormat);
    setResumeInfo({ skillsDisplayFormat: newFormat });
  };

  const handleChange = (
    value: string | number,
    name: string,
    index: number
  ) => {
    setSkillsList((prevState) => {
      const newSkillList = [...prevState];
      newSkillList[index] = {
        ...newSkillList[index],
        [name]: value,
      };
      return newSkillList;
    });
  };

  const addNewSkill = async () => {
    const newSkill = {
      name: "",
      rating: 0,
      hideRating: hideRating,
      order: skillsList.length,
      category: "",
    };
    const created = await createSkill(newSkill);
    setSkillsList((prev) => [...prev, { ...created, hideRating: !!created.hideRating }]);
  };

  const removeSkill = (id?: number) => {
    if (id) {
      deleteSkill({ skillId: id });
    } else {
      setSkillsList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const moveSkill = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= skillsList.length) return;
    setSkillsList((prev) => {
      const newSkills = [...prev];
      const [moved] = newSkills.splice(fromIndex, 1);
      newSkills.splice(toIndex, 0, moved);
      return newSkills.map((skill, idx) => ({ ...skill, order: idx }));
    });
  };

  const handleAddSkillToCategory = async (category: string) => {
    const newSkill = {
      name: "",
      rating: 0,
      hideRating: false,
      order: 0,
      category: category,
    };
    await createSkill(newSkill);
  };

  const handleRemoveSkillFromCategory = (skillId: number) => {
    deleteSkill({ skillId });
  };

  const handleSkillNameChange = (skillId: number, name: string) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(skillId) || {};
      newMap.set(skillId, { ...existing, name });
      return newMap;
    });
  };

  const handleSkillCategoryChange = (skillId: number, category: string) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(skillId) || {};
      newMap.set(skillId, { ...existing, category });
      return newMap;
    });
  };

  const handleRemoveCategory = (categoryName: string) => {
    const skillsInCategory = resumeInfo?.skills?.filter(skill => skill.category === categoryName) || [];
    skillsInCategory.forEach(skill => {
      if (skill.id) {
        deleteSkill({ skillId: skill.id });
      }
    });
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    await handleAddSkillToCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  const handleStartEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleSaveCategoryName = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    
    const skillsInCategory = resumeInfo?.skills?.filter(skill => skill.category === editingCategory) || [];
    
    for (const skill of skillsInCategory) {
      if (skill.id) {
        updateSkill({ skillId: skill.id, data: { category: editCategoryName.trim() } });
      }
    }
    
    setEditingCategory(null);
    setEditCategoryName("");
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };

  const getSkillValue = (skill: SkillType, field: keyof SkillType) => {
    if (skill.id && pendingUpdates.has(skill.id)) {
      const pending = pendingUpdates.get(skill.id);
      if (pending && field in pending) {
        return pending[field];
      }
    }
    return skill[field];
  };

  return (
    <div>
      <div className="w-full flex items-center gap-4 mb-2">
        <h2 className="font-bold text-lg">Skills</h2>
        <select
          className="border rounded px-2 py-1 text-sm"
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
          <div className="flex items-center gap-2 mb-2 mt-2">
            <input
              type="checkbox"
              id="hideRating"
              checked={hideRating}
              onChange={e => setHideRating(e.target.checked)}
            />
            <label htmlFor="hideRating" className="text-sm cursor-pointer select-none">Hide rating</label>
          </div>
          <form>
            <div
              className="border w-full h-auto
                divide-y-[1px] rounded-md px-3
                pb-4 my-5"
            >
              {skillsList.length === 0 && (
                <Button
                  className="gap-1 mt-1 text-primary border-primary/50"
                  variant="outline"
                  type="button"
                  disabled={isPending}
                  onClick={addNewSkill}
                >
                  <Plus size="15px" />
                  Add More Skills
                </Button>
              )}
              {sortedSkillsList.map((item, index) => (
                <div key={item.id || index}>
                  <div
                    className="relative flex 
                    items-center 
        justify-between mb-5 pt-4 gap-3"
                  >
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
                        className="size-[20px] text-center rounded-full absolute -top-3 -right-5 !bg-black dark:!bg-gray-600 text-white"
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
                        value={item.name || ""}
                        onChange={(e) =>
                          handleChange(e.target.value, "name", index)
                        }
                      />
                    </div>

                    {!hideRating && (
                      <div className="shrink-0 pt-5">
                        <Rating
                          style={{ maxWidth: 120 }}
                          isDisabled={!item.name}
                          value={item?.rating || 0}
                          onChange={(value: number) =>
                            handleChange(value, "rating", index)
                          }
                        />
                      </div>
                    )}
                  </div>

                  {index === skillsList.length - 1 && skillsList.length < 35 && (
                    <Button
                      className="gap-1 mt-1 text-primary border-primary/50"
                      variant="outline"
                      type="button"
                      disabled={isPending}
                      onClick={addNewSkill}
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
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="w-48"
            />
            <Button type="button" onClick={handleAddNewCategory} variant="outline">
              <Plus size="15px" /> Add category
            </Button>
          </div>
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([categoryName, skills]) => (
              <div key={categoryName} className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  {editingCategory === categoryName ? (
                    <>
                      <Input
                        value={editCategoryName}
                        onChange={e => setEditCategoryName(e.target.value)}
                        className="w-48 font-semibold"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveCategoryName();
                          if (e.key === 'Escape') handleCancelEditCategory();
                        }}
                        autoFocus
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleSaveCategoryName}
                        disabled={!editCategoryName.trim()}
                      >
                        Save
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={handleCancelEditCategory}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 
                        className="font-semibold text-lg cursor-pointer hover:text-blue-600"
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
                        value={(getSkillValue(skill, 'name') as string) || ""}
                        onChange={e => skill.id && handleSkillNameChange(skill.id, e.target.value)}
                        placeholder="Skill name"
                        className="w-64"
                      />
                      <select
                        value={(getSkillValue(skill, 'category') as string) || categoryName}
                        onChange={e => skill.id && handleSkillCategoryChange(skill.id, e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      >
                        {Object.keys(skillsByCategory).map(catName => (
                          <option key={catName} value={catName}>{catName}</option>
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
                    className="gap-1 mt-2" 
                    onClick={() => handleAddSkillToCategory(categoryName)}
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
                onClick={() => handleAddSkillToCategory("General")}
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
