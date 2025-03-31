# 🧾 PDF 구조문 비교 뷰어 (신·구 구조문 파싱)

React.js와 Node.js, PDF.js를 활용하여 웹 애플리케이션에서 PDF 파일을 파싱하고, 신·구 구조문을 좌우 열로 정확히 분리해 보여주는 프로젝트입니다.

---

## 📁 프로젝트 구조

```
📦 pdf-application
├── client                 # 프론트엔드 (React.js)
│   ├── components         # 기능별 UI 컴포넌트
│   ├── styles             # styled-components, 공통 스타일
│   ├── App.js             # 전체 앱 구조 및 페이지 흐름
│   └── ...
├── server                 # 백엔드 (Node.js + Express)
│   ├── routes
│   │   └── parsePdf.js    # PDF 파싱 요청 처리
│   ├── utils              # PDF 파싱 유틸 함수 모음
│   └── index.js           # 서버 실행 엔트리 포인트
└── README.md              # 프로젝트 설명 문서
```

---

## ⚙️ 설치 및 실행 방법

### ✅ 1. 프로젝트 클론

```bash
git clone https://github.com/oyatplum/pdf-application.git
cd pdf-application
```

---

### ✅ 2. 백엔드 실행 (Node.js + Express)

```bash
cd server
npm install
npm start
```

> 서버는 `http://localhost:8080` 에서 실행됩니다.

---

### ✅ 3. 프론트엔드 실행 (React.js)

```bash
cd client
npm install
npm start
```

> 프론트는 `http://localhost:3000` 에서 확인할 수 있습니다.

---

## 🚀 전체 실행 흐름

1. 사용자가 PDF 파일을 업로드
2. PDF.js를 활용하여 미리보기 제공
3. "파싱 실행" 버튼 클릭 시 백엔드로 PDF 전송
4. 백엔드는 PDF의 좌우 열을 구분하고, 조문 단위로 블록을 나눠 파싱
5. JSON 형태로 파싱된 결과를 프론트로 반환
6. 프론트에서 신·구 구조문을 전달받은 이미지와 같이 배열로 보여줌

---

## 🧠 주요 기능

- ✅ PDF 파일 업로드 및 미리보기 (canvas + PDF.js)
- ✅ '신·구조문대비표' 섹션부터 파싱 시작
- ✅ 좌우 열 텍스트를 X 좌표 기준으로 구분
- ✅ 조문 블록 단위로 파싱 (ex. `제X조`, `①`, `1.` 등)
- ✅ Y 좌표 기반으로 블록 정렬 및 좌/우 매칭
- ✅ 파싱 결과를 `[왼쪽 배열, 오른쪽 배열]`로 반환 및 시각화

---

## 📌 사용 기술 스택

| 영역        | 기술                          |
| ----------- | ----------------------------- |
| 프론트엔드  | React.js, styled-components   |
| 백엔드      | Node.js, Express.js           |
| PDF 파싱    | PDF.js (`pdfjs-dist`)         |
| 파일 업로드 | multer                        |
| 기타        | canvas, FileReader, fetch API |

---

## 📄 PDF 파싱 예시

> `신·구 구조문대비표`가 포함된 의안 PDF를 기준으로 정확히 동작합니다.

- 예시 파일: `2100113_의사국 의안과_의안원문.pdf`

---

## 🙋‍♀️ 만든이

- 이름: 이예지
- 이메일: oyatpeach@naver.com

---
