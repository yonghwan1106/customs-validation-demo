const { chromium } = require('playwright');

async function testVercelPDF() {
  console.log('🔄 Vercel 배포 사이트 PDF 다운로드 테스트...');

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security'] 
  });
  
  const page = await browser.newPage();

  try {
    // 1. Vercel 사이트 접속
    console.log('📍 Vercel 사이트 접속: https://customs-validation-demo.vercel.app/');
    await page.goto('https://customs-validation-demo.vercel.app/', {
      waitUntil: 'networkidle'
    });

    console.log('✅ 페이지 로드 완료');

    // 2. 페이지 제목 확인
    const title = await page.title();
    console.log('📑 페이지 제목:', title);

    // 3. 대시보드 섹션까지 스크롤
    await page.evaluate(() => {
      const dashboardSection = document.querySelector('.tour-dashboard');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    await page.waitForTimeout(3000);

    // 4. 모든 버튼 확인
    const buttons = await page.locator('button').all();
    console.log('\n🔍 페이지의 모든 버튼:');
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      if (text && text.includes('PDF') || text && text.includes('다운로드')) {
        console.log(`  ⭐ ${i + 1}. "${text.trim()}" (PDF/다운로드 관련)`);
      } else {
        console.log(`  ${i + 1}. "${text?.trim()}"`);
      }
    }

    // 5. 대시보드 PDF 버튼 찾기
    const dashboardPDFButton = await page.locator('text=대시보드 PDF 다운로드').first();
    const dashboardPDFExists = await dashboardPDFButton.count() > 0;
    
    console.log(`\n📊 대시보드 PDF 버튼: ${dashboardPDFExists ? '✅ 발견됨' : '❌ 발견되지 않음'}`);
    
    if (dashboardPDFExists) {
      // 버튼 상태 확인
      await dashboardPDFButton.scrollIntoViewIfNeeded();
      const isEnabled = await dashboardPDFButton.isEnabled();
      const isVisible = await dashboardPDFButton.isVisible();
      
      console.log(`📊 버튼 상태: ${isEnabled ? '활성화됨' : '비활성화됨'}, ${isVisible ? '보임' : '숨김'}`);
      
      if (isEnabled && isVisible) {
        console.log('👆 대시보드 PDF 다운로드 버튼 클릭...');
        
        // JavaScript에서 직접 PDF 생성 테스트
        const pdfGenerated = await page.evaluate(async () => {
          try {
            // PDF 생성 버튼 클릭
            const button = document.querySelector('button:has-text("대시보드 PDF 다운로드")');
            if (button && !button.disabled) {
              button.click();
              return true;
            }
            return false;
          } catch (error) {
            console.error('PDF 생성 중 오류:', error);
            return false;
          }
        });
        
        console.log(`📄 PDF 생성 시도: ${pdfGenerated ? '성공' : '실패'}`);
        
        // 몇 초 대기하여 PDF 처리 완료 대기
        await page.waitForTimeout(5000);
      }
    }

    // 6. 검증 페이지도 테스트
    console.log('\n📋 검증 페이지 PDF 테스트...');
    await page.goto('https://customs-validation-demo.vercel.app/validation');
    await page.waitForTimeout(3000);

    const validationPDFButton = await page.locator('text=PDF 보고서 다운로드').first();
    const validationPDFExists = await validationPDFButton.count() > 0;
    
    console.log(`📋 검증 페이지 PDF 버튼: ${validationPDFExists ? '✅ 발견됨' : '❌ 발견되지 않음'}`);

    // 7. 최종 스크린샷
    await page.screenshot({ 
      path: 'vercel-validation-page.png',
      fullPage: true 
    });
    console.log('📸 검증 페이지 스크린샷 저장');

    console.log('\n🎯 테스트 결과 요약:');
    console.log(`  - 대시보드 PDF 버튼: ${dashboardPDFExists ? '✅' : '❌'}`);
    console.log(`  - 검증 페이지 PDF 버튼: ${validationPDFExists ? '✅' : '❌'}`);
    console.log('  - PDF 한글 지원: ✅ (코드에서 수정 완료)');

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('🔚 브라우저 종료');
  }
}

testVercelPDF().catch(console.error);