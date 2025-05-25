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

const SkillsForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteSkill();
  const { mutateAsync: createSkill } = useCreateSkill();

  const [format, setFormat] = React.useState<'default' | 'byCategory'>('default');
  const [hasMigrated, setHasMigrated] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  
  const [skillsList, setSkillsList] = React.useState<SkillType[]>(() => (resumeInfo?.skills || []).map(skill => ({ ...skill, hideRating: !!skill.hideRating, category: skill.category || "" })));
  const [hideRating, setHideRating] = React.useState<boolean>(!!(resumeInfo?.skills?.[0]?.hideRating));
  const debouncedSkillsList = useDebounce(skillsList, 600);
  const sortedSkillsList = [...skillsList].sort((a, b) => (a.order || 0) - (b.order || 0));

  type CategoryType = { id: string; name: string; skills: { id: string; name: string }[] };
  const [categories, setCategories] = React.useState<CategoryType[]>([]);
  const [categoryNameInput, setCategoryNameInput] = React.useState<string>("");
  console.log("skillsList: ", skillsList);
  console.log("sortedSkillsList: ", sortedSkillsList);
  console.log("data: ", data);
  console.log("categories: ", categories);
  
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
      setIsInitialLoad(false);
    } else if (format === 'byCategory' && !hasMigrated) {
      if (resumeInfo?.skills && Array.isArray(resumeInfo.skills) && resumeInfo.skills.length > 0) {
        const categoriesMap = new Map<string, { id: string; name: string; skills: { id: string; name: string }[] }>();
        
        resumeInfo.skills.forEach(skill => {
          const categoryName = skill.category || "General";
          if (!categoriesMap.has(categoryName)) {
            categoriesMap.set(categoryName, {
              id: Math.random().toString(36).slice(2),
              name: categoryName,
              skills: []
            });
          }
          if (skill.name) {
            categoriesMap.get(categoryName)!.skills.push({
              id: Math.random().toString(36).slice(2),
              name: skill.name
            });
          }
        });
        
        setCategories(Array.from(categoriesMap.values()));
        setHasMigrated(true);
        setTimeout(() => setIsInitialLoad(false), 100);
      }
    }
  }, [resumeInfo?.skills, format, hasMigrated]);
  
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

  const debouncedCategories = useDebounce(categories, 600);

  useEffect(() => {
    if (!isInitialLoad && format === 'byCategory' && debouncedCategories.length > 0) {
      const skillsToSave = debouncedCategories.flatMap(cat => 
        cat.skills
          .filter(skill => skill.name.trim() !== "")
          .map(skill => ({ name: skill.name, category: cat.name }))
      );
      setResumeInfo({ skills: skillsToSave });
    }
  }, [debouncedCategories, format, isInitialLoad, setResumeInfo]);

  const handleUserInteraction = () => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  };
  
  useEffect(() => {
    if (resumeInfo?.skillsDisplayFormat && (resumeInfo.skillsDisplayFormat === 'default' || resumeInfo.skillsDisplayFormat === 'byCategory')) {
      setFormat(resumeInfo.skillsDisplayFormat);
    }
  }, [resumeInfo?.skillsDisplayFormat]);

  const handleFormatChange = (newFormat: 'default' | 'byCategory') => {
    setFormat(newFormat);
    setHasMigrated(false);
    setIsInitialLoad(true);
    console.log('PATCH skillsDisplayFormat:', newFormat);
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

  // byCategory logic
  const handleAddCategory = () => {
    if (!categoryNameInput.trim()) return;
    handleUserInteraction();
    setCategories(prev => [...prev, { id: Math.random().toString(36).slice(2), name: categoryNameInput.trim(), skills: [] }]);
    setCategoryNameInput("");
  };
  const handleRemoveCategory = (catId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== catId));
  };
  const handleCategoryNameChange = (catId: string, name: string) => {
    handleUserInteraction();
    setCategories(prev => prev.map(cat => cat.id === catId ? { ...cat, name } : cat));
  };
  const handleAddSkillToCategory = (catId: string) => {
    handleUserInteraction();
    setCategories(prev => prev.map(cat => cat.id === catId ? { ...cat, skills: [...cat.skills, { id: Math.random().toString(36).slice(2), name: "" }] } : cat));
  };
  const handleRemoveSkillFromCategory = (catId: string, skillId: string) => {
    setCategories(prev => prev.map(cat => cat.id === catId ? { ...cat, skills: cat.skills.filter(s => s.id !== skillId) } : cat));
  };
  const handleSkillNameChange = (catId: string, skillId: string, name: string) => {
    handleUserInteraction();
    setCategories(prev => prev.map(cat => cat.id === catId ? { ...cat, skills: cat.skills.map(s => s.id === skillId ? { ...s, name } : s) } : cat));
  };
  const handleMoveSkillToCategory = (fromCatId: string, skillId: string, toCatId: string) => {
    setCategories(prev => {
      let skillToMove: { id: string; name: string } | undefined;
      const newCategories = prev.map(cat => {
        if (cat.id === fromCatId) {
          const skill = cat.skills.find(s => s.id === skillId);
          if (skill) skillToMove = skill;
          return { ...cat, skills: cat.skills.filter(s => s.id !== skillId) };
        }
        return cat;
      });
      if (skillToMove) {
        return newCategories.map(cat =>
          cat.id === toCatId ? { ...cat, skills: [...cat.skills, skillToMove!] } : cat
        );
      }
      return newCategories;
    });
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

                    <div className="flex-1">
                      <Label className="text-sm">Category</Label>
                      <Input
                        name="category"
                        placeholder="Category"
                        value={item.category || ""}
                        onChange={e => handleChange(e.target.value, "category", index)}
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
              placeholder="Category name"
              value={categoryNameInput}
              onChange={e => setCategoryNameInput(e.target.value)}
              className="w-48"
            />
            <Button type="button" onClick={handleAddCategory} variant="outline">
              <Plus size="15px" /> Add skill category
            </Button>
          </div>
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category.id} className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={category.name}
                    onChange={e => handleCategoryNameChange(category.id, e.target.value)}
                    className="w-48 font-semibold"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveCategory(category.id)}>
                    <X size="15px" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {category.skills.map(skill => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <Input
                        value={skill.name}
                        onChange={e => handleSkillNameChange(category.id, skill.id, e.target.value)}
                        placeholder="Skill name"
                        className="w-64"
                      />
                      <select
                        value={category.id}
                        onChange={e => handleMoveSkillToCategory(category.id, skill.id, e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      >
                        {categories.map(catOpt => (
                          <option key={catOpt.id} value={catOpt.id}>{catOpt.name}</option>
                        ))}
                      </select>
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveSkillFromCategory(category.id, skill.id)}>
                        <X size="13px" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="gap-1 mt-2" onClick={() => handleAddSkillToCategory(category.id)}>
                    <Plus size="15px" /> Add skill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsForm;
