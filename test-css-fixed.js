const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🎨 CSS 수정 후 재테스트 시작...');
    
    // 새로운 포트로 접속
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('✅ 페이지 로딩 완료');
    
    // CSS 파일 로드 상태 확인
    const stylesheets = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(link => ({
        href: link.href,
        loaded: link.sheet !== null
      }));
    });
    
    console.log('\n📝 로드된 CSS 파일들:');
    stylesheets.forEach(sheet => {
      console.log(`${sheet.loaded ? '✅' : '❌'} ${sheet.href}`);
    });
    
    // 메인 제목 스타일 확인
    const titleStyle = await page.evaluate(() => {
      const title = document.querySelector('h1');
      if (!title) return null;
      
      const computedStyle = window.getComputedStyle(title);
      return {
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        classes: title.className,
        textContent: title.textContent
      };
    });
    
    console.log('\n🎨 메인 제목 스타일:');
    if (titleStyle) {
      console.log(`제목: ${titleStyle.textContent}`);
      console.log(`클래스: ${titleStyle.classes}`);
      console.log(`폰트 크기: ${titleStyle.fontSize}`);
      console.log(`폰트 굵기: ${titleStyle.fontWeight}`);
      console.log(`색상: ${titleStyle.color}`);
      console.log(`배경: ${titleStyle.backgroundColor}`);
      console.log(`배경 이미지: ${titleStyle.backgroundImage}`);
    }
    
    // 배경 색상 확인
    const bodyStyle = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        classes: body.className
      };
    });
    
    console.log('\n🎨 Body 스타일:');
    console.log(`Body 클래스: ${bodyStyle.classes}`);
    console.log(`배경 색상: ${bodyStyle.backgroundColor}`);
    console.log(`배경 이미지: ${bodyStyle.backgroundImage}`);
    
    // 메인 컨테이너 스타일 확인
    const containerStyle = await page.evaluate(() => {
      const container = document.querySelector('div[class*="min-h-screen"]');
      if (!container) return null;
      
      const computedStyle = window.getComputedStyle(container);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        classes: container.className
      };
    });
    
    console.log('\n🎨 메인 컨테이너 스타일:');
    if (containerStyle) {
      console.log(`컨테이너 클래스: ${containerStyle.classes}`);
      console.log(`배경 색상: ${containerStyle.backgroundColor}`);
      console.log(`배경 이미지: ${containerStyle.backgroundImage}`);
    }
    
    // 버튼 스타일 확인
    const buttonStyle = await page.evaluate(() => {
      const button = document.querySelector('button, a[href="/validation"]');
      if (!button) return null;
      
      const computedStyle = window.getComputedStyle(button);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        color: computedStyle.color,
        padding: computedStyle.padding,
        borderRadius: computedStyle.borderRadius,
        classes: button.className
      };
    });
    
    console.log('\n🎨 버튼 스타일:');
    if (buttonStyle) {
      console.log(`버튼 클래스: ${buttonStyle.classes}`);
      console.log(`배경 색상: ${buttonStyle.backgroundColor}`);
      console.log(`배경 이미지: ${buttonStyle.backgroundImage}`);
      console.log(`텍스트 색상: ${buttonStyle.color}`);
      console.log(`패딩: ${buttonStyle.padding}`);
      console.log(`모서리 반지름: ${buttonStyle.borderRadius}`);
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'css-fixed-test.png',
      fullPage: true 
    });
    console.log('📸 CSS 수정 후 스크린샷 저장: css-fixed-test.png');
    
    // 데스크톱과 모바일 둘 다 테스트
    console.log('\n📱 모바일 뷰 테스트...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'css-fixed-mobile.png',
      fullPage: true 
    });
    console.log('📸 모바일 뷰 스크린샷 저장: css-fixed-mobile.png');
    
    console.log('\n🎉 CSS 수정 완료!');
    
  } catch (error) {
    console.error('❌ CSS 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();