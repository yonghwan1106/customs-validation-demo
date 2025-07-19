const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 실시간 대시보드 상세 테스트 시작...');
    
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');
    
    // 실시간 대시보드 컴포넌트 확인
    const dashboardTitle = await page.locator('h3:has-text("실시간 시스템 현황")').textContent();
    console.log('✅ 대시보드 제목:', dashboardTitle);
    
    // 10초 대기하여 컴포넌트 로딩 완료
    await page.waitForTimeout(10000);
    
    // 통계 카드 확인
    const todayValidations = await page.locator('span:has-text("오늘 총 검증")').first();
    if (await todayValidations.isVisible()) {
      console.log('✅ "오늘 총 검증" 카드 발견');
    } else {
      console.log('❌ "오늘 총 검증" 카드 찾을 수 없음');
    }
    
    // 평균 성공률 카드 확인
    const successRate = await page.locator('span:has-text("평균 성공률")').first();
    if (await successRate.isVisible()) {
      console.log('✅ "평균 성공률" 카드 발견');
    } else {
      console.log('❌ "평균 성공률" 카드 찾을 수 없음');
    }
    
    // 활성 사용자 카드 확인
    const activeUsers = await page.locator('span:has-text("활성 사용자")').first();
    if (await activeUsers.isVisible()) {
      console.log('✅ "활성 사용자" 카드 발견');
    } else {
      console.log('❌ "활성 사용자" 카드 찾을 수 없음');
    }
    
    // 차트 캔버스 확인
    const canvasElements = await page.locator('canvas').all();
    console.log(`✅ 차트 캔버스 요소 개수: ${canvasElements.length}개`);
    
    // 개별 차트 확인
    const hourlyTrendChart = await page.locator('span:has-text("시간별 검증 트렌드")').first();
    if (await hourlyTrendChart.isVisible()) {
      console.log('✅ 시간별 검증 트렌드 차트 발견');
    }
    
    const countryChart = await page.locator('span:has-text("국가별 수입 현황")').first();
    if (await countryChart.isVisible()) {
      console.log('✅ 국가별 수입 현황 차트 발견');
    }
    
    const weeklyChart = await page.locator('span:has-text("주간 검증 트렌드")').first();
    if (await weeklyChart.isVisible()) {
      console.log('✅ 주간 검증 트렌드 차트 발견');
    }
    
    // 위험도 분포 도넛 차트 확인
    const riskDistribution = await page.locator('span:has-text("위험도 분포")').first();
    if (await riskDistribution.isVisible()) {
      console.log('✅ 위험도 분포 차트 발견');
    }
    
    // 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'dashboard-detailed-test.png',
      fullPage: true 
    });
    console.log('📸 상세 스크린샷 저장: dashboard-detailed-test.png');
    
    // 특정 대시보드 섹션만 스크린샷
    const dashboardSection = await page.locator('h3:has-text("실시간 시스템 현황")').locator('..').locator('..');
    await dashboardSection.screenshot({ path: 'dashboard-section-only.png' });
    console.log('📸 대시보드 섹션만 스크린샷 저장: dashboard-section-only.png');
    
    console.log('\n🎉 상세 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();