// 식단 분석 (F305) 과 건강 지표 (F307)
// 계산만 한다. 저장하지 않는다.

import { NUTRIENT_KEYS, GOALS, DEFAULT_GOAL, MIN_DAILY_KCAL } from '../core/constants.js';
import { round, getDiseases } from '../core/utils.js';

// 음식 목록의 영양 합계 → { calorie, carbohydrate, protein, fat, sodium, sugar }
export function sumNutrition(foods = []) {
  const total = {};
  NUTRIENT_KEYS.forEach((key) => {
    total[key] = round(foods.reduce((sum, f) => sum + (Number(f[key]) || 0), 0), 1);
  });
  return total;
}

// BMI → { bmi, bmiLabel }
export function calcBMI(user) {
  const meter = user.height / 100;
  const bmi = round(user.weight / (meter * meter), 1);
  let bmiLabel = '비만';
  if (bmi < 18.5) bmiLabel = '저체중';
  else if (bmi < 23) bmiLabel = '정상';
  else if (bmi < 25) bmiLabel = '과체중';
  return { bmi, bmiLabel };
}

// 하루 권장 열량 = 몸무게 × (목표별 kg당 열량: 감량 25 / 유지 30 / 증량 35), 최소 1,200kcal
export function calcTargetKcal(user) {
  const goal = GOALS[user.goal] ?? GOALS[DEFAULT_GOAL];
  return Math.max(MIN_DAILY_KCAL, Math.round(user.weight * goal.kcalPerKg));
}

// 탄단지 열량 비율 % (탄수화물·단백질 4kcal/g, 지방 9kcal/g)
// → { ratio: { carb, protein, fat }, macroKcal: 탄단지 열량 합 }
export function calcMacroRatio(total) {
  const carbKcal = total.carbohydrate * 4;
  const proteinKcal = total.protein * 4;
  const fatKcal = total.fat * 9;
  const macroKcal = carbKcal + proteinKcal + fatKcal;
  const percent = (kcal) => (macroKcal ? round((kcal / macroKcal) * 100, 1) : 0);
  return {
    ratio: { carb: percent(carbKcal), protein: percent(proteinKcal), fat: percent(fatKcal) },
    macroKcal,
  };
}

// 하루 분석 (그날 식단 전체)
// → { total: 영양 합계, targetKcal: 하루 권장 열량, kcalRate: 권장 대비 %, ratio: 탄단지 비율 % }
export function analyzeDay(meals, user) {
  const total = sumNutrition(meals.flatMap((meal) => meal.foods));
  const targetKcal = calcTargetKcal(user);
  return {
    total,
    targetKcal,
    kcalRate: targetKcal > 0 ? Math.round((total.calorie / targetKcal) * 100) : 0,
    ratio: calcMacroRatio(total).ratio,
  };
}

// 한 끼 분석
// 돌려주는 값:
// {
//   score: 0~100, grade: 'A'~'D',
//   total: 영양 합계, calorie: 총 열량,
//   targetKcal: 이 끼니의 목표 열량, kcalRate: 목표 대비 %,
//   ratio: { carb, protein, fat } 탄단지 열량 비율 %(차트용),
//   advice: ['조언 문장', …]  (**…** 부분은 강조 표시)
// }
export function analyzeMeal(meal, user) {
  const total = sumNutrition(meal.foods);
  const daily = calcTargetKcal(user);
  const targetKcal = Math.round(meal.mealType === '간식' ? daily / 10 : daily / 3);
  const kcalRate = targetKcal > 0 ? Math.round((total.calorie / targetKcal) * 100) : 0;

  const { ratio, macroKcal } = calcMacroRatio(total);

  // 감점 항목 계산 (명세서 7장 표)
  // 질환이 여러 개면 각각 따로 반영된다
  const diseases = getDiseases(user);
  const hypertension = diseases.includes('고혈압');
  const diabetes = diseases.includes('당뇨');
  const deductions = [];

  const kcalOver = Math.max(0, Math.abs(kcalRate - 100) - 10);
  addDeduction(deductions, kcalRate > 100 ? 'calorieHigh' : 'calorieLow', Math.min(30, kcalOver));

  if (macroKcal > 0) {
    addRangeDeduction(deductions, 'carb', ratio.carb, 55, 65, 15);
    addRangeDeduction(deductions, 'protein', ratio.protein, 7, 20, 15);
    addRangeDeduction(deductions, 'fat', ratio.fat, 15, 30, 15);
  }

  const sodiumPenalty = Math.min(15, (Math.max(0, total.sodium - 667) / 100) * 2);
  addDeduction(deductions, hypertension ? 'sodiumHypertension' : 'sodium', sodiumPenalty * (hypertension ? 2 : 1));

  const sugarPenalty = Math.min(10, Math.max(0, total.sugar - 17));
  addDeduction(deductions, diabetes ? 'sugarDiabetes' : 'sugar', sugarPenalty * (diabetes ? 2 : 1));

  const lost = deductions.reduce((sum, d) => sum + d.points, 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - lost)));

  // 감점이 큰 항목 2개에 대한 조언 (3점 미만의 작은 감점은 조언하지 않음)
  const advice = deductions
    .filter((d) => d.points >= 3)
    .sort((a, b) => b.points - a.points)
    .slice(0, 2)
    .map((d) => ADVICE[d.type]);
  if (advice.length === 0) advice.push(ADVICE.good);

  return {
    score,
    grade: toGrade(score),
    total,
    calorie: total.calorie,
    targetKcal,
    kcalRate,
    ratio,
    advice,
  };
}

function toGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

function addDeduction(list, type, points) {
  if (points > 0) list.push({ type, points });
}

// 비율이 [min, max] 밖으로 나간 만큼 1%p당 1점, 최대 cap점
function addRangeDeduction(list, name, value, min, max, cap) {
  if (value > max) addDeduction(list, `${name}High`, Math.min(cap, value - max));
  else if (value < min) addDeduction(list, `${name}Low`, Math.min(cap, min - value));
}

// 조언 문장: **…** 로 감싼 부분은 화면에서 강조(초록 굵은 글씨)한다
const ADVICE = {
  calorieHigh: '한 끼 목표보다 **열량이 많아요**. 밥이나 면의 양을 조금 줄여 보세요.',
  calorieLow: '한 끼 목표보다 **열량이 적어요**. 단백질 반찬을 하나 더해 보세요.',
  carbHigh: '**탄수화물 비율이 높아요**. 밥 양을 줄이고 채소 반찬을 늘려 보세요.',
  carbLow: '**탄수화물이 부족해요**. 잡곡밥이나 고구마를 곁들여 보세요.',
  proteinHigh: '**단백질 비율이 높아요**. 채소와 곡류를 함께 드세요.',
  proteinLow: '**단백질이 부족해요**. 달걀, 두부, 생선을 곁들여 보세요.',
  fatHigh: '**지방 비율이 높아요**. 튀김·볶음 대신 찜이나 구이를 골라 보세요.',
  fatLow: '**지방이 너무 적어요**. 견과류나 생선으로 좋은 지방을 보충해 보세요.',
  sodium: '**나트륨이 많아요**. 국물과 김치는 절반만 드세요.',
  sodiumHypertension: '고혈압이 있다면 **나트륨을 더 줄여야 해요**. 국물과 짠 반찬을 줄여 보세요.',
  sugar: '**당류가 많아요**. 달콤한 소스나 음료를 줄여 보세요.',
  sugarDiabetes: '당뇨가 있다면 **당류 관리가 중요해요**. 단 음식과 음료를 피해 보세요.',
  good: '**균형 잡힌 식사예요**. 지금처럼 유지하세요.',
};
