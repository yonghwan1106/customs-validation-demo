const { chromium } = require('playwright');
const fs = require('fs');

async function testVercelPDFDownload() {
  console.log('🔄 Vercel 배포 사이트에서 PDF 다운로드 테스트 시작...');

  const browser = await chromium.launch({
    headless: false, // 브라우저 창을 보이게 하여 실제 동작 확인
    args: ['--disable-web-security', '--allow-running-insecure-content']
  });

  const page = await browser.newPage();

  try {
    // 1. 배포된 사이트 접속
    console.log('📍 Vercel 사이트 접속 중...');
    await page.goto('https://customs-validation-demo.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 페이지 제목 확인
    const title = await page.title();
    console.log('✅ 페이지 제목:', title);

    // 2. 메인페이지 스크린샷
    await page.screenshot({ 
      path: 'vercel-main-page.png', 
      fullPage: true 
    });
    console.log('📸 메인페이지 스크린샷 저장');

    // 3. 실시간 대시보드 섹션까지 스크롤
    console.log('📊 대시보드 섹션으로 스크롤...');
    await page.evaluate(() => {
      const dashboardSection = document.querySelector('.tour-dashboard');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // 대시보드 로딩 대기
    await page.waitForTimeout(3000);

    // 4. 대시보드 PDF 다운로드 버튼 찾기
    console.log('🔍 PDF 다운로드 버튼 찾는 중...');
    
    // PDF 다운로드 버튼이 있는지 확인
    const pdfButton = await page.locator('text=대시보드 PDF 다운로드').first();
    const pdfButtonExists = await pdfButton.count() > 0;
    
    if (!pdfButtonExists) {
      console.log('❌ PDF 다운로드 버튼을 찾을 수 없습니다.');
      
      // 버튼 텍스트 변형들 시도
      const alternativeButtons = [
        'text=PDF 다운로드',
        'text=대시보드 PDF',
        'text=보고서 다운로드',
        '[class*="pdf"]',
        '[class*="download"]'
      ];
      
      for (const selector of alternativeButtons) {
        const altButton = await page.locator(selector).first();
        if (await altButton.count() > 0) {
          console.log(`✅ 대체 버튼 발견: ${selector}`);
          break;
        }
      }
      
      // 현재 보이는 버튼들 확인
      const allButtons = await page.locator('button').all();
      console.log('📋 페이지의 모든 버튼들:');
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`  - ${buttonText?.trim()}`);
      }
    } else {
      console.log('✅ PDF 다운로드 버튼 발견!');
    }

    // 5. 대시보드 영역 스크린샷
    await page.screenshot({ 
      path: 'vercel-dashboard-section.png',
      fullPage: false 
    });
    console.log('📸 대시보드 섹션 스크린샷 저장');

    // 6. PDF 다운로드 시도
    if (pdfButtonExists) {
      console.log('📥 PDF 다운로드 시도 중...');
      
      // 다운로드 이벤트 리스너 설정
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      // PDF 버튼 클릭
      await pdfButton.click();
      
      try {
        const download = await downloadPromise;
        console.log('✅ PDF 다운로드 시작됨');
        console.log('📁 파일명:', download.suggestedFilename());
        
        // PDF 파일 저장
        const pdfPath = `./vercel-dashboard-report.pdf`;
        await download.saveAs(pdfPath);
        console.log(`💾 PDF 파일 저장됨: ${pdfPath}`);
        
        // 파일 크기 확인
        if (fs.existsSync(pdfPath)) {
          const stats = fs.statSync(pdfPath);
          console.log(`📊 PDF 파일 크기: ${stats.size} bytes`);
          
          if (stats.size > 1000) {
            console.log('✅ PDF 파일이 정상적으로 생성되었습니다!');
            console.log('🎉 한글 PDF 다운로드 테스트 성공!');
          } else {
            console.log('⚠️  PDF 파일이 너무 작습니다. 내용 확인 필요.');
          }
        }
        
      } catch (downloadError) {
        console.log('❌ PDF 다운로드 실패:', downloadError.message);
      }
    }

    // 7. 최종 스크린샷
    await page.screenshot({ 
      path: 'vercel-final-state.png',
      fullPage: true 
    });

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    console.log('🔚 브라우저 종료 중...');
    await browser.close();
  }
}

// 테스트 실행
testVercelPDFDownload().catch(console.error);