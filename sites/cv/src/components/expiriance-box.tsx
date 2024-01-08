import { currentSkill, type SkillsType } from './current-skill.signal';

export interface ExperianceBoxProps {
  title: string;
  date: string;
  description: string;
  skills: SkillsType[];
}

export function ExperianceBox(props: ExperianceBoxProps) {
  const isSelected = () => {
    const currTech = currentSkill();
    if (!currTech) return false;
    return props.skills.includes(currTech);
  };
  const selectedClasses = () => {
    if (isSelected()) return 'border-pink-500 scale-105';
    return 'border-white';
  };
  return (
    <div
      class={`bg-white p-4 rounded-md border-2 flex flex-col gap-2 shadow-lg transition-transform ${selectedClasses()}`}
    >
      <p class="text-xl">{props.title}</p>
      <p class="text-sm italic">{props.date}</p>
      <p class="text-sm ">{props.description}</p>
    </div>
  );
}

export default ExperianceBox;
