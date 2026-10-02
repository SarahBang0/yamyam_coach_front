// 식단 목록 + 하루 영양 요약 (docs/화면설계.md 6-1)
// 주소에 ?date=2026-10-02가 있으면 그 날짜로 걸러서 시작한다 (메인의 '영양 상세 보기')

import { requireLogin } from '../core/auth.js';
import { today, pageUrl, getQueryParam } from '../core/utils.js';
import { $, initLayout, fillFields, fillForm, readForm, renderList, setBar } from '../core/ui.js';
import { setDateValue } from '../core/datepicker.js';
import { getMeals } from '../services/mealService.js';
import { analyzeMeal, analyzeDay } from '../services/analysisService.js';

if (requireLogin()) {
  const user = initLayout();
  const filter = $('#meal-filter');
  const picker = $('[data-datepicker]', filter);
  const render = () => {
    const date = readForm(filter).date || today();
    renderMeals(user, { date });
    renderDaySummary(user, date);
    // 오늘보다 뒤로는 갈 수 없다
    const next = $('#date-next');
    if (next) next.disabled = date >= today();
  };

  // 기록이 있는 날에 달력 점 표시
  if (picker) picker.markedDates = new Set(getMeals().map((meal) => meal.date));
  fillForm(filter, { date: getQueryParam('date') ?? today() });

  filter?.addEventListener('change', render);
  filter?.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  $('#date-prev')?.addEventListener('click', () => moveDate(picker, -1));
  $('#date-next')?.addEventListener('click', () => moveDate(picker, 1));
  render();
}

// 하루 앞·뒤로 이동
function moveDate(picker, days) {
  if (!picker) return;
  const [y, m, d] = picker.querySelector('input').value.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  if (value <= today()) setDateValue(picker, value);
}

// filter: { date, mealType } (빈 값이면 전체)
function renderMeals(user, filter) {
  // 하루 화면이므로 아침 → 간식 순서로 (getMeals는 같은 날이면 간식부터)
  renderList($('#meal-list'), $('#meal-item'), getMeals(filter).reverse(), {
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

// 하루 영양 요약 (#day-summary)
function renderDaySummary(user, date) {
  const box = $('#day-summary');
  if (!box) return;
  const meals = getMeals({ date });
  const day = analyzeDay(meals, user);

  fillFields(document, { mealCount: meals.length });
  fillFields(box, {
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
