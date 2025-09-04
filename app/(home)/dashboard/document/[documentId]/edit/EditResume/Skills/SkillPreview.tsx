import { SkeletonLoader } from '@/components';
import { INITIAL_THEME_COLOR } from '@/lib/helper';
import { ResumeDataType } from '@/types/resume.type';
import { FC } from 'react';

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const SkillPreview: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || INITIAL_THEME_COLOR;
  if (isLoading) {
    return <SkeletonLoader />;
  }
  const skills = (resumeInfo?.skills || []).slice().sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0));
  const hideRating = !!skills[0]?.hideRating;
  const displayFormat = resumeInfo?.skillsDisplayFormat || 'default';

  if (displayFormat === 'byCategory') {
    const skillsByCategory = skills.reduce(
      (acc, skill) => {
        const category = skill.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
      },
      {} as Record<string, typeof skills>
    );

    const sortedCategories = Object.keys(skillsByCategory).sort((a, b) => {
      const aMinOrder = Math.min(...skillsByCategory[a].map(skill => skill.categoryOrder || 0));
      const bMinOrder = Math.min(...skillsByCategory[b].map(skill => skill.categoryOrder || 0));
      return aMinOrder - bMinOrder;
    });

    return (
      <div className="my-3 w-full">
        <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
          Skills
        </h5>
        <hr className="mb-2 mt-2 border-[1.5px]" style={{ borderColor: themeColor }} />
        <div>
          {sortedCategories.map(categoryName => (
            <div key={categoryName}>
              <span className="inline text-[13px] font-bold" style={{ color: themeColor }}>
                {categoryName}:{' '}
              </span>
              <span className="text-[12px] text-gray-700">
                {skillsByCategory[categoryName]
                  .sort((a, b) => (a.skillOrder || 0) - (b.skillOrder || 0))
                  .map(skill => skill.name)
                  .join(', ')}
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
      columns[idx % 4].push(skill?.name || '');
    });
    return (
      <div className="my-3 w-full">
        <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
          Skills
        </h5>
        <hr className="mb-2 mt-2 border-[1.5px]" style={{ borderColor: themeColor }} />
        <div className="grid grid-cols-4 gap-x-4">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              {col.map((name, idx) => (
                <span key={idx} className="max-w-full break-words text-[12px]" style={{ wordBreak: 'break-word' }}>
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
    <div className="my-3 w-full">
      <h5 className="text-center text-[18px] font-bold" style={{ color: themeColor }}>
        Skills
      </h5>
      <hr className="mb-2 mt-2 border-[1.5px]" style={{ borderColor: themeColor }} />
      <div className="grid grid-cols-2 gap-x-8">
        {[leftSkills, rightSkills].map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-2">
            {col.map((skill, idx) => (
              <div key={idx} className="flex min-w-0 items-center justify-between">
                <span className="mr-2 min-w-[60px] text-[13px]">{skill?.name}</span>
                {skill?.rating && skill?.name ? (
                  <div className="flex flex-1 items-center">
                    <div className="h-[6px] w-full rounded bg-gray-200">
                      <div
                        className="h-[6px] rounded"
                        style={{
                          background: themeColor,
                          width: skill.rating * 20 + '%',
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
