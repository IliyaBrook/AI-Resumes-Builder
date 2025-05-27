import SkeletonLoader from "@/components/skeleton-loader";
import { INITIAL_THEME_COLOR } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import { FC } from "react";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const SkillPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  if (isLoading) {
    return <SkeletonLoader />;
  }
  const skills = (resumeInfo?.skills || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const hideRating = !!skills[0]?.hideRating;
  const displayFormat = resumeInfo?.skillsDisplayFormat || 'default';

  console.log("skills", skills);
  console.log("resumeInfo", resumeInfo?.skillsDisplayFormat);

  if (displayFormat === 'byCategory') {
    const skillsByCategory = skills.reduce((acc, skill) => {
      const category = skill.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>);

    const sortedCategories = Object.keys(skillsByCategory).sort((a, b) => a.localeCompare(b));

    return (
      <div className="w-full my-3">
        <h5
          className="text-center font-bold text-[18px]"
          style={{ color: themeColor }}
        >
          Skills
        </h5>
        <hr
          className="border-[1.5px] mt-2 mb-2"
          style={{ borderColor: themeColor }}
        />
        <div>
          {sortedCategories.map((categoryName) => (
            <div key={categoryName}>
              <span
                className="font-bold text-[13px] inline"
                style={{ color: themeColor }}
              >
                {categoryName}:{" "}
              </span>
              <span className="text-[12px] text-gray-700">
                {skillsByCategory[categoryName]
                  .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                  .map((skill) => skill.name)
                  .join(", ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hideRating) {
    const columns = [[], [], [], []] as string[][];
    skills.forEach((skill, idx) => {
      columns[idx % 4].push(skill?.name || "");
    });
    return (
      <div className="w-full my-3">
        <h5
          className="text-center font-bold text-[18px]"
          style={{ color: themeColor }}
        >
          Skills
        </h5>
        <hr
          className="border-[1.5px] mt-2 mb-2"
          style={{ borderColor: themeColor }}
        />
        <div className="grid grid-cols-4 gap-x-4">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {col.map((name, idx) => (
                <span
                  key={idx}
                  className="text-[12px] break-words max-w-full"
                  style={{ wordBreak: "break-word" }}
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const leftSkills = skills.filter((_, i) => i % 2 === 0);
  const rightSkills = skills.filter((_, i) => i % 2 !== 0);

  return (
    <div className="w-full my-3">
      <h5
        className="text-center font-bold text-[18px]"
        style={{ color: themeColor }}
      >
        Skills
      </h5>
      <hr
        className="border-[1.5px] mt-2 mb-2"
        style={{ borderColor: themeColor }}
      />
      <div className="grid grid-cols-2 gap-x-8">
        {[leftSkills, rightSkills].map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-2">
            {col.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between min-w-0"
              >
                <span className="text-[13px] mr-2 min-w-[60px]">
                  {skill?.name}
                </span>
                {skill?.rating && skill?.name ? (
                  <div className="flex-1 flex items-center">
                    <div className="w-full bg-gray-200 rounded h-[6px]">
                      <div
                        className="h-[6px] rounded"
                        style={{
                          background: themeColor,
                          width: skill.rating * 20 + "%",
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillPreview;
