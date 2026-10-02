// 식단 추천
// 실제 집밥에 나오는 음식만 후보로 두고, 한식 상차림 구조로 조합한 뒤 식단 분석(analyzeMeal) 점수가 높은 순으로 고른다.
// 질환(고혈압·당뇨)과 몸무게·목표에 따른 목표 열량은 analyzeMeal이 반영한다.
//
// 상차림 구조
//  - 일반 식사: 밥 + 국·찌개 + 메인 반찬 1 + 채소 반찬 1~2 (김치는 한 끼에 하나까지)
//  - 한 그릇 요리: 비빔밥·김밥 같은 밥 요리는 국·김치를 곁들일 수 있고, 국수·떡국처럼 국물 요리는 김치만
//  - 간식: 1가지

import { MEAL_TYPES } from '../core/constants.js';
import { getDiseases } from '../core/utils.js';
import { FOODS } from '../data/foods.js';
import { toMealFood } from './foodService.js';
import { analyzeMeal } from './analysisService.js';

// 후보 음식 (음식 DB의 이름 그대로). DB에 없는 이름은 자동으로 빠진다
const MENU = {
  rice: ['쌀밥', '현미밥', '잡곡밥', '보리밥', '흑미밥', '오곡밥', '귀리밥', '기장밥', '차조밥'],
  // 그 자체로 한 끼인 무거운 탕(부대찌개·갈비탕·육개장)은 넣지 않는다
  soup: ['된장찌개', '김치찌개', '청국장찌개', '동태찌개', '미역국', '콩나물국', '무국', '달걀국', '감자국', '어묵국'],
  main: ['고등어구이', '연어구이', '갈치구이', '조기구이', '삼치구이', '임연수구이', '돼지고기볶음(제육볶음)', '소불고기',
    '오징어볶음', '두부조림', '고등어조림', '달걀말이', '달걀찜', '두부부침', '스크램블드에그', '닭볶음탕', '돼지갈비찜',
    '훈제오리', '동태전', '달걀부침(달걀후라이)'],
  side: ['시금치나물', '콩나물무침', '숙주나물', '무생채', '오이무침', '고사리나물', '미역줄기볶음', '감자볶음', '감자조림',
    '멸치볶음', '어묵볶음', '브로콜리볶음', '가지나물', '무말랭이무침', '연근조림', '우엉조림', '청경채나물',
    '배추김치', '깍두기', '열무김치', '총각김치', '오이소박이'],
  oneDish: ['비빔밥', '김밥', '볶음밥', '오므라이스', '카레라이스', '비빔국수', '잔치국수', '칼국수', '쌀국수', '떡국'],
  snack: ['고구마_찐고구마', '감자_찐감자', '옥수수_찐옥수수', '달걀_삶은것', '샐러드_닭가슴살'],
};
const KIMCHI = ['배추김치', '깍두기', '열무김치', '총각김치', '오이소박이'];
const SOUPY_ONE_DISH = ['잔치국수', '칼국수', '쌀국수', '떡국']; // 국물이 있어서 국을 따로 곁들이지 않는다
// 역할마다 남길 후보 수 (그 사람에게 맞는 순으로)
const POOL_SIZE = { rice: 6, oneDish: 6, soup: 8, main: 10, side: 10, snack: 5 };
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
  //  1단계: 점수 85점 이상 + 밥(한 그릇 요리)·국·메인 반찬이 모두 앞의 추천과 다름
  //  2단계: 메인 반찬만 다름
  //  3단계: 남은 것 중 점수순
  const picked = [];
  const rules = [
    (item) => item.analysis.score >= 85 && !overlaps(item, picked, 'staple') && !overlaps(item, picked, 'main') && !overlaps(item, picked, 'soup'),
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
function buildCombos(mealType, user) {
  const pool = getPool(user);
  if (mealType === '간식') return pool.snack.map((food) => [food]);

  const isKimchi = (food) => KIMCHI.includes(food.foodName);
  // 채소 반찬 1~2개 (김치는 하나까지)
  const sides = [...pool.side.map((f) => [f]), ...pairs(pool.side).filter((pair) => pair.filter(isKimchi).length <= 1)];
  const kimchiOrNone = [[], ...pool.side.filter(isKimchi).map((f) => [f])];
  const combos = [];

  pool.rice.forEach((rice) => pool.soup.forEach((soup) => pool.main.forEach((main) => sides.forEach((side) => {
    combos.push([rice, soup, main, ...side]);
  }))));
  pool.oneDish.forEach((dish) => {
    const soups = SOUPY_ONE_DISH.includes(dish.foodName) ? [[]] : [[], ...pool.soup.map((f) => [f])];
    soups.forEach((soup) => kimchiOrNone.forEach((kimchi) => combos.push([dish, ...soup, ...kimchi])));
  });
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
  const byName = new Map(FOODS.map((food) => [food.foodName, food]));

  const pool = {};
  Object.entries(MENU).forEach(([role, names]) => {
    const foods = names.filter((name) => byName.has(name)).map((name) => toMealFood(byName.get(name)));
    // 김치는 반찬 후보에서 밀려나지 않도록 따로 하나 이상 남긴다
    const sorted = foods.sort((a, b) => penalty(a) - penalty(b));
    let picked = sorted.slice(0, POOL_SIZE[role]);
    if (role === 'side' && !picked.some((f) => KIMCHI.includes(f.foodName))) {
      const kimchi = sorted.find((f) => KIMCHI.includes(f.foodName));
      if (kimchi) picked = [...picked.slice(0, -1), kimchi];
    }
    pool[role] = picked;
    picked.forEach((food) => roleOf.set(food.foodName, role));
  });
  poolCache.set(key, pool);
  return pool;
}

// 이미 고른 식단과 같은 밥(staple)·국(soup)·메인 반찬(main)이 있는지 (간식은 음식 자체로 비교)
function overlaps(item, picked, role) {
  const pick = (foods) => {
    if (foods.length === 1) return foods[0].foodName;
    const roles = role === 'staple' ? STAPLES : [role];
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
