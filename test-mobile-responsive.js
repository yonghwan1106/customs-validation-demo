const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📱 모바일 반응형 테스트 시작...');
    
    // 다양한 모바일 화면 크기 테스트
    const devices = [
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'Galaxy S21', width: 360, height: 800 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Tablet', width: 1024, height: 768 }
    ];
    
    await page.goto('http://localhost:3008', { waitUntil: 'domcontentloaded' });
    
    for (const device of devices) {
      console.log(`\n📱 ${device.name} (${device.width}x${device.height}) 테스트:`);
      
      // 화면 크기 변경
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(2000);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `mobile-${device.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
      console.log(`📸 스크린샷 저장: mobile-${device.name.toLowerCase().replace(' ', '-')}.png`);
      
      // 주요 요소들 확인
      const elements = [
        { selector: 'h1', name: '메인 제목' },
        { selector: '.tour-validation-button', name: '검증 버튼' },
        { selector: '.tour-fta-button', name: 'FTA 버튼' },
        { selector: '.tour-dashboard', name: '대시보드' },
        { selector: '.tour-features', name: '기능 그리드' },
        { selector: '[title="가이드 투어 시작"]', name: '투어 버튼' }
      ];
      
      for (const element of elements) {
        const isVisible = await page.locator(element.selector).isVisible();
        console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible ? '표시됨' : '숨겨짐'}`);
      }
      
      // 텍스트 가독성 확인
      const textElements = await page.locator('h1, h2, h3, p').all();
      let readableCount = 0;
      for (const textEl of textElements) {
        const fontSize = await textEl.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return parseInt(styles.fontSize);
        });
        if (fontSize >= 14) readableCount++;
      }
      console.log(`📖 읽기 가능한 텍스트: ${readableCount}/${textElements.length}`);
      
      // 터치 친화적 요소 확인
      const buttons = await page.locator('button').all();
      let touchFriendlyCount = 0;
      for (const button of buttons) {
        const rect = await button.boundingBox();
        if (rect && rect.width >= 44 && rect.height >= 44) {
          touchFriendlyCount++;
        }
      }
      console.log(`👆 터치 친화적 버튼: ${touchFriendlyCount}/${buttons.length}`);
    }
    
    console.log('\n🎉 모바일 반응형 분석 완료!');
    console.log('✅ 다양한 모바일 기기에서 스크린샷 촬영');
    console.log('✅ 주요 UI 요소 표시 상태 확인');
    console.log('✅ 텍스트 가독성 분석');
    console.log('✅ 터치 친화적 요소 분석');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();