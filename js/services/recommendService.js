// 식단 추천
// 음식 DB(FOODS)로 한 끼 조합을 모두 만들어 보고, 식단 분석(analyzeMeal) 점수가 높은 순으로 고른다.
// 질환(고혈압·당뇨)과 몸무게에 따른 목표 열량은 analyzeMeal이 반영하므로 따로 계산하지 않는다.

import { MEAL_TYPES } from '../core/constants.js';
import { getDiseases } from '../core/utils.js';
import { FOODS } from '../data/dummy.js';
import { toMealFood } from './foodService.js';
import { analyzeMeal } from './analysisService.js';

// 조합을 만들 때 쓰는 음식 역할 (FOODS의 foodName 기준)
const ROLES = {
  rice: ['쌀밥', '현미밥', '잡곡밥'],
  oneDish: ['비빔밥', '김밥'],
  soup: ['미역국', '된장찌개', '김치찌개_돼지고기'],
  main: ['소불고기', '돼지고기볶음(제육볶음)', '연어구이', '두부조림', '스크램블드에그'],
  side: ['시금치나물', '콩나물무침', '브로콜리볶음', '배추김치'],
  snack: ['고구마_찐고구마', '샐러드_닭가슴살', '떡볶이', '스크램블드에그', '두부조림'],
};

// 오늘 아직 기록하지 않은 첫 끼니 (아침·점심·저녁을 다 먹었으면 간식)
export function getNextMealType(todayMeals) {
  const done = new Set(todayMeals.map((meal) => meal.mealType));
  return MEAL_TYPES.slice(0, 3).find((type) => !done.has(type)) ?? '간식';
}

// 추천 식단 count개
// 돌려주는 항목: { foods: MealFood[], analysis: analyzeMeal 결과, highlights: ['추천 이유', …] }
export function recommendMeals(user, mealType, count = 3) {
  const scored = buildCombos(mealType).map((foods) => {
    const analysis = analyzeMeal({ mealType, foods }, user);
    return { foods, analysis };
  });
  scored.sort((a, b) => b.analysis.score - a.analysis.score || a.analysis.total.sodium - b.analysis.total.sodium);

  // 비슷한 식단만 나오지 않도록 대표 음식(메인 반찬·한 그릇 요리·간식)이 겹치면 건너뛴다
  const picked = [];
  const usedKeys = new Set();
  for (const item of scored) {
    const key = item.foods.find((f) => !ROLES.rice.includes(f.foodName) && !ROLES.soup.includes(f.foodName))?.foodName;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    picked.push({ ...item, highlights: makeHighlights(item.analysis, user) });
    if (picked.length === count) break;
  }
  return picked;
}

// 끼니에 맞는 음식 조합 목록 (각 조합은 MealFood 배열)
// - 간식: 간식 1개
// - 식사: 밥 + (국 0~1) + 메인 반찬 1 + 채소 반찬 1~2, 또는 한 그릇 요리 + (국 0~1) + (채소 반찬 0~1)
function buildCombos(mealType) {
  if (mealType === '간식') return ROLES.snack.map((name) => [food(name)]);

  const soups = [[], ...ROLES.soup.map((name) => [name])];
  const sides = [...ROLES.side.map((name) => [name]), ...pairs(ROLES.side)];
  const combos = [];

  ROLES.rice.forEach((rice) => soups.forEach((soup) => ROLES.main.forEach((main) => sides.forEach((side) => {
    combos.push([rice, ...soup, main, ...side]);
  }))));
  ROLES.oneDish.forEach((dish) => soups.forEach((soup) => [[], ...ROLES.side.map((name) => [name])].forEach((side) => {
    combos.push([dish, ...soup, ...side]);
  })));

  return combos.map((names) => names.map(food));
}

function pairs(list) {
  return list.flatMap((a, i) => list.slice(i + 1).map((b) => [a, b]));
}

// 음식 이름 → 1회분 MealFood
function food(name) {
  return toMealFood(FOODS.find((f) => f.foodName === name));
}

// 이 식단의 좋은 점 1~3개
function makeHighlights(analysis, user) {
  const list = [`목표 열량의 ${analysis.kcalRate}%`];
  if (analysis.ratio.protein >= 15) list.push('단백질 충분');
  const diseases = getDiseases(user);
  if (diseases.includes('고혈압') && analysis.total.sodium <= 667) list.push('나트륨 적음');
  if (diseases.includes('당뇨') && analysis.total.sugar <= 10) list.push('당류 적음');
  if (analysis.ratio.carb >= 55 && analysis.ratio.carb <= 65) list.push('탄수화물 비율 적정');
  return list.slice(0, 3);
}
