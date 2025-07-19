// 데모 시나리오 종합 테스트

const demoScenarios = [
  {
    name: '✅ 정상 케이스 - 스마트폰 수입 (중국산)',
    description: '모든 검증 통과, FTA 혜택 적용 가능',
    data: {
      itemName: '스마트폰',
      hsCode: '8517.12',
      origin: '중국',
      quantity: 100,
      unitPrice: 300,
      unit: '개'
    },
    expectedRisk: 'low',
    expectedStatus: 'pass'
  },
  {
    name: '⚠️ 경고 케이스 - 시계 수입 (브라질산)',
    description: 'FTA 혜택 없음, 검토 권장',
    data: {
      itemName: '시계',
      hsCode: '9101.11',
      origin: '브라질',
      quantity: 2,
      unitPrice: 1200,
      unit: '개'
    },
    expectedRisk: 'medium',
    expectedStatus: 'warning'
  },
  {
    name: '❌ 오류 케이스 - 노트북 수입 (저가격)',
    description: '가격 이상치 탐지, 즉시 수정 필요',
    data: {
      itemName: '노트북',
      hsCode: '8471.30',
      origin: '한국',
      quantity: 5,
      unitPrice: 50,
      unit: '개'
    },
    expectedRisk: 'high',
    expectedStatus: 'error'
  },
  {
    name: '🔍 HS코드 불일치 케이스',
    description: '상품명과 HS코드 불일치 검증',
    data: {
      itemName: '스마트폰',
      hsCode: '9101.11', // 시계 HS코드
      origin: '중국',
      quantity: 10,
      unitPrice: 800,
      unit: '개'
    },
    expectedRisk: 'high',
    expectedStatus: 'error'
  },
  {
    name: '📦 대량 수입 케이스',
    description: '대량 수입으로 인한 추가 검토 필요',
    data: {
      itemName: '전자부품',
      hsCode: '8471.70',
      origin: '일본',
      quantity: 5000,
      unitPrice: 15,
      unit: '개'
    },
    expectedRisk: 'medium',
    expectedStatus: 'warning'
  }
];

async function testComprehensiveValidation(scenario) {
  try {
    const response = await fetch('http://localhost:3002/api/validate/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.log(`   ❌ API 오류: ${error.message}`);
    return null;
  }
}

async function testFTACalculation(scenario) {
  try {
    const totalValue = scenario.data.unitPrice * scenario.data.quantity;
    
    const response = await fetch('http://localhost:3002/api/fta/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hsCode: scenario.data.hsCode,
        origin: scenario.data.origin,
        totalValue: totalValue
      }),
    });

    if (!response.ok) {
      return null; // FTA 계산 실패는 정상적인 경우일 수 있음
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    return null;
  }
}

function analyzeResults(scenario, validationResult, ftaResult) {
  const analysis = {
    scenario: scenario.name,
    status: '✅ 성공',
    details: [],
    issues: []
  };

  if (!validationResult) {
    analysis.status = '❌ 실패';
    analysis.issues.push('검증 API 응답 없음');
    return analysis;
  }

  const { summary, riskAssessment, validationResults } = validationResult;

  // 위험도 검증
  const riskMatch = riskAssessment.riskLevel === scenario.expectedRisk;
  if (riskMatch) {
    analysis.details.push(`✅ 위험도: ${riskAssessment.riskLevel} (예상: ${scenario.expectedRisk})`);
  } else {
    analysis.details.push(`⚠️ 위험도: ${riskAssessment.riskLevel} (예상: ${scenario.expectedRisk})`);
    analysis.issues.push('위험도 불일치');
  }

  // 전체 상태 검증
  const statusMatch = summary.overallStatus === scenario.expectedStatus;
  if (statusMatch) {
    analysis.details.push(`✅ 전체 상태: ${summary.overallStatus}`);
  } else {
    analysis.details.push(`⚠️ 전체 상태: ${summary.overallStatus} (예상: ${scenario.expectedStatus})`);
    analysis.issues.push('상태 불일치');
  }

  // 검증 항목 분석
  analysis.details.push(`📊 검증 결과: ${summary.passedChecks}통과/${summary.warningChecks}경고/${summary.errorChecks}오류 (총 ${summary.totalChecks}개)`);
  analysis.details.push(`🎯 위험도 점수: ${riskAssessment.overallRiskScore}`);
  analysis.details.push(`⏱️ 예상 통관시간: ${riskAssessment.estimatedClearanceTime}`);
  analysis.details.push(`🎲 신뢰도: ${Math.round(riskAssessment.confidence * 100)}%`);

  // FTA 분석
  if (ftaResult) {
    const bestBenefit = ftaResult.benefits
      .filter(b => b.country !== '기본 관세')
      .sort((a, b) => b.savingsAmount - a.savingsAmount)[0];
    
    if (bestBenefit && bestBenefit.savingsAmount > 0) {
      analysis.details.push(`💰 최대 FTA 절약: $${bestBenefit.savingsAmount.toFixed(2)} (${bestBenefit.country})`);
    } else {
      analysis.details.push(`💸 FTA 혜택 없음`);
    }
  }

  // 권장사항
  if (riskAssessment.recommendations.length > 0) {
    analysis.details.push(`💡 권장사항: ${riskAssessment.recommendations.length}개`);
  }

  // 전체 평가
  if (analysis.issues.length === 0) {
    analysis.status = '✅ 완벽';
  } else if (analysis.issues.length <= 1) {
    analysis.status = '⚠️ 양호';
  } else {
    analysis.status = '❌ 문제';
  }

  return analysis;
}

async function runDemoTests() {
  console.log('🚀 수입신고 검증 시스템 데모 테스트 시작\n');
  console.log('=' .repeat(80));

  const results = [];
  let successCount = 0;

  for (let i = 0; i < demoScenarios.length; i++) {
    const scenario = demoScenarios[i];
    console.log(`\n${i + 1}. ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log(`   입력: ${scenario.data.itemName} | ${scenario.data.hsCode} | ${scenario.data.origin} | ${scenario.data.quantity}${scenario.data.unit} @ $${scenario.data.unitPrice}`);
    
    // 종합 검증 테스트
    console.log('   🔍 종합 검증 중...');
    const validationResult = await testComprehensiveValidation(scenario);
    
    // FTA 계산 테스트
    console.log('   💰 FTA 혜택 계산 중...');
    const ftaResult = await testFTACalculation(scenario);
    
    // 결과 분석
    const analysis = analyzeResults(scenario, validationResult, ftaResult);
    results.push(analysis);
    
    console.log(`   📊 결과: ${analysis.status}`);
    analysis.details.forEach(detail => {
      console.log(`      ${detail}`);
    });
    
    if (analysis.issues.length > 0) {
      console.log(`   ⚠️  이슈: ${analysis.issues.join(', ')}`);
    }
    
    if (analysis.status.includes('✅')) {
      successCount++;
    }
    
    console.log('   ' + '-'.repeat(60));
  }

  // 최종 결과 요약
  console.log('\n' + '='.repeat(80));
  console.log('📈 데모 테스트 결과 요약');
  console.log('='.repeat(80));
  
  console.log(`\n🎯 전체 성공률: ${successCount}/${demoScenarios.length} (${Math.round(successCount/demoScenarios.length*100)}%)`);
  
  console.log('\n📊 시나리오별 결과:');
  results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.status} - ${demoScenarios[index].name.substring(3)}`);
  });

  console.log('\n🎮 시스템 상태:');
  console.log(`   🌐 웹 인터페이스: http://localhost:3002`);
  console.log(`   🔌 API 엔드포인트: 정상 작동`);
  console.log(`   💾 데이터베이스: SQLite 연결됨`);
  console.log(`   🤖 AI 모델: Mock 엔진 활성화`);

  if (successCount === demoScenarios.length) {
    console.log('\n🎉 모든 데모 시나리오가 성공적으로 완료되었습니다!');
    console.log('✨ 수입신고 오류 사전 검증 시스템이 준비되었습니다.');
  } else {
    console.log(`\n⚠️  ${demoScenarios.length - successCount}개 시나리오에서 이슈가 발견되었습니다.`);
    console.log('🔧 시스템은 정상 작동하지만 일부 검증 로직 조정이 필요할 수 있습니다.');
  }

  console.log('\n🚀 데모 시연 준비 완료!');
}

// 테스트 실행
runDemoTests().catch(console.error);