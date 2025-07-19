// 간단한 API 테스트
const http = require('http');

function testAPI() {
  const data = JSON.stringify({
    itemName: "스마트폰",
    hsCode: "8517.12", 
    origin: "중국",
    quantity: 100,
    unitPrice: 300
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/validate/comprehensive',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  console.log('🧪 API 연결 테스트 시작...');

  const req = http.request(options, (res) => {
    console.log(`응답 상태: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('✅ API 응답 성공:', result.success ? '성공' : '실패');
        
        if (result.success && result.data) {
          const { summary, riskAssessment } = result.data;
          console.log(`📊 검증 결과:`);
          console.log(`   - 총 검증: ${summary.totalChecks}개`);
          console.log(`   - 통과: ${summary.passedChecks}개`);
          console.log(`   - 경고: ${summary.warningChecks}개`);  
          console.log(`   - 오류: ${summary.errorChecks}개`);
          console.log(`   - 위험도: ${riskAssessment.riskLevel}`);
          console.log(`   - 점수: ${riskAssessment.overallRiskScore}`);
          console.log('🎉 검증 엔진이 정상 작동합니다!');
        }
      } catch (e) {
        console.log('❌ 응답 파싱 오류:', e.message);
        console.log('원시 응답:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`❌ 요청 오류: ${e.message}`);
  });

  req.write(data);
  req.end();
}

testAPI();