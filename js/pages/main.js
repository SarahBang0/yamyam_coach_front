// 메인 (docs/화면설계.md 7장)
// 비회원 영역은 HTML만으로 충분하고, 회원이면 오늘의 식단 요약을 채운다

import { today, round, pageUrl } from '../core/utils.js';
import { $, initLayout, fillFields, renderList, setBar } from '../core/ui.js';
import { getMeals } from '../services/mealService.js';
import { analyzeMeal, calcTargetKcal } from '../services/analysisService.js';

const user = initLayout();
if (user) renderToday(user);

function renderToday(user) {
  // getMeals는 같은 날이면 간식→아침 순이라, 오늘 하루는 아침부터 보이도록 뒤집는다
  const meals = getMeals({ date: today() })
    .reverse()
    .map((meal) => ({ meal, analysis: analyzeMeal(meal, user) }));

  const todayCalorie = round(meals.reduce((sum, { analysis }) => sum + analysis.calorie, 0), 1);
  const targetKcal = calcTargetKcal(user);
  fillFields(document, { todayCalorie, targetKcal });
  setBar($('#today-progress'), (todayCalorie / targetKcal) * 100);

  renderList($('#today-meals'), $('#today-meal-item'), meals, {
    empty: $('#today-empty'),
    toFields: ({ meal, analysis }) => ({
      link: pageUrl(`meal-detail.html?id=${meal.mealId}`),
      mealType: meal.mealType,
      calorie: analysis.calorie,
      grade: analysis.grade,
    }),
  });
}
