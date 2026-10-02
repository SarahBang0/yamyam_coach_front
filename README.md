# YamYam (냠냠코치) — Front

식단을 기록하면 한 끼·하루 단위로 영양을 분석하고, 몸무게·목표·질환에 맞는 식단을 추천해 주는 웹 앱입니다.
서버 없이 브라우저 **LocalStorage**에 데이터를 저장합니다.

## 실행 방법

JS가 ES 모듈(`import`/`export`)이라 **파일을 더블클릭해서 열면(`file://`) 동작하지 않습니다.**
VS Code의 **Live Server** 확장 같은 로컬 서버로 `index.html`을 여세요.

> Windows에서 `python -m http.server`로 열면 JS 파일이 `text/plain`으로 전달돼 스크립트가 동작하지 않을 수 있습니다. Live Server를 권장합니다.

처음 실행하면 더미 회원·식단이 LocalStorage에 자동으로 들어갑니다.
처음 상태로 되돌리려면 개발자도구 → Application → Local Storage를 비우고 새로고침하세요.

| 테스트 계정 | 비밀번호 | 비고 |
|---|---|---|
| `demo` | `pass1234` | 고혈압, 9/30·10/1 식단 있음 |
| `hello` | `hello` | |
| `test` | `test` | |

## 화면

| 화면 | 파일 | 내용 |
|---|---|---|
| 메인 | `index.html` | 로그인 전: 로그인·회원가입 / 로그인 후: 오늘의 섭취량(%), 응원 문구, 섭취량 상세 보기, + 식단 등록 |
| 로그인 | `pages/login.html` | 비밀번호 보기, 로그인 후 원래 가려던 화면으로 이동 |
| 회원가입 | `pages/signup.html` | 아이디 중복 확인, 질환(여러 개), 목표(감량·유지·증량), 가입 후 자동 로그인 |
| 식단 기록 | `pages/meal-list.html` | 날짜 이동(YamYam 달력), 그날 영양 요약(열량·탄단지·나트륨·당류), 식사 목록 |
| 식단 등록·수정 | `pages/meal-form.html` | 음식 검색·담기, 음식 직접 입력, 날짜·끼니 선택 (`?id=`가 있으면 수정) |
| 식단 분석 | `pages/meal-detail.html` | 점수·등급, 조언, 탄단지 비율, 먹은 음식 표, 수정·삭제 |
| 추천식단 | `pages/recommend.html` | 끼니별 추천 TOP 3, 오늘 남은 열량, 바로 기록하기 |
| 프로필 | `pages/mypage.html` | 내 정보(BMI·하루 권장 열량), 정보·목표·질환·비밀번호 수정, 회원 탈퇴 |

화면 전환은 부드럽게 이어지고(내용이 사라졌다 떠오름), 메인 ↔ 로그인·회원가입 사이에서는 접시가 미끄러지며 90도 도는 전환 효과가 있습니다.

## 주요 계산 규칙

| 항목 | 규칙 | 위치 |
|---|---|---|
| 하루 권장 열량 | 몸무게 × (감량 25 / 유지 30 / 증량 35), 최소 1,200kcal | `analysisService.calcTargetKcal` |
| 한 끼 목표 열량 | 하루 권장 ÷ 3 (간식은 ÷ 10) | `analysisService.analyzeMeal` |
| 한 끼 점수 | 100점에서 감점: 열량(목표 ±10% 밖), 탄단지 비율(55~65 / 7~20 / 15~30%), 나트륨, 당류. 고혈압은 나트륨, 당뇨는 당류 감점 2배 | `analysisService.analyzeMeal` |
| 등급 | A 90↑ · B 75↑ · C 60↑ · D | `analysisService` |
| BMI | 저체중 < 18.5 ≤ 정상 < 23 ≤ 과체중 < 25 ≤ 비만 | `analysisService.calcBMI` |
| 추천식단 | 집밥 메뉴 목록 안에서 "밥 + 국·찌개 + 메인 반찬 + 채소 반찬 1~2(김치 하나까지)" 또는 한 그릇 요리로 조합 → 점수순, 밥·국·메인 반찬이 겹치지 않게 3개 | `recommendService` |

## 폴더 구조

```
index.html                 메인 (로그인 전·후 화면이 한 파일에 data-auth로 나뉨)
pages/                     나머지 화면
css/common.css             공통 스타일 (색 팔레트, 헤더, 버튼, 입력칸, 달력, 화면 전환)
css/pages/                 화면별 스타일
assets/img/                접시 사진(plate-cutlery.webp), 반짝 표시(sparks.svg)
docs/화면설계.md            HTML ↔ JS 약속 (id, name, data-field 등)

js/core/                   공통 기반
  auth.js                  로그인 상태, requireLogin / requireGuest
  storage.js               LocalStorage 읽기·쓰기 (여기서만 localStorage 접근), 최초 더미 데이터 넣기
  validator.js             입력값 검사
  constants.js             저장 키, 끼니, 질환, 목표, 메시지
  utils.js                 날짜, 반올림, 숫자 쉼표, 주소 계산, 질환 목록 변환
  ui.js                    화면 공통 도우미 (data-field 채우기, 목록 그리기, 폼 읽기·채우기, 오류 표시, 화면 전환 go())
  datepicker.js            YamYam 달력
js/services/               기능 로직 — 화면(DOM)은 만지지 않고 결과만 돌려줌
  userService.js           회원가입·조회·수정·탈퇴
  mealService.js           식단 작성·목록·상세·수정·삭제 (본인 것만)
  foodService.js           음식 검색·분류별 둘러보기·직접 입력
  analysisService.js       영양 합계, 한 끼·하루 분석, BMI, 권장 열량
  recommendService.js      식단 추천
js/pages/                  화면별 스크립트 (DOM을 다루고 services를 호출)
js/data/
  foods.js                 음식 DB (자동 생성, 직접 고치지 말 것)
  foods.csv                음식 DB 원본 (식약처 음식 DB, 탭 구분)
  dummy.js                 초기 더미 회원·식단·직접 입력 음식
tools/build-foods.mjs      foods.csv → foods.js 변환 스크립트
```

## 음식 DB 바꾸기

`js/data/foods.csv`를 새 파일로 바꾼 뒤 프로젝트 폴더에서 실행합니다.

```bash
node tools/build-foods.mjs
```

- 필요한 열: 식품코드, 식품명, 식품대분류명, 영양성분함량기준량, 에너지(kcal), 탄수화물(g), 단백질(g), 지방(g), 나트륨(mg), 당류(g), 식품중량(=1회 제공량)
- 영양값은 100g(또는 100ml) 기준, 빈 칸은 0으로 처리합니다.
- 같은 이름의 음식은 하나만 남깁니다(g 단위 일반 1인분 우선). 현재 14,751개 → 11,231개
- 화면 코드는 고칠 필요 없습니다. 브라우저 Local Storage를 비우고 새로고침하세요.

## 데이터 형식 (LocalStorage)

| 키 | 내용 |
|---|---|
| `nn_users` | `{ userId, password, name, height, weight, diseaseInfo: ['고혈압', '당뇨'], goal: '감량'\|'유지'\|'증량', active }` |
| `nn_meals` | `{ mealId, userId, date: 'YYYY-MM-DD', mealType: '아침'\|'점심'\|'저녁'\|'간식', foods: [{ foodName, calorie, carbohydrate, protein, fat, sodium, sugar }] }` (음식 값은 1회분) |
| `nn_customFoods` | 직접 입력 음식 `{ foodName, calorie, … }` (1회분) |
| `nn_session` | 로그인한 회원 `{ userId }` |

- `diseaseInfo`는 예전 형식(`'고혈압'`, `'없음'` 문자열)도 그대로 읽습니다.
- `goal`이 없는 회원은 '유지'로 계산합니다.
- 회원 탈퇴는 데이터를 지우지 않고 `active: false`로 바꿉니다.

## HTML ↔ JS 연결 규칙

자세한 내용은 [`docs/화면설계.md`](docs/화면설계.md)에 있습니다. 핵심만 정리하면:

- 스크립트는 `<script type="module" src="…/js/pages/xxx.js">`로 불러옵니다.
- 입력칸 `name`은 서비스 함수의 필드 이름과 같게 씁니다 (`userId`, `mealType`, `goal` …).
- JS가 값을 넣을 자리: `data-field="필드명"` / 오류 메시지 자리: `data-error="필드명"` (폼 전체 오류는 `data-error="form"`)
- 반복 목록은 `<template>`으로 한 줄 모양을 만들어 둡니다.
- 로그인 여부에 따라 보일 영역: `data-auth="member"` / `data-auth="guest"`
- 보이기·숨기기는 `hidden` 속성을 씁니다.
- 체크박스 묶음(질환)의 '없음' 칸에는 `data-exclusive`를 붙입니다.
- 비밀번호 보기 버튼: `data-action="toggle-password"`
- 로그인 화면은 반드시 `pages/login.html`이어야 합니다.

## 서비스 함수 결과 형식

저장·수정·삭제 함수는 아래 형식 중 하나를 돌려줍니다.

```js
{ ok: true, data }                        // 성공
{ ok: false, errors: { 필드명: '메시지' } }  // 입력값 오류 → 각 입력칸 아래에 표시
{ ok: false, message: '메시지' }            // 그 밖의 오류 (로그인 필요, 권한 없음 등)
```

| 파일 | 주요 함수 |
|---|---|
| `core/auth.js` | `login`, `logout`, `getCurrentUser`, `isLoggedIn`, `requireLogin`, `requireGuest` |
| `services/userService.js` | `createUser`, `getUser`, `updateUser`, `deactivateUser`, `isUserIdTaken` |
| `services/mealService.js` | `createMeal`, `getMeals`, `getMealById`, `updateMeal`, `deleteMeal` |
| `services/foodService.js` | `searchFoods`, `getFoodCategories`, `browseFoods`, `addCustomFood`, `getCustomFoods`, `toMealFood` |
| `services/analysisService.js` | `analyzeMeal`, `analyzeDay`, `sumNutrition`, `calcMacroRatio`, `calcBMI`, `calcTargetKcal` |
| `services/recommendService.js` | `recommendMeals`, `getNextMealType` |
| `core/datepicker.js` | `setupDatePickers`, `setDateValue`, `formatDateLabel` |

## 디자인 기준

- **색**: `css/common.css`의 `:root` 변수만 씁니다. 배경 `--bg`, 영역 `--surface`(연한 세이지), 강조 `--green` 계열, 글자 `--text` / `--text-sub` / `--text-muted`
- **박스**: 테두리 선 없이 배경색으로 구분, 흰 박스에는 `--card-shadow`
- **입력칸**: 흰 바탕 + 안쪽 그림자(`--field-shade`)
- **글씨 굵기**: 핵심 숫자 800 · 제목/주요 버튼 700 · 라벨 500 · 본문 400 · 설명·단위 300 (Pretendard), 로고는 Fredoka
- **반응형**: 메인의 접시·글씨는 화면 크기에 비례해서 커지고, 860px 이하에서는 로그인·회원가입의 접시를 숨깁니다.

## 역할 분담

- **HTML / CSS**: `index.html`, `pages/`, `css/`, `assets/`
- **JS**: `js/`, `tools/`
