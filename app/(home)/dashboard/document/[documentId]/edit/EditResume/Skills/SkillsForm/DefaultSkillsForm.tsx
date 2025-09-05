'use client';
import React, { useEffect, useCallback, useMemo } from 'react';
import { Label, Input, Button } from '@/components';
import { Rating } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';
import { ResumeDataType, SkillType } from '@/types/resume.type';
import { useDebounce, useCreateSkill, useDeleteSkill } from '@/hooks';
import { useSkillInputHandler } from './utils';

interface DefaultSkillsFormProps {
  resumeInfo: ResumeDataType | undefined;
}

const DefaultSkillsForm: React.FC<DefaultSkillsFormProps> = ({ resumeInfo }) => {
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteSkill();
  const { mutateAsync: createSkill, isPending: isCreating } = useCreateSkill();

  const [skillsList, setSkillsList] = React.useState<SkillType[]>([]);
  const [hideRating, setHideRating] = React.useState<boolean>(false);
  const [localSkillInputs, setLocalSkillInputs] = React.useState<Record<number, string>>({});

  const debouncedSkillInputs = useDebounce(localSkillInputs, 500);

  // Use the shared hook for handling debounced inputs
  const { updateSkill } = useSkillInputHandler({
    debouncedSkillInputs,
    resumeInfo,
  });

  // Memoize sorted skills list
  const sortedSkills = useMemo(() => {
    if (!resumeInfo?.skills) return [];
    return resumeInfo.skills.slice().sort((a: SkillType, b: SkillType) => (a.skillOrder || 0) - (b.skillOrder || 0));
  }, [resumeInfo?.skills]);

  useEffect(() => {
    if (sortedSkills.length > 0) {
      setSkillsList(
        sortedSkills.map((skill: SkillType) => ({
          ...skill,
          hideRating: !!skill.hideRating,
        }))
      );
      setHideRating(!!sortedSkills[0].hideRating);

      setLocalSkillInputs(prev => {
        const newInputs: Record<number, string> = {};
        sortedSkills.forEach((skill: SkillType) => {
          if (skill.id) {
            newInputs[skill.id] = prev[skill.id] !== undefined ? prev[skill.id] : skill.name || '';
          }
        });
        return newInputs;
      });
    }
  }, [sortedSkills]);

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
    const maxOrder = Math.max(...skillsList.map(skill => skill.skillOrder || 0), -1);
    const newSkill = {
      name: '',
      rating: 0,
      hideRating: hideRating,
      skillOrder: maxOrder + 1,
      categoryOrder: 0,
      category: '',
    };

    try {
      const created = await createSkill(newSkill);
      setSkillsList(prev => [...prev, { ...created, hideRating: !!created.hideRating }]);

      if (created.id) {
        setLocalSkillInputs(prev => ({
          ...prev,
          [created.id!]: created.name || '',
        }));
      }
    } catch (error) {
      console.error('Error creating skill:', error);
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
    }
    setSkillsList(prev => prev.filter(item => item.id !== id));
  };

  const moveSkill = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= skillsList.length) return;

    const newSkills = [...skillsList];
    const [moved] = newSkills.splice(fromIndex, 1);
    newSkills.splice(toIndex, 0, moved);

    // Update local state immediately
    setSkillsList(newSkills);

    // Update database with new order for all affected skills
    newSkills.forEach((skill, idx) => {
      if (skill.id) {
        updateSkill({ skillId: skill.id, data: { skillOrder: idx } });
      }
    });
  };

  const handleAddSkillClick = useCallback(() => {
    void addNewSkill();
  }, [addNewSkill]);

  return (
    <>
      <div className="mb-2 mt-2 flex items-center gap-2">
        <input type="checkbox" id="hideRating" checked={hideRating} onChange={e => setHideRating(e.target.checked)} />
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
              disabled={isCreating}
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
                    disabled={isCreating || isDeleting}
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
                      item.id && localSkillInputs[item.id] !== undefined ? localSkillInputs[item.id] : item.name || ''
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
                  disabled={isCreating}
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
  );
};

export default DefaultSkillsForm;
