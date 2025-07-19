const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🎨 CSS 연결 상태 디버깅 시작...');
    
    // 개발 서버 상태 확인
    await page.goto('http://localhost:3009', { waitUntil: 'domcontentloaded' });
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
    
    // Tailwind CSS 클래스 적용 확인
    const tailwindTest = await page.evaluate(() => {
      const testElement = document.querySelector('h1');
      if (!testElement) return null;
      
      const computedStyle = window.getComputedStyle(testElement);
      return {
        fontSize: computedStyle.fontSize,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        classes: testElement.className
      };
    });
    
    console.log('\n🎨 메인 제목 스타일 확인:');
    if (tailwindTest) {
      console.log(`클래스: ${tailwindTest.classes}`);
      console.log(`폰트 크기: ${tailwindTest.fontSize}`);
      console.log(`색상: ${tailwindTest.color}`);
      console.log(`배경: ${tailwindTest.backgroundColor}`);
      console.log(`배경 이미지: ${tailwindTest.backgroundImage}`);
    }
    
    // 네트워크 요청 확인
    const failedRequests = [];
    page.on('response', response => {
      if (!response.ok() && response.url().includes('.css')) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('\n🌐 CSS 네트워크 요청 실패:');
    if (failedRequests.length > 0) {
      failedRequests.forEach(req => {
        console.log(`❌ ${req.url} - ${req.status}`);
      });
    } else {
      console.log('✅ 모든 CSS 요청이 성공했습니다.');
    }
    
    // 개발 모드 확인
    const isDevelopment = await page.evaluate(() => {
      return process.env.NODE_ENV === 'development';
    });
    
    console.log(`\n🔧 개발 모드: ${isDevelopment ? '활성' : '비활성'}`);
    
    // HTML 구조 확인
    const htmlStructure = await page.evaluate(() => {
      const head = document.head.innerHTML;
      const bodyClasses = document.body.className;
      const hasRootDiv = document.querySelector('#__next') !== null;
      
      return {
        headContent: head.substring(0, 500) + '...',
        bodyClasses,
        hasRootDiv
      };
    });
    
    console.log('\n🏗️ HTML 구조 확인:');
    console.log(`Body 클래스: ${htmlStructure.bodyClasses}`);
    console.log(`Next.js 루트 div: ${htmlStructure.hasRootDiv ? '존재' : '없음'}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'css-debug-before.png',
      fullPage: true 
    });
    console.log('📸 CSS 디버깅 스크린샷 저장: css-debug-before.png');
    
    // Tailwind 설정 파일 확인
    console.log('\n🎨 Tailwind 설정 상태 확인 중...');
    
  } catch (error) {
    console.error('❌ CSS 디버깅 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();