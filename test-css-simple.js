const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🎨 CSS 간단 테스트 시작...');
    
    // 더 관대한 타임아웃으로 접속
    await page.goto('http://localhost:3010', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);
    
    console.log('✅ 페이지 로딩 완료');
    
    // 페이지 제목 확인
    const pageTitle = await page.title();
    console.log(`📄 페이지 제목: ${pageTitle}`);
    
    // 메인 제목 존재 확인
    const hasMainTitle = await page.locator('h1').isVisible();
    console.log(`${hasMainTitle ? '✅' : '❌'} 메인 제목 존재: ${hasMainTitle}`);
    
    // 기본 스타일 확인
    const basicStyles = await page.evaluate(() => {
      const body = document.body;
      const title = document.querySelector('h1');
      
      return {
        bodyBackground: window.getComputedStyle(body).backgroundColor,
        bodyColor: window.getComputedStyle(body).color,
        titleExists: !!title,
        titleText: title ? title.textContent : null,
        titleColor: title ? window.getComputedStyle(title).color : null,
        titleSize: title ? window.getComputedStyle(title).fontSize : null
      };
    });
    
    console.log('\n🎨 기본 스타일 확인:');
    console.log(`Body 배경: ${basicStyles.bodyBackground}`);
    console.log(`Body 텍스트: ${basicStyles.bodyColor}`);
    console.log(`제목 존재: ${basicStyles.titleExists}`);
    console.log(`제목 텍스트: ${basicStyles.titleText}`);
    console.log(`제목 색상: ${basicStyles.titleColor}`);
    console.log(`제목 크기: ${basicStyles.titleSize}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'css-simple-test.png',
      fullPage: true 
    });
    console.log('📸 CSS 간단 테스트 스크린샷 저장: css-simple-test.png');
    
    console.log('\n🎉 CSS 테스트 완료!');
    
  } catch (error) {
    console.error('❌ CSS 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();