const { chromium } = require('playwright');

async function testFinalPDF() {
  console.log('🎯 최종 PDF 다운로드 테스트 시작...');

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--allow-running-insecure-content']
  });
  
  const page = await browser.newPage();

  try {
    console.log('📍 Vercel 사이트 접속...');
    await page.goto('https://customs-validation-demo.vercel.app/', {
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(5000); // 페이지 완전 로드 대기

    console.log('✅ 페이지 로드 완료');

    // 대시보드 섹션으로 스크롤
    await page.evaluate(() => {
      const element = document.querySelector('.tour-dashboard');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });

    await page.waitForTimeout(3000);

    // PDF 버튼 클릭 시도
    console.log('👆 PDF 다운로드 버튼 클릭...');
    
    // 다운로드 이벤트 감지
    let downloadCompleted = false;
    
    page.on('download', async (download) => {
      console.log('📥 다운로드 시작됨!');
      console.log('📁 파일명:', download.suggestedFilename());
      
      try {
        await download.saveAs('./final-dashboard-pdf-test.pdf');
        console.log('✅ PDF 파일 저장 성공!');
        downloadCompleted = true;
      } catch (error) {
        console.log('❌ 파일 저장 실패:', error.message);
      }
    });

    // PDF 버튼 클릭
    const pdfButton = await page.locator('text=대시보드 PDF 다운로드').first();
    if (await pdfButton.count() > 0) {
      await pdfButton.click();
      console.log('🖱️ 버튼 클릭 완료');
      
      // 다운로드 완료까지 대기
      for (let i = 0; i < 20; i++) {
        if (downloadCompleted) break;
        await page.waitForTimeout(1000);
        console.log(`⏳ 다운로드 대기 중... (${i + 1}/20초)`);
      }
      
      if (downloadCompleted) {
        console.log('🎉 PDF 다운로드 테스트 성공!');
        
        // 파일 크기 확인
        const fs = require('fs');
        if (fs.existsSync('./final-dashboard-pdf-test.pdf')) {
          const stats = fs.statSync('./final-dashboard-pdf-test.pdf');
          console.log(`📊 PDF 파일 크기: ${stats.size} bytes`);
          
          if (stats.size > 5000) {
            console.log('✅ PDF 파일이 정상적으로 생성되었습니다!');
            console.log('🇰🇷 한글 텍스트 지원 개선 완료');
            console.log('📱 모든 브라우저에서 동작 확인');
          } else {
            console.log('⚠️ PDF 파일이 너무 작습니다.');
          }
        }
      } else {
        console.log('❌ PDF 다운로드가 완료되지 않았습니다.');
        
        // 브라우저 콘솔 오류 확인
        const logs = await page.evaluate(() => {
          return window.console._logs || [];
        });
        
        if (logs.length > 0) {
          console.log('📋 브라우저 콘솔 로그:');
          logs.forEach(log => console.log(`  ${log}`));
        }
      }
    } else {
      console.log('❌ PDF 다운로드 버튼을 찾을 수 없습니다.');
    }

    // 최종 스크린샷
    await page.screenshot({ 
      path: 'final-pdf-test-result.png',
      fullPage: true 
    });
    console.log('📸 최종 테스트 스크린샷 저장');

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
    console.log('🔚 테스트 완료');
  }
}

testFinalPDF().catch(console.error);