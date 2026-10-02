// 식단 목록 + 하루 영양 요약 (docs/화면설계.md 6-1)
// 주소에 ?date=2026-10-02가 있으면 그 날짜로 걸러서 시작한다 (메인의 '영양 상세 보기')

import { requireLogin } from '../core/auth.js';
import { today, pageUrl, getQueryParam } from '../core/utils.js';
import { $, initLayout, fillFields, fillForm, readForm, renderList, setBar } from '../core/ui.js';
import { getMeals } from '../services/mealService.js';
import { analyzeMeal, analyzeDay } from '../services/analysisService.js';

if (requireLogin()) {
  const user = initLayout();
  const filter = $('#meal-filter');
  const render = () => {
    const values = readForm(filter);
    renderMeals(user, values);
    renderDaySummary(user, values.date || today());
  };

  fillForm(filter, { date: getQueryParam('date') ?? '' });
  filter?.addEventListener('change', render);
  filter?.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  render();
}

// filter: { date, mealType } (빈 값이면 전체)
function renderMeals(user, filter) {
  renderList($('#meal-list'), $('#meal-item'), getMeals(filter), {
    empty: $('#meal-empty'),
    toFields: (meal) => {
      const analysis = analyzeMeal(meal, user);
      return {
        link: pageUrl(`meal-detail.html?id=${meal.mealId}`),
        date: meal.date,
        mealType: meal.mealType,
        foodNames: summarizeFoodNames(meal.foods),
        calorie: analysis.calorie,
        score: analysis.score,
        grade: analysis.grade,
      };
    },
  });
}

// 하루 영양 요약 (#day-summary): 날짜 필터가 있으면 그날, 없으면 오늘
function renderDaySummary(user, date) {
  const box = $('#day-summary');
  if (!box) return;
  const meals = getMeals({ date });
  const day = analyzeDay(meals, user);

  fillFields(box, {
    summaryDate: date === today() ? '오늘' : date,
    mealCount: meals.length,
    targetKcal: day.targetKcal,
    kcalRate: day.kcalRate,
    ...day.total,
  });
  setBar($('#day-kcal', box), day.kcalRate);
  ['carb', 'protein', 'fat'].forEach((key) => {
    const el = $(`#day-macro-${key}`, box);
    fillFields(el, { value: day.ratio[key] });
    setBar(el, day.ratio[key]);
  });
}

// '현미밥, 스크램블드에그 외 1개'
function summarizeFoodNames(foods) {
  const names = foods.slice(0, 2).map((f) => f.foodName).join(', ');
  return foods.length > 2 ? `${names} 외 ${foods.length - 2}개` : names;
}
