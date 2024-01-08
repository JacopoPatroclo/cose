import { batch } from 'solid-js';
import {
  setcurrentSkill,
  isFixed,
  removeFixed,
  currentSkill,
  type SkillsType,
} from './current-skill.signal';

export interface SkillListItemProps {
  skill: SkillsType;
  label: string;
}

export function SkillListItem(props: SkillListItemProps) {
  function isNotcurrentSkill() {
    return currentSkill() !== props.skill;
  }

  const selectedClasses = () => {
    return isFixed() && !isNotcurrentSkill() ? 'text-pink-500' : '';
  };

  return (
    <li
      class={`${selectedClasses()} flex hover:cursor-pointer hover:opacity-75 text-sm print:text-xs`}
      onMouseEnter={() => {
        if (isFixed()) {
          return;
        }
        setcurrentSkill(props.skill);
      }}
      onMouseLeave={() => {
        if (isFixed()) {
          return;
        }
        setcurrentSkill(undefined);
      }}
      onClick={() => {
        batch(() => {
          if (isFixed() && !isNotcurrentSkill()) {
            return removeFixed();
          }
          if (isFixed() && isNotcurrentSkill()) {
            return setcurrentSkill(props.skill, true);
          }
          if (!isFixed()) {
            return setcurrentSkill(props.skill, true);
          }
        });
      }}
    >
      {props.label}
    </li>
  );
}

export default SkillListItem;
