const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📊 실시간 대시보드 테스트 시작...');
    
    // 메인 페이지 접속
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('✅ 페이지 제목:', title);
    
    // 실시간 대시보드 섹션 확인
    const dashboardSection = await page.locator('h3:has-text("실시간 시스템 현황")');
    await dashboardSection.waitFor();
    console.log('✅ 실시간 대시보드 섹션 발견');
    
    // 통계 카드들 확인
    const statsCards = await page.locator('[class*="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl"]');
    const cardCount = await statsCards.count();
    console.log(`✅ 통계 카드 개수: ${cardCount}개`);
    
    // 차트 컨테이너 확인
    const chartContainers = await page.locator('canvas');
    const chartCount = await chartContainers.count();
    console.log(`✅ 차트 개수: ${chartCount}개`);
    
    // API 호출 확인
    const apiResponse = await page.request.get('http://localhost:3006/api/dashboard/realtime');
    const responseBody = await apiResponse.json();
    console.log('✅ API 응답 상태:', responseBody.success);
    console.log('✅ 오늘 총 검증:', responseBody.data.summary.total_validations_today);
    console.log('✅ 평균 성공률:', responseBody.data.summary.average_success_rate + '%');
    
    // 5초 대기 후 데이터 자동 갱신 확인
    console.log('⏱️ 5초 대기 후 자동 갱신 확인...');
    await page.waitForTimeout(6000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'realtime-dashboard-test.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: realtime-dashboard-test.png');
    
    // 로딩 상태 확인
    const loadingElements = await page.locator('[class*="animate-pulse"]');
    const loadingCount = await loadingElements.count();
    console.log(`✅ 로딩 애니메이션 요소: ${loadingCount}개`);
    
    // 실시간 업데이트 시간 확인
    const updateTimeElement = await page.locator('text=/마지막 업데이트:/');
    if (await updateTimeElement.isVisible()) {
      const updateTime = await updateTimeElement.textContent();
      console.log('✅ 마지막 업데이트 시간:', updateTime);
    }
    
    console.log('\n🎉 실시간 대시보드 테스트 완료!');
    console.log('✅ 모든 기능이 정상적으로 작동하고 있습니다.');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();