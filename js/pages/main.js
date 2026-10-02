// 메인 (docs/화면설계.md 7장)
// 비회원 영역은 HTML만으로 충분하고, 회원이면 오늘의 식단 요약을 채운다

import { today, round, pageUrl } from '../core/utils.js';
import { $, initLayout, fillFields, renderList, setLink } from '../core/ui.js';
import { getMeals } from '../services/mealService.js';
import { analyzeMeal, calcTargetKcal } from '../services/analysisService.js';

// 접시 전환(메인 ↔ 로그인·회원가입) 설정: 아래 함수들이 쓰므로 실행 코드보다 먼저 둔다
const PLATE_TIMING = { duration: 850, easing: 'cubic-bezier(0.65, 0, 0.25, 1)' };
let leaveAnimations = [];

const user = initLayout();
if (user) renderToday(user);
else setupPlateTransition();
playPlateArrival();

function renderToday(user) {
  // getMeals는 같은 날이면 간식→아침 순이라, 오늘 하루는 아침부터 보이도록 뒤집는다
  const meals = getMeals({ date: today() })
    .reverse()
    .map((meal) => ({ meal, analysis: analyzeMeal(meal, user) }));

  const todayCalorie = round(meals.reduce((sum, { analysis }) => sum + analysis.calorie, 0), 1);
  const targetKcal = calcTargetKcal(user);
  const todayRate = Math.round((todayCalorie / targetKcal) * 100);
  fillFields(document, { todayCalorie, targetKcal, todayRate, todayMessage: cheerMessage(todayRate, meals.length) });
  setLink($('#nutrition-link'), pageUrl(`meal-list.html?date=${today()}`));

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

// 오늘 섭취 비율(%)에 따른 응원 문구 (화면에서는 'OO님!' 뒤에 붙는다)
// 구간과 문구는 팀 확정 전 초안
function cheerMessage(rate, mealCount) {
  if (mealCount === 0) return '오늘 첫 끼를 기록해 보세요!';
  if (rate < 50) return '든든하게 챙겨 드세요!';
  if (rate < 90) return '조금만 힘내보세요!';
  if (rate <= 110) return '딱 좋아요!';
  return '오늘은 조금 많이 드셨어요.';
}

// ───── 접시 전환 (메인 ↔ 로그인·회원가입) ─────
// 로그인 화면의 접시 자리(login.css의 .auth__visual .plate-wrap)와 같은 위치·크기·각도를 계산해서
// 나갈 때는 그 자리로 보내고, 돌아올 때는 그 자리에서 데려온다

// 로그인 전: '로그인하기'·'회원가입'을 누르면 접시가 왼쪽으로 미끄러지며 90도 돈 뒤 화면이 넘어간다
function setupPlateTransition() {
  const home = $('.home--guest');
  if (!home) return;

  document.querySelectorAll('[data-action="plate-transition"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!canAnimatePlate()) return; // 그냥 이동 (ui.js가 일반 화면 전환으로 처리)

      event.preventDefault();
      home.classList.add('home--leaving');
      leaveAnimations = animatePlate(home, 'leave');
      leaveAnimations[0].finished.then(() => {
        window.location.href = link.href;
      });
    });
  });

  // 뒤로 가기로 돌아왔는데 브라우저가 떠나던 화면을 그대로 보관하고 있었다면, 애니메이션을 거꾸로 돌려 제자리로
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !leaveAnimations.length) return;
    home.classList.remove('home--leaving');
    leaveAnimations.forEach((animation) => animation.reverse());
    leaveAnimations = [];
  });
}

// 로그인·회원가입에서 넘어왔을 때 (index.html head 스크립트가 .plate-arrive를 붙여 둠): 접시가 왼쪽에서 돌아오며 바로 선다
function playPlateArrival() {
  if (!document.documentElement.classList.contains('plate-arrive')) return;
  const home = $('.home:not([hidden])');
  const wrap = $('.plate-wrap', home);
  if (!wrap) return;
  animatePlate(home, 'arrive');
  wrap.style.visibility = 'visible';
}

function canAnimatePlate() {
  const narrow = window.innerWidth <= 860; // 좁은 화면의 로그인 화면에는 접시가 없음
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !narrow && !reduceMotion && 'animate' in Element.prototype;
}

// direction: 'leave' (가운데 → 로그인 자리) / 'arrive' (로그인 자리 → 가운데)
// 돌려받는 값: 실행 중인 애니메이션 목록 (첫 번째가 접시 위치)
function animatePlate(home, direction) {
  const wrap = $('.plate-wrap', home);
  const plate = $('.plate', wrap);
  const img = $('.plate__img', plate);
  const style = getComputedStyle(document.documentElement);

  const center = { transform: 'none', rotate: 'rotate(0deg)', shadow: style.getPropertyValue('--plate-shadow') };
  const login = { transform: loginPlateTransform(wrap), rotate: 'rotate(-90deg)', shadow: style.getPropertyValue('--plate-shadow-rotated') };
  const [from, to] = direction === 'leave' ? [center, login] : [login, center];
  const timing = { ...PLATE_TIMING, fill: direction === 'leave' ? 'forwards' : 'none' };

  return [
    wrap.animate([
      { transformOrigin: 'top left', transform: from.transform },
      { transformOrigin: 'top left', transform: to.transform },
    ], timing),
    plate.animate([{ transform: from.rotate }, { transform: to.rotate }], timing),
    img.animate([{ filter: from.shadow }, { filter: to.shadow }], timing),
  ];
}

// 가운데 접시(wrap)를 로그인 화면 접시 자리로 옮기는 transform
function loginPlateTransform(wrap) {
  const from = wrap.getBoundingClientRect();
  const size = Math.min(window.innerWidth * 0.48, window.innerHeight * 0.92); // login.css의 --plate-size
  // 65%가 보이게 35%만 화면 밖으로, 좁은 화면에서는 폼과 24px 간격 유지 (login.css의 left와 같음)
  const left = Math.min(-size * 0.35, window.innerWidth / 2 - 264 - size);
  const top = (window.innerHeight - size) / 2; // 세로 가운데
  return `translate(${left - from.left}px, ${top - from.top}px) scale(${size / from.width})`;
}
