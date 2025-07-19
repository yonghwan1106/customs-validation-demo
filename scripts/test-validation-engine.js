// 수입신고 오류 검증 엔진 기본 테스트

const testCases = [
  {
    name: "정상적인 전자제품 수입신고",
    data: {
      itemName: "스마트폰",
      hsCode: "8517.12",
      origin: "중국",
      quantity: 100,
      unitPrice: 300,
      unit: "개"
    },
    expected: {
      overallStatus: "pass",
      riskLevel: "low"
    }
  },
  {
    name: "HS코드 불일치 케이스", 
    data: {
      itemName: "스마트폰",
      hsCode: "9101.11", // 시계 HS코드
      origin: "중국",
      quantity: 10,
      unitPrice: 800
    },
    expected: {
      overallStatus: "error",
      riskLevel: "high"
    }
  },
  {
    name: "가격 이상치 케이스",
    data: {
      itemName: "노트북",
      hsCode: "8471.30",
      origin: "한국", 
      quantity: 5,
      unitPrice: 50 // 비정상적으로 낮은 가격
    },
    expected: {
      overallStatus: "error",
      riskLevel: "high"
    }
  },
  {
    name: "FTA 미적용 원산지",
    data: {
      itemName: "시계",
      hsCode: "9101.11",
      origin: "브라질", // FTA 혜택 없음
      quantity: 2,
      unitPrice: 1200
    },
    expected: {
      overallStatus: "warning",
      riskLevel: "medium"
    }
  },
  {
    name: "대량 수입 신고",
    data: {
      itemName: "전자부품",
      hsCode: "8471.70",
      origin: "일본",
      quantity: 5000,
      unitPrice: 15
    },
    expected: {
      overallStatus: "warning", 
      riskLevel: "medium"
    }
  }
];

async function testValidationAPI() {
  console.log('🧪 수입신고 검증 엔진 테스트 시작\n');

  const baseUrl = 'http://localhost:3002/api';
  let passCount = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. ${testCase.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/validate/comprehensive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      if (!response.ok) {
        console.log(`   ❌ HTTP 오류: ${response.status}`);
        continue;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.log(`   ❌ API 오류: ${result.error}`);
        continue;
      }

      const { summary, riskAssessment } = result.data;
      const actualStatus = summary.overallStatus;
      const actualRiskLevel = riskAssessment.riskLevel;

      // 결과 검증
      const statusMatch = actualStatus === testCase.expected.overallStatus;
      const riskMatch = actualRiskLevel === testCase.expected.riskLevel;

      if (statusMatch && riskMatch) {
        console.log(`   ✅ 통과 (상태: ${actualStatus}, 위험도: ${actualRiskLevel})`);
        passCount++;
      } else {
        console.log(`   ⚠️  부분 통과`);
        console.log(`      예상: 상태=${testCase.expected.overallStatus}, 위험도=${testCase.expected.riskLevel}`);
        console.log(`      실제: 상태=${actualStatus}, 위험도=${actualRiskLevel}`);
        
        // 상태만 맞으면 부분 점수
        if (statusMatch || riskMatch) {
          passCount += 0.5;
        }
      }

      // 검증 결과 요약 출력
      console.log(`      검증 항목: ${summary.totalChecks}개 (통과: ${summary.passedChecks}, 경고: ${summary.warningChecks}, 오류: ${summary.errorChecks})`);
      
    } catch (error) {
      console.log(`   ❌ 테스트 실행 오류: ${error.message}`);
    }
    
    console.log('');
  }

  // 최종 결과
  console.log('📊 테스트 결과 요약');
  console.log(`총 테스트: ${totalTests}개`);
  console.log(`통과율: ${Math.round((passCount / totalTests) * 100)}%`);
  
  if (passCount >= totalTests * 0.8) {
    console.log('🎉 검증 엔진이 정상적으로 작동합니다!');
    return true;
  } else {
    console.log('⚠️  일부 테스트에서 예상과 다른 결과가 나왔습니다.');
    return false;
  }
}

// 개별 컴포넌트 테스트
async function testIndividualComponents() {
  console.log('\n🔧 개별 컴포넌트 테스트\n');

  const tests = [
    {
      name: 'HS코드 검증',
      endpoint: '/validate/hscode',
      data: { itemName: '스마트폰', hsCode: '8517.12' }
    },
    {
      name: '가격 검증', 
      endpoint: '/validate/price',
      data: { hsCode: '8517.12', unitPrice: 300, quantity: 100 }
    },
    {
      name: '원산지 검증',
      endpoint: '/validate/origin', 
      data: { hsCode: '8517.12', origin: '중국' }
    },
    {
      name: 'FTA 계산',
      endpoint: '/fta/calculate',
      data: { hsCode: '8517.12', origin: '중국', totalValue: 30000 }
    }
  ];

  const baseUrl = 'http://localhost:3002/api';
  let componentResults = [];

  for (const test of tests) {
    try {
      const response = await fetch(`${baseUrl}${test.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });

      const result = await response.json();
      const status = response.ok && result.success ? '✅' : '❌';
      
      console.log(`${status} ${test.name}: ${result.message || result.error || '응답 없음'}`);
      componentResults.push({ name: test.name, success: response.ok && result.success });
      
    } catch (error) {
      console.log(`❌ ${test.name}: 연결 실패`);
      componentResults.push({ name: test.name, success: false });
    }
  }

  const workingComponents = componentResults.filter(r => r.success).length;
  console.log(`\n개별 컴포넌트 상태: ${workingComponents}/${componentResults.length} 작동`);
  
  return workingComponents === componentResults.length;
}

// 메인 테스트 실행
async function runAllTests() {
  console.log('🚀 검증 엔진 전체 테스트 시작\n');
  
  try {
    // 개별 컴포넌트 테스트
    const componentsPassed = await testIndividualComponents();
    
    // 종합 검증 테스트  
    const integrationPassed = await testValidationAPI();
    
    console.log('\n🎯 최종 결과');
    console.log(`개별 컴포넌트: ${componentsPassed ? '✅ 통과' : '❌ 실패'}`);
    console.log(`종합 검증: ${integrationPassed ? '✅ 통과' : '❌ 실패'}`);
    
    if (componentsPassed && integrationPassed) {
      console.log('\n🎉 모든 테스트 통과! 검증 엔진이 준비되었습니다.');
    } else {
      console.log('\n⚠️  일부 테스트 실패. 추가 디버깅이 필요합니다.');
    }
    
  } catch (error) {
    console.log(`\n❌ 테스트 실행 중 오류: ${error.message}`);
  }
}

// 테스트 실행 (Node.js 환경에서)
if (typeof window === 'undefined') {
  runAllTests();
}

module.exports = { testValidationAPI, testIndividualComponents, runAllTests };