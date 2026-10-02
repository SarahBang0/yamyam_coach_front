// 앱 전체에서 쓰는 고정 값

// LocalStorage 키
export const STORAGE_KEYS = {
  USERS: 'nn_users',
  MEALS: 'nn_meals',
  CUSTOM_FOODS: 'nn_customFoods',
  SESSION: 'nn_session',
};

// 끼니 (저장·표시 모두 한글 그대로 사용)
export const MEAL_TYPES = ['아침', '점심', '저녁', '간식'];

// 질환 정보 (여러 개 선택 가능, 저장은 배열: [] 또는 ['고혈압', '당뇨'])
export const DISEASES = ['고혈압', '당뇨'];
export const NO_DISEASE = '없음'; // 화면에서 '해당 없음'을 고르는 값 (저장할 때는 빈 배열)

// 체중 목표 → 하루 권장 열량 = 몸무게(kg) × kcalPerKg
// 저장 값은 '감량' | '유지' | '증량', 목표가 없는 예전 회원은 '유지'로 본다
export const GOALS = {
  감량: { label: '체중 감량', kcalPerKg: 25 },
  유지: { label: '체중 유지', kcalPerKg: 30 },
  증량: { label: '체중 증량', kcalPerKg: 35 },
};
export const DEFAULT_GOAL = '유지';
export const MIN_DAILY_KCAL = 1200; // 너무 적게 먹지 않도록 하루 권장 열량의 최소값

// 식단 한 개에 들어가는 영양 필드 (meals.json의 foods 항목과 같은 이름)
export const NUTRIENT_KEYS = ['calorie', 'carbohydrate', 'protein', 'fat', 'sodium', 'sugar'];

// 공통 오류 메시지
export const MESSAGES = {
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  MEAL_NOT_FOUND: '식단을 찾을 수 없습니다.',
  USER_NOT_FOUND: '회원 정보를 찾을 수 없습니다.',
};
