const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 페이지 크기 설정 (데스크톱)
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  try {
    console.log('🔍 메인 페이지 접속 중...');
    
    // 메인 페이지 접속 (타임아웃 30초)
    await page.goto('http://localhost:3005', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(2000);
    
    // 전체 페이지 스크린샷
    console.log('📸 메인 페이지 스크린샷 촬영 중...');
    await page.screenshot({ 
      path: 'screenshot-main.png', 
      fullPage: true,
      type: 'png'
    });
    
    // 페이지 제목과 내용 확인
    const title = await page.title();
    console.log('📄 페이지 제목:', title);
    
    // CSS 스타일 적용 확인
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        fontFamily: computedStyle.fontFamily
      };
    });
    
    console.log('🎨 Body 스타일:', bodyStyles);
    
    // 특정 요소들의 스타일 확인
    const headerStyles = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;
      const computedStyle = window.getComputedStyle(header);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        backdropFilter: computedStyle.backdropFilter
      };
    });
    
    console.log('🎯 Header 스타일:', headerStyles);
    
    // Tailwind CSS 클래스 적용 확인
    const tailwindCheck = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="bg-gradient"], [class*="backdrop-blur"]');
      return {
        gradientElements: elements.length,
        classes: Array.from(elements).slice(0, 3).map(el => el.className)
      };
    });
    
    console.log('🌈 Tailwind 그라디언트 요소:', tailwindCheck);
    
    // 컨텐츠 확인
    const content = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const contestText = document.querySelector('*:contains("2025 관세청")');
      return {
        h1Text: h1?.textContent || 'H1 없음',
        hasContestText: document.body.textContent.includes('2025 관세청')
      };
    });
    
    console.log('📝 컨텐츠 확인:', content);
    
    // 검증 페이지도 테스트
    console.log('🔍 검증 페이지 접속 중...');
    await page.goto('http://localhost:3005/validation', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(1000);
    
    console.log('📸 검증 페이지 스크린샷 촬영 중...');
    await page.screenshot({ 
      path: 'screenshot-validation.png', 
      fullPage: true,
      type: 'png'
    });
    
    // FTA 계산기 페이지도 테스트
    console.log('🔍 FTA 계산기 페이지 접속 중...');
    await page.goto('http://localhost:3005/fta-calculator', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(1000);
    
    console.log('📸 FTA 계산기 페이지 스크린샷 촬영 중...');
    await page.screenshot({ 
      path: 'screenshot-fta.png', 
      fullPage: true,
      type: 'png'
    });
    
    console.log('✅ 모든 스크린샷 촬영 완료!');
    console.log('📁 파일 위치:');
    console.log('  - screenshot-main.png');
    console.log('  - screenshot-validation.png');
    console.log('  - screenshot-fta.png');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 에러 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshot-error.png', 
      fullPage: true,
      type: 'png'
    });
    
    // 페이지 HTML 내용 저장
    const html = await page.content();
    require('fs').writeFileSync('page-content.html', html);
    
    console.log('🔍 에러 디버깅 파일 생성:');
    console.log('  - screenshot-error.png');
    console.log('  - page-content.html');
  } finally {
    await browser.close();
  }
}

// 실행
captureScreenshots().catch(console.error);