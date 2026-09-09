document.addEventListener("DOMContentLoaded", () => {
  const config = window.INVITATION_CONFIG;

  if (!config) {
    console.error("Configuration file (config.js) not loaded!");
    return;
  }

  const hasKakaoKey = config.KAKAO_MAP_JS_KEY && config.KAKAO_MAP_JS_KEY !== "YOUR_KAKAO_MAP_JS_KEY";
  const hasTmapKey = config.TMAP_APP_KEY && config.TMAP_APP_KEY !== "YOUR_TMAP_APP_KEY";

  const apiWarning = document.getElementById("api-warning");
  const mapLoader = document.getElementById("map-loader");
  const mapContainer = document.getElementById("map");
  const btnKakaoNav = document.getElementById("btn-kakao-nav");
  const btnTmapNav = document.getElementById("btn-tmap-nav");

  // 1. Show API key warnings if key is missing
  if (!hasKakaoKey || !hasTmapKey) {
    if (apiWarning) {
      apiWarning.style.display = "block";
    }
  }

  // 2. Set Kakao Map Details Link
  // If KAKAO_PLACE_URL is configured, use it directly (opens Kakao Map Place Details).
  // Otherwise, fallback to coordinate-based route web link.
  const kakaoWebUrl = config.KAKAO_PLACE_URL || `https://map.kakao.com/link/to/${encodeURIComponent(config.PLACE_NAME)},${config.LATITUDE},${config.LONGITUDE}`;
  btnKakaoNav.href = kakaoWebUrl;

  // 3. Set Tmap Link Navigation Logic
  btnTmapNav.addEventListener("click", (e) => {
    e.preventDefault();

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (hasTmapKey) {
      // If Tmap API Key is configured, use the official TMAP App Routes web link.
      // This automatically redirects to the app or guides user to download.
      const tmapApiUrl = `https://apis.openapi.sk.com/tmap/app/routes?appKey=${config.TMAP_APP_KEY}&name=${encodeURIComponent(config.PLACE_NAME)}&lon=${config.LONGITUDE}&lat=${config.LATITUDE}`;
      window.location.href = tmapApiUrl;
    } else {
      // Fallback: If Tmap Key is not set, try to launch the Tmap app directly using custom URL scheme (Mobile only).
      if (isMobile) {
        const tmapAppUrl = `tmap://route?rGoName=${encodeURIComponent(config.PLACE_NAME)}&rGoX=${config.LONGITUDE}&rGoY=${config.LATITUDE}`;
        window.location.href = tmapAppUrl;
        
        // Brief timeout in case app is not installed, redirect to app store
        setTimeout(() => {
          if (confirm("TMAP이 열리지 않나요? 앱 다운로드 페이지로 이동하시겠습니까?")) {
            const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            window.location.href = isiOS 
              ? "https://apps.apple.com/app/id431589174" 
              : "market://details?id=com.skt.tmap.ku";
          }
        }, 1500);
      } else {
        alert("PC 환경에서는 TMAP 길찾기 앱을 실행할 수 없습니다.\n카카오맵 자세히 보기 버튼을 이용해 주시거나, 모바일에서 접속해 주세요!");
      }
    }
  });

  // 4. Load Kakao Map JS SDK Dynamically if Key is Set
  if (hasKakaoKey) {
    loadKakaoMapScript(config.KAKAO_MAP_JS_KEY);
  } else {
    // Show a beautiful offline/fallback map card when key is not configured
    displayFallbackMap();
  }

  function loadKakaoMapScript(appkey) {
    const script = document.createElement("script");
    // autoload=false is required when loading dynamically or using module script types
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      kakao.maps.load(() => {
        initializeMap();
      });
    };

    script.onerror = () => {
      console.error("Failed to load Kakao Map SDK. Checking network or API key authorization.");
      displayFallbackMap("지도를 로드할 수 없습니다.<br>API 키 또는 도메인 등록을 확인해 주세요.");
    };

    document.head.appendChild(script);
  }

  function initializeMap() {
    // Hide loader
    if (mapLoader) {
      mapLoader.style.opacity = "0";
      setTimeout(() => mapLoader.style.display = "none", 500);
    }

    const mapOption = {
      center: new kakao.maps.LatLng(config.LATITUDE, config.LONGITUDE), // Center of map
      level: 3 // Zoom level
    };

    const map = new kakao.maps.Map(mapContainer, mapOption);

    // Map controls
    const mapTypeControl = new kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // Create marker
    const markerPosition = new kakao.maps.LatLng(config.LATITUDE, config.LONGITUDE);
    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map: map
    });

    // Custom Styled Info Window Content
    const iwContent = `
      <div style="padding:10px; width:200px; font-family:var(--font-sans); font-size:12px; line-height:1.5; color:var(--color-text-dark);">
        <strong style="display:block; font-size:13px; color:var(--color-primary-dark); margin-bottom:4px;">${config.PLACE_NAME}</strong>
        <span style="color:var(--color-text-light);">${config.ADDRESS}</span>
      </div>
    `;

    const infowindow = new kakao.maps.InfoWindow({
      content: iwContent,
      removable: false
    });

    infowindow.open(map, marker);

    // Center map on resize/orientation change
    window.addEventListener("resize", () => {
      map.setCenter(markerPosition);
    });
  }

  function displayFallbackMap(message = "지도 API 키 미등록 상태입니다.<br>아래 '카카오맵' 버튼을 누르시면 지도를 확인하실 수 있습니다.") {
    if (mapLoader) {
      mapLoader.style.display = "none";
    }

    mapContainer.style.background = "#F4EFEB";
    mapContainer.style.display = "flex";
    mapContainer.style.flexDirection = "column";
    mapContainer.style.justifyContent = "center";
    mapContainer.style.alignItems = "center";
    mapContainer.style.textAlign = "center";
    mapContainer.style.padding = "20px";
    
    // Add clickable styling
    mapContainer.style.cursor = "pointer";
    mapContainer.addEventListener("click", () => {
      window.open(kakaoWebUrl, "_blank");
    });

    mapContainer.innerHTML = `
      <div style="color: var(--color-primary); margin-bottom: 12px;">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446 6.002-3.001a1.125 1.125 0 0 0 .597-.998V6.023a1.125 1.125 0 0 0-1.602-.997l-5.002 2.5a1.125 1.125 0 0 1-1.002 0l-5-2.5a1.125 1.125 0 0 0-1.002 0l-5 2.5A1.125 1.125 0 0 0 2.25 6v11.75a1.125 1.125 0 0 0 .598.998l6.002 3.001a1.125 1.125 0 0 0 1.002 0l5-2.5a1.125 1.125 0 0 1 1.002 0Z"></path>
        </svg>
      </div>
      <div style="font-size: 13px; line-height: 1.6; color: var(--color-text-light); font-family: var(--font-sans);">
        ${message}
      </div>
    `;
  }

  // 5. Donation Account Copy Logic
  const btnCopyAccount = document.getElementById("btn-copy-account");
  const accountNumberEl = document.getElementById("account-number");
  const toastEl = document.getElementById("toast");

  if (btnCopyAccount && accountNumberEl) {
    btnCopyAccount.addEventListener("click", () => {
      const textToCopy = accountNumberEl.innerText.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast("계좌번호가 복사되었습니다.");
        }).catch(() => {
          fallbackCopy(textToCopy);
        });
      } else {
        fallbackCopy(textToCopy);
      }
    });
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("계좌번호가 복사되었습니다.");
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.innerText = msg;
    toastEl.classList.add("show");
    setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2500);
  }
});
