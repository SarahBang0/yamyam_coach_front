// 식단 목록 (docs/화면설계.md 6-1)

import { requireLogin } from '../core/auth.js';
import { pageUrl } from '../core/utils.js';
import { $, initLayout, readForm, renderList } from '../core/ui.js';
import { getMeals } from '../services/mealService.js';
import { analyzeMeal } from '../services/analysisService.js';

if (requireLogin()) {
  const user = initLayout();
  const filter = $('#meal-filter');
  const render = () => renderMeals(user, readForm(filter));

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

// '현미밥, 스크램블드에그 외 1개'
function summarizeFoodNames(foods) {
  const names = foods.slice(0, 2).map((f) => f.foodName).join(', ');
  return foods.length > 2 ? `${names} 외 ${foods.length - 2}개` : names;
}
