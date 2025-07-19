const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 콘솔 로그 및 오류 캡처
  page.on('console', (msg) => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', (error) => {
    console.error('페이지 오류:', error);
  });
  
  try {
    console.log('🔍 콘솔 오류 확인 시작...');
    
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');
    
    // 10초 대기하여 모든 로그 확인
    await page.waitForTimeout(10000);
    
    // 개발자 도구 네트워크 탭 확인
    const requests = [];
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method()
      });
    });
    
    page.on('response', (response) => {
      if (!response.ok()) {
        console.error(`HTTP 오류: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('✅ 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();