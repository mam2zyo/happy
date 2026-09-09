# AA 부천그룹 30주년 기념 모바일 초대장

이 프로젝트는 **AA 부천그룹 30주년 기념 공개모임** 모바일 초대장 웹페이지입니다.
모바일에 최적화된 고급스러운 디자인과 카카오맵(Kakao Map) 및 티맵(TMAP) 길찾기 연동 기능을 포함하고 있습니다.

## 🛠️ 기술 스택
- **프론트엔드:** HTML5, CSS3 (Vanilla), JavaScript (ES6)
- **빌드/개발 도구:** Vite (HMR 데브서버 지원)
- **외부 연동 API:** Kakao Maps API v2 (JS), TMAP App Routes API

---

## 🔑 필수 설정 (API 키 입력)

지도 표시 및 길찾기 기능을 완벽하게 동작시키려면 API 키 등록이 필요합니다.
[js/config.js](file:///home/mam2z/project/aaic/js/config.js) 파일을 열어 아래 키를 입력해 주세요.

1. **`KAKAO_MAP_JS_KEY`**: 
   - [카카오 개발자 콘솔](https://developers.kakao.com/)에서 애플리케이션을 생성하고 **내 애플리케이션 > 앱 설정 > 앱 키**에서 **JavaScript 키**를 복사해 붙여넣습니다.
   - **중요:** 카카오 개발자 콘솔의 **플랫폼 > Web** 설정에 서비스할 도메인(로컬 테스트 시 `http://localhost:3000` 및 OCI 배포 후 도메인 주소)을 등록해야 지도가 정상 표시됩니다.
2. **`TMAP_APP_KEY`**:
   - [SK Open API 포털](https://openapi.sk.com/)에서 회원가입 후 프로젝트를 만들고 **App Key**를 발급받아 붙여넣습니다.

> [!NOTE]
> 만약 API 키를 입력하지 않더라도, 모바일에 최적화된 약도 화면(대체 화면)이 나타나며, '카카오맵 보기' 및 모바일 환경에서의 '티맵 길찾기' 버튼은 기본 URL scheme 및 웹 경로 탐색으로 자동 폴백(Fallback)되어 정상 작동합니다.

---

## 🚀 로컬 실행 방법

Vite 개발 서버를 이용해 로컬 환경에서 실행하고 실시간 변경사항을 확인할 수 있습니다.

1. **의존성 패키지 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   실행 후 브라우저에서 `http://localhost:3000` 주소로 접속합니다. Chrome 개발자 도구(F12)의 **기기 툴바(Device Toolbar)**를 켜서 모바일 화면(iPhone/Galaxy 등) 모드로 확인하시면 가장 정확합니다.

3. **배포용 빌드**
   ```bash
   npm run build
   ```
   실행 시 `dist/` 폴더 내에 최적화된 static 웹 리소스 파일들이 생성됩니다. 이 `dist` 폴더를 OCI에 배포하시면 됩니다.

---

## ☁️ OCI (Oracle Cloud Infrastructure) 배포 가이드

이 프로젝트는 정적(Static) 웹 프로젝트이므로 OCI에서 매우 저렴하고(또는 무료로) 안정적으로 배포할 수 있습니다. 대표적인 두 가지 배포 방식을 안내해 드립니다.

### 방법 1: OCI Object Storage를 통한 정적 웹사이트 호스팅 (추천 - 가장 쉽고 비용 무료)
1. **OCI 콘솔** 로그인 후 **Storage > Object Storage & Archive Storage > Buckets**로 이동합니다.
2. 버킷을 하나 생성합니다. (Visibility: **Public**으로 설정 필수)
3. 버킷 상세 페이지에서 **Static Website Hosting** 설정을 활성화하고, `index.html`을 인덱스 문서로 지정합니다.
4. 로컬에서 `npm run build`를 수행해 생성된 `dist/` 폴더 안의 모든 파일과 하위 폴더들을 해당 버킷에 업로드합니다.
5. 제공되는 Object Storage 웹 주소로 접속합니다.
6. *참고:* 카카오 개발자 콘솔 플랫폼 설정에 해당 웹 주소 도메인을 추가해야 합니다.

### 방법 2: OCI Compute VM + Nginx 구성 (커스텀 도메인 및 SSL 설정 시 추천)
1. OCI **Always Free VM 인스턴스**를 생성합니다 (Ubuntu OS 추천).
2. 인스턴스에 Nginx를 설치합니다:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```
3. 로컬에서 빌드된 `dist/` 폴더 내부의 파일을 SFTP 등을 사용해 인스턴스의 Nginx 기본 웹 경로인 `/var/www/html/` 아래에 업로드합니다.
4. OCI 수신 규칙(Ingress Rules) 보안 리스트에서 80번(HTTP) 및 443번(HTTPS) 포트를 열어줍니다.
5. 브라우저에서 인스턴스의 공인 IP 또는 연결한 커스텀 도메인으로 접속합니다.
