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

  const [skillsList, setSkillsList] = React.useState<SkillType[]>(() => (resumeInfo?.skills || []).map(skill => ({ ...skill, hideRating: !!skill.hideRating })));
  const [hideRating, setHideRating] = React.useState<boolean>(!!(resumeInfo?.skills?.[0]?.hideRating));
  const debouncedSkillsList = useDebounce(skillsList, 600);
  const sortedSkillsList = [...skillsList].sort((a, b) => (a.order || 0) - (b.order || 0));

  useEffect(() => {
    const sorted = (resumeInfo?.skills || [])
      .map(item => ({
        ...item,
        name: item.name || "",
        rating: item.rating || 0,
        hideRating: !!item.hideRating,
        order: typeof item.order === "number" ? item.order : 0,
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    setSkillsList(sorted);
    setHideRating(!!(resumeInfo?.skills?.[0]?.hideRating));
  }, [resumeInfo?.skills]);

  useEffect(() => {
    if (!resumeInfo) return;
    if (
      debouncedSkillsList &&
      (JSON.stringify(debouncedSkillsList) !== JSON.stringify((resumeInfo?.skills || []).map(skill => ({ ...skill, hideRating: !!skill.hideRating }))) || hideRating !== !!(resumeInfo?.skills?.[0]?.hideRating))
    ) {
      setResumeInfo({ skills: [...debouncedSkillsList].sort((a, b) => (a.order || 0) - (b.order || 0)).map(skill => ({ ...skill, hideRating: hideRating ? 1 : 0 })) });
    }
  }, [debouncedSkillsList, hideRating]);

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

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Skills</h2>
        <p className="text-sm">Add your skills information</p>
      </div>
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
    </div>
  );
};

export default SkillsForm;
