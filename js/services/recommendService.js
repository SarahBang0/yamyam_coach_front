// 식단 추천
// 음식 DB(FOODS, 식약처 음식 DB)에서 끼니 조합을 만들어 보고, 식단 분석(analyzeMeal) 점수가 높은 순으로 고른다.
// 질환(고혈압·당뇨)과 몸무게에 따른 목표 열량은 analyzeMeal이 반영한다.
//
// 1만 개가 넘는 음식을 모두 조합할 수는 없어서
//  1) 대표 음식만 후보로 쓴다: g 단위, 이름에 '_'(세부 종류)가 없는 기본 음식
//  2) 식품대분류명으로 역할(밥·국·메인·반찬·간식)을 나눈다
//  3) 역할마다 그 사람에게 맞는 음식(나트륨·당류가 적은 순) 몇 개만 남겨 조합한다

import { MEAL_TYPES } from '../core/constants.js';
import { getDiseases } from '../core/utils.js';
import { FOODS } from '../data/foods.js';
import { toMealFood } from './foodService.js';
import { analyzeMeal } from './analysisService.js';

// 식품대분류명 → 역할
const CATEGORY_ROLES = {
  rice: ['밥류'], // 밥류 중 양이 많은 한 그릇 요리(비빔밥, 짬뽕밥 등)는 oneDish로 따로 뺀다
  oneDish: ['면 및 만두류'],
  soup: ['국 및 탕류', '찌개 및 전골류'],
  main: ['구이류', '볶음류', '조림류', '찜류', '전·적 및 부침류', '튀김류'],
  side: ['나물·숙채류', '생채·무침류', '김치류'],
  snack: ['빵 및 과자류', '곡류, 서류 제품', '두류, 견과 및 종실류', '과일류'],
};
// 역할마다 남길 후보 수 (조합 수 = 밥 × 국 × 메인 × 반찬 이 너무 커지지 않게)
const POOL_SIZE = { rice: 6, oneDish: 6, soup: 8, main: 10, side: 8, snack: 12 };
const STAPLES = ['rice', 'oneDish'];

// 오늘 아직 기록하지 않은 첫 끼니 (아침·점심·저녁을 다 먹었으면 간식)
export function getNextMealType(todayMeals) {
  const done = new Set(todayMeals.map((meal) => meal.mealType));
  return MEAL_TYPES.slice(0, 3).find((type) => !done.has(type)) ?? '간식';
}

// 추천 식단 count개
// 돌려주는 항목: { foods: MealFood[], analysis: analyzeMeal 결과, highlights: ['추천 이유', …] }
export function recommendMeals(user, mealType, count = 3) {
  const scored = buildCombos(mealType, user).map((foods) => {
    const analysis = analyzeMeal({ mealType, foods }, user);
    return { foods, analysis };
  });
  scored.sort((a, b) => b.analysis.score - a.analysis.score || a.analysis.total.sodium - b.analysis.total.sodium);

  // 비슷한 식단만 나오지 않게 고른다. 점수가 너무 떨어지지 않도록 조건을 단계적으로 푼다
  //  1단계: 점수 85점 이상 + 밥(한 그릇 요리)과 메인 반찬이 모두 앞의 추천과 다름
  //  2단계: 메인 반찬만 다름
  //  3단계: 남은 것 중 점수순
  const picked = [];
  const rules = [
    (item) => item.analysis.score >= 85 && !overlaps(item, picked, 'staple') && !overlaps(item, picked, 'main'),
    (item) => !overlaps(item, picked, 'main'),
    () => true,
  ];
  for (const rule of rules) {
    for (const item of scored) {
      if (picked.length === count) break;
      if (!picked.includes(item) && rule(item)) picked.push(item);
    }
  }
  return picked
    .sort((a, b) => b.analysis.score - a.analysis.score)
    .map((item) => ({ ...item, highlights: makeHighlights(item.analysis, user) }));
}

// 끼니에 맞는 음식 조합 목록 (각 조합은 MealFood 배열)
// - 간식: 간식 1개
// - 식사: 밥 + (국 0~1) + 메인 반찬 1 + 채소 반찬 1~2, 또는 한 그릇 요리 + (국 0~1) + (채소 반찬 0~1)
function buildCombos(mealType, user) {
  const pool = getPool(user);
  if (mealType === '간식') return pool.snack.map((food) => [food]);

  const soups = [[], ...pool.soup.map((f) => [f])];
  const sides = [...pool.side.map((f) => [f]), ...pairs(pool.side)];
  const combos = [];
  pool.rice.forEach((rice) => soups.forEach((soup) => pool.main.forEach((main) => sides.forEach((side) => {
    combos.push([rice, ...soup, main, ...side]);
  }))));
  pool.oneDish.forEach((dish) => soups.forEach((soup) => [[], ...pool.side.map((f) => [f])].forEach((side) => {
    combos.push([dish, ...soup, ...side]);
  })));
  return combos;
}

// 역할별 후보 (1회분 MealFood). 질환이 같으면 결과가 같으므로 기억해 둔다
const poolCache = new Map();
const roleOf = new Map(); // 음식 이름 → 역할 (비슷한 추천 거르기에 씀)

function getPool(user) {
  const diseases = getDiseases(user);
  const key = diseases.join(',');
  if (poolCache.has(key)) return poolCache.get(key);

  const hypertension = diseases.includes('고혈압');
  const diabetes = diseases.includes('당뇨');
  // 낮을수록 좋은 점수: 나트륨·당류는 적게, 질환이 있으면 그 성분을 두 배로 따진다
  const penalty = (f) => (f.sodium / 200) * (hypertension ? 2 : 1) + (f.sugar / 5) * (diabetes ? 2 : 1) - f.protein / 15;

  const pool = Object.fromEntries(Object.keys(POOL_SIZE).map((role) => [role, []]));
  FOODS.forEach((food) => {
    if (food.servingUnit !== 'g' || food.foodName.includes('_') || food.calorie <= 0) return;
    const role = findRole(food);
    if (role) pool[role].push(toMealFood(food));
  });
  Object.keys(pool).forEach((role) => {
    pool[role] = pool[role].sort((a, b) => penalty(a) - penalty(b)).slice(0, POOL_SIZE[role]);
    pool[role].forEach((food) => roleOf.set(food.foodName, role));
  });
  poolCache.set(key, pool);
  return pool;
}

function findRole(food) {
  const role = Object.keys(CATEGORY_ROLES).find((r) => CATEGORY_ROLES[r].includes(food.category));
  // 밥류인데 양이 많거나 열량이 높으면(비빔밥, 짬뽕밥 등) 한 그릇 요리로 본다
  if (role === 'rice' && (food.servingSize > 300 || (food.calorie * food.servingSize) / 100 > 450)) return 'oneDish';
  return role;
}

// 이미 고른 식단과 같은 밥(staple) 또는 같은 메인 반찬(main)이 있는지 (간식은 음식 자체로 비교)
function overlaps(item, picked, role) {
  const pick = (foods) => {
    if (foods.length === 1) return foods[0].foodName;
    const roles = role === 'staple' ? STAPLES : ['main'];
    return foods.find((f) => roles.includes(roleOf.get(f.foodName)))?.foodName;
  };
  const key = pick(item.foods);
  return key !== undefined && picked.some((other) => pick(other.foods) === key);
}

function pairs(list) {
  return list.flatMap((a, i) => list.slice(i + 1).map((b) => [a, b]));
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
