# 냠냠코치 (Front)

식단을 기록하고 한 끼 단위로 영양을 분석해 주는 웹 앱입니다.
서버 없이 브라우저 LocalStorage에 데이터를 저장합니다.

## 실행 방법

JS 파일이 ES 모듈(`import`/`export`)이라 **파일을 더블클릭해서 열면(`file://`) 동작하지 않습니다.**
VS Code의 **Live Server** 확장 같은 로컬 서버로 `index.html`을 여세요.

처음 실행하면 더미 데이터(회원·식단)가 LocalStorage에 자동으로 들어갑니다.
처음 상태로 되돌리려면 개발자도구 → Application → Local Storage를 비우고 새로고침하세요.

| 테스트 계정 | 비밀번호 | 비고 |
|---|---|---|
| `demo` | `pass1234` | 고혈압, 식단 데이터 있음 |
| `hello` | `hello` | |
| `test` | `test` | |

## 폴더 구조

```
index.html            메인 화면
pages/                나머지 화면 (login.html 등)
css/common.css        공통 스타일 (헤더, 색상, 폰트)
css/pages/            화면별 스타일
assets/img/           이미지
js/core/              공통 기반 (저장소, 로그인, 검증, 상수, 도우미)
js/services/          기능 로직 (회원, 식단, 음식, 분석) - 화면(DOM)은 만지지 않음
js/data/dummy.js      음식 DB와 초기 더미 데이터
js/pages/             화면별 스크립트 (DOM을 다루고 services를 호출)
```

## 역할 분담

- **HTML / CSS**: `index.html`, `pages/`, `css/`, `assets/`
- **JS**: `js/`

## HTML에서 JS 불러오기

반드시 `type="module"`로 불러옵니다.

```html
<!-- index.html -->
<script type="module" src="js/pages/main.js"></script>

<!-- pages/xxx.html -->
<script type="module" src="../js/pages/xxx.js"></script>
```

- 로그인 화면은 **`pages/login.html`** 이어야 합니다. (`js/core/auth.js`가 이 경로로 이동시킵니다)
- `js/pages/*.js`가 찾는 요소의 `id`/`class`는 화면을 만들기 전에 JS 담당과 맞춰 주세요.

## 서비스 함수 결과 형식

저장·수정·삭제 함수는 모두 아래 형식 중 하나를 돌려줍니다.

```js
{ ok: true, data }                       // 성공
{ ok: false, errors: { 필드명: '메시지' } } // 입력값 오류 → 각 입력칸 아래에 표시
{ ok: false, message: '메시지' }           // 그 밖의 오류 (로그인 필요, 권한 없음 등)
```

| 파일 | 주요 함수 |
|---|---|
| `core/auth.js` | `login`, `logout`, `getCurrentUser`, `isLoggedIn`, `requireLogin`, `requireGuest` |
| `services/userService.js` | `createUser`, `getUser`, `updateUser`, `deactivateUser`, `isUserIdTaken` |
| `services/mealService.js` | `createMeal`, `getMeals`, `getMealById`, `updateMeal`, `deleteMeal` |
| `services/foodService.js` | `searchFoods`, `addCustomFood`, `getCustomFoods` |
| `services/analysisService.js` | `analyzeMeal`, `sumNutrition`, `calcBMI`, `calcTargetKcal` |
