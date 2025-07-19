const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensivePageTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 페이지 크기 설정 (데스크톱)
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  const testResults = [];
  
  const pages = [
    {
      name: '메인 페이지',
      url: 'http://localhost:3005',
      filename: 'main-page',
      expectedElements: [
        'h1:has-text("수입신고 검증 시스템")',
        'text=2025 관세청',
        'text=수입신고 검증하기',
        'text=FTA 혜택 계산하기',
        'text=98%',
        'text=5초',
        'text=15%',
        'text=2일'
      ]
    },
    {
      name: '수입신고 검증 페이지',
      url: 'http://localhost:3005/validation',
      filename: 'validation-page',
      expectedElements: [
        'text=수입신고 검증',
        'input[placeholder*="상품명"]',
        'input[placeholder*="HS코드"]',
        'input[placeholder*="원산지"]',
        'input[placeholder*="수량"]',
        'input[placeholder*="단가"]',
        'button:has-text("검증하기")'
      ]
    },
    {
      name: 'FTA 혜택 계산 페이지',
      url: 'http://localhost:3005/fta-calculator',
      filename: 'fta-calculator-page',
      expectedElements: [
        'text=FTA 혜택 계산',
        'input[placeholder*="HS코드"]',
        'input[placeholder*="원산지"]',
        'input[placeholder*="총 가격"]',
        'button:has-text("계산하기")'
      ]
    }
  ];
  
  for (const pageInfo of pages) {
    console.log(`\n🔍 ${pageInfo.name} 테스트 시작...`);
    
    const result = {
      name: pageInfo.name,
      url: pageInfo.url,
      status: 'success',
      loadTime: null,
      errors: [],
      missingElements: [],
      screenshots: [],
      styles: {},
      performance: {}
    };
    
    try {
      // 페이지 로드 시간 측정
      const startTime = Date.now();
      
      await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      const loadTime = Date.now() - startTime;
      result.loadTime = loadTime;
      
      console.log(`   ✅ 페이지 로드 완료 (${loadTime}ms)`);
      
      // 페이지 대기
      await page.waitForTimeout(2000);
      
      // 전체 페이지 스크린샷
      const fullScreenshot = `screenshot-${pageInfo.filename}-full.png`;
      await page.screenshot({ 
        path: fullScreenshot, 
        fullPage: true,
        type: 'png'
      });
      result.screenshots.push(fullScreenshot);
      
      // 뷰포트 스크린샷
      const viewportScreenshot = `screenshot-${pageInfo.filename}-viewport.png`;
      await page.screenshot({ 
        path: viewportScreenshot, 
        fullPage: false,
        type: 'png'
      });
      result.screenshots.push(viewportScreenshot);
      
      console.log(`   📸 스크린샷 저장: ${fullScreenshot}, ${viewportScreenshot}`);
      
      // 페이지 제목 확인
      const title = await page.title();
      result.title = title;
      
      // 필수 요소 확인
      console.log(`   🔍 필수 요소 확인 중...`);
      for (const selector of pageInfo.expectedElements) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          console.log(`      ✅ 발견: ${selector}`);
        } catch (error) {
          console.log(`      ❌ 누락: ${selector}`);
          result.missingElements.push(selector);
        }
      }
      
      // 스타일 분석
      const styleAnalysis = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        
        // 헤더 스타일 확인
        const header = document.querySelector('header');
        const headerStyle = header ? window.getComputedStyle(header) : null;
        
        // 버튼 스타일 확인
        const buttons = document.querySelectorAll('button');
        const buttonStyles = Array.from(buttons).slice(0, 3).map(btn => {
          const style = window.getComputedStyle(btn);
          return {
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            borderRadius: style.borderRadius,
            padding: style.padding
          };
        });
        
        // 카드 스타일 확인
        const cards = document.querySelectorAll('[class*="card"], [class*="bg-white"], [class*="bg-gradient"]');
        const cardCount = cards.length;
        
        return {
          body: {
            backgroundColor: computedStyle.backgroundColor,
            backgroundImage: computedStyle.backgroundImage,
            fontFamily: computedStyle.fontFamily
          },
          header: headerStyle ? {
            backgroundColor: headerStyle.backgroundColor,
            backgroundImage: headerStyle.backgroundImage,
            backdropFilter: headerStyle.backdropFilter
          } : null,
          buttons: buttonStyles,
          cardCount: cardCount,
          hasGradients: document.querySelectorAll('[class*="bg-gradient"]').length > 0,
          hasTailwind: document.querySelector('[class*="bg-"]') !== null
        };
      });
      
      result.styles = styleAnalysis;
      
      // 성능 메트릭
      const performanceMetrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
          loadComplete: perf.loadEventEnd - perf.navigationStart,
          firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0
        };
      });
      
      result.performance = performanceMetrics;
      
      // 폼 테스트 (검증 페이지와 FTA 계산 페이지)
      if (pageInfo.name.includes('검증') || pageInfo.name.includes('FTA')) {
        console.log(`   🎯 폼 기능 테스트 중...`);
        
        // 폼 입력 테스트
        const formInputs = await page.$$('input[type="text"], input[type="number"], select');
        console.log(`      📝 입력 필드 ${formInputs.length}개 발견`);
        
        if (formInputs.length > 0) {
          // 첫 번째 입력 필드에 테스트 데이터 입력
          try {
            await formInputs[0].fill('테스트 데이터');
            console.log(`      ✅ 첫 번째 입력 필드 작동 확인`);
          } catch (error) {
            console.log(`      ❌ 입력 필드 오류: ${error.message}`);
            result.errors.push(`입력 필드 오류: ${error.message}`);
          }
        }
        
        // 버튼 클릭 테스트
        const submitButton = await page.$('button:has-text("검증하기"), button:has-text("계산하기")');
        if (submitButton) {
          console.log(`      🔘 제출 버튼 발견`);
          try {
            await submitButton.click();
            await page.waitForTimeout(1000);
            console.log(`      ✅ 버튼 클릭 성공`);
          } catch (error) {
            console.log(`      ❌ 버튼 클릭 오류: ${error.message}`);
            result.errors.push(`버튼 클릭 오류: ${error.message}`);
          }
        }
      }
      
      console.log(`   ✅ ${pageInfo.name} 테스트 완료`);
      
    } catch (error) {
      console.error(`   ❌ ${pageInfo.name} 테스트 실패:`, error.message);
      result.status = 'error';
      result.errors.push(error.message);
      
      // 에러 스크린샷
      const errorScreenshot = `screenshot-${pageInfo.filename}-error.png`;
      await page.screenshot({ 
        path: errorScreenshot, 
        fullPage: true,
        type: 'png'
      });
      result.screenshots.push(errorScreenshot);
    }
    
    testResults.push(result);
  }
  
  await browser.close();
  
  // 테스트 결과 출력
  console.log('\n' + '='.repeat(80));
  console.log('🎯 종합 테스트 결과 리포트');
  console.log('='.repeat(80));
  
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`   📍 URL: ${result.url}`);
    console.log(`   📊 상태: ${result.status === 'success' ? '✅ 성공' : '❌ 실패'}`);
    console.log(`   ⏱️  로드 시간: ${result.loadTime}ms`);
    console.log(`   📄 페이지 제목: ${result.title}`);
    
    if (result.missingElements.length > 0) {
      console.log(`   ⚠️  누락 요소: ${result.missingElements.length}개`);
      result.missingElements.forEach(elem => console.log(`      - ${elem}`));
    }
    
    if (result.errors.length > 0) {
      console.log(`   ❌ 오류: ${result.errors.length}개`);
      result.errors.forEach(err => console.log(`      - ${err}`));
    }
    
    console.log(`   🎨 스타일 분석:`);
    console.log(`      - 카드 요소: ${result.styles.cardCount}개`);
    console.log(`      - 그라디언트: ${result.styles.hasGradients ? '✅' : '❌'}`);
    console.log(`      - Tailwind CSS: ${result.styles.hasTailwind ? '✅' : '❌'}`);
    
    if (result.performance) {
      console.log(`   ⚡ 성능:`);
      console.log(`      - DOM 로드: ${result.performance.domContentLoaded}ms`);
      console.log(`      - 완전 로드: ${result.performance.loadComplete}ms`);
      console.log(`      - 첫 페인트: ${result.performance.firstPaint}ms`);
    }
    
    console.log(`   📸 스크린샷: ${result.screenshots.length}개`);
    result.screenshots.forEach(screenshot => console.log(`      - ${screenshot}`));
  });
  
  // JSON 리포트 저장
  const report = {
    timestamp: new Date().toISOString(),
    testResults: testResults,
    summary: {
      total: testResults.length,
      successful: testResults.filter(r => r.status === 'success').length,
      failed: testResults.filter(r => r.status === 'error').length,
      averageLoadTime: testResults.reduce((sum, r) => sum + (r.loadTime || 0), 0) / testResults.length
    }
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎉 테스트 완료!');
  console.log(`📊 성공: ${report.summary.successful}/${report.summary.total}`);
  console.log(`⏱️  평균 로드 시간: ${Math.round(report.summary.averageLoadTime)}ms`);
  console.log(`📄 상세 리포트: test-report.json`);
  
  return report;
}

// 실행
comprehensivePageTest().catch(console.error);