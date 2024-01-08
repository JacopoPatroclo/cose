import { createSignal } from 'solid-js';

export type SkillsType =
  | 'javascript'
  | 'typescript'
  | 'php'
  | 'react'
  | 'angular'
  | 'nodejs'
  | 'astro'
  | 'nextjs'
  | 'fastify'
  | 'nestjs'
  | 'laravel'
  | 'drizzle'
  | 'typeorm'
  | 'postgres'
  | 'terraform'
  | 'swift'
  | 'nx'
  | 'i.c.'
  | 'client_management';

const [currentState, setCurrentState] = createSignal<{
  currentSkill?: SkillsType;
  fixed: boolean;
}>({
  currentSkill: undefined,
  fixed: false,
});

export function setcurrentSkill(skill?: SkillsType, fixed?: boolean) {
  setCurrentState({ currentSkill: skill, fixed: fixed ?? false });
}

export function removeFixed() {
  setCurrentState({
    currentSkill: currentState()?.currentSkill,
    fixed: false,
  });
}

export function currentSkill() {
  return currentState()?.currentSkill;
}

export function isFixed() {
  return currentState()?.fixed;
}
