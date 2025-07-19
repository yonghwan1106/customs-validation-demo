import { NextRequest, NextResponse } from 'next/server';
import { HSCodeClassifier } from '@/lib/ai/hscode-classifier';
import { PriceValidator } from '@/lib/ai/price-validator';
import { RiskAssessmentEngine } from '@/lib/ai/risk-assessment';
import { getFTARatesForHSCode, getHSCode } from '@/lib/database/sqlite';
import { APIResponse, ValidationResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      itemName, 
      hsCode, 
      origin, 
      quantity = 1, 
      unitPrice, 
      unit = '개',
      totalValue 
    } = body;

    // 필수 필드 검증
    if (!itemName || !unitPrice || unitPrice <= 0) {
      return NextResponse.json({
        success: false,
        error: '상품명과 유효한 단가를 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    const validationResults: ValidationResult[] = [];
    const classifier = HSCodeClassifier.getInstance();
    const priceValidator = PriceValidator.getInstance();
    const riskEngine = RiskAssessmentEngine.getInstance();

    // 1. HS코드 검증
    try {
      if (hsCode) {
        // 제공된 HS코드와 상품명 매칭 검증
        const hsCodeMatch = await classifier.validateHSCodeMatch(hsCode, itemName);
        
        let status: 'pass' | 'warning' | 'error' = 'pass';
        let severity: 'low' | 'medium' | 'high' = 'low';
        let message = 'HS코드가 상품명과 일치합니다.';
        
        if (!hsCodeMatch.isValid) {
          if (hsCodeMatch.confidence < 0.3) {
            status = 'error';
            severity = 'high';
            message = 'HS코드와 상품명이 일치하지 않습니다.';
          } else {
            status = 'warning';
            severity = 'medium';
            message = 'HS코드와 상품명의 일치성을 재검토해주세요.';
          }
        }

        validationResults.push({
          id: `hscode_${Date.now()}`,
          type: 'hscode',
          status,
          message,
          suggestion: hsCodeMatch.suggestion,
          severity,
          confidence: hsCodeMatch.confidence
        });
      } else {
        // HS코드 자동 예측
        const predictions = await classifier.classifyItem(itemName);
        const bestPrediction = predictions[0];
        
        if (bestPrediction) {
          let status: 'pass' | 'warning' | 'error' = 'pass';
          let severity: 'low' | 'medium' | 'high' = 'low';
          let message = `HS코드 ${bestPrediction.hsCode}를 권장합니다.`;
          
          if (bestPrediction.confidence < 0.5) {
            status = 'error';
            severity = 'high';
            message = 'HS코드 예측 신뢰도가 낮습니다.';
          } else if (bestPrediction.confidence < 0.7) {
            status = 'warning';
            severity = 'medium';
            message = 'HS코드 예측을 검토해주세요.';
          }

          validationResults.push({
            id: `hscode_prediction_${Date.now()}`,
            type: 'hscode',
            status,
            message,
            suggestion: `추천 HS코드: ${bestPrediction.hsCode} (${bestPrediction.description})`,
            severity,
            confidence: bestPrediction.confidence
          });
        }
      }
    } catch (error) {
      console.error('HS코드 검증 오류:', error);
    }

    // 2. 가격 검증
    try {
      const finalHSCode = hsCode || (await classifier.classifyItem(itemName))[0]?.hsCode;
      
      if (finalHSCode) {
        const priceValidation = await priceValidator.validatePrice(finalHSCode, unitPrice, quantity);
        
        let status: 'pass' | 'warning' | 'error' = 'pass';
        let severity: 'low' | 'medium' | 'high' = 'low';
        let message = '가격이 정상 범위입니다.';
        
        if (!priceValidation.isValid) {
          if (priceValidation.riskLevel === 'high') {
            status = 'error';
            severity = 'high';
            message = `가격이 평균 대비 ${priceValidation.deviation}% 차이가 납니다.`;
          } else {
            status = 'warning';
            severity = 'medium';
            message = `가격이 평균보다 ${priceValidation.deviation}% 차이가 납니다.`;
          }
        }

        validationResults.push({
          id: `price_${Date.now()}`,
          type: 'price',
          status,
          message,
          suggestion: !priceValidation.isValid ? 
            `권장 가격: $${(priceValidation.averagePrice * 0.8).toFixed(2)} - $${(priceValidation.averagePrice * 1.2).toFixed(2)}` : 
            undefined,
          severity,
          confidence: priceValidation.isValid ? 0.9 : Math.max(0.1, 1 - priceValidation.deviation / 100)
        });
      }
    } catch (error) {
      console.error('가격 검증 오류:', error);
    }

    // 3. 원산지 검증
    try {
      if (origin) {
        const finalHSCode = hsCode || (await classifier.classifyItem(itemName))[0]?.hsCode;
        
        if (finalHSCode) {
          const hsCodeData = getHSCode(finalHSCode);
          const ftaRates = getFTARatesForHSCode(finalHSCode);
          
          let status: 'pass' | 'warning' | 'error' = 'pass';
          let severity: 'low' | 'medium' | 'high' = 'low';
          let message = '원산지가 유효합니다.';
          let suggestion: string | undefined;

          // FTA 혜택 확인
          const currentOriginFTA: any = ftaRates.find((fta: any) => fta.country === origin);
          const bestFTA: any = ftaRates.length > 0 ? ftaRates[0] : null;

          if (!currentOriginFTA && bestFTA) {
            status = 'warning';
            severity = 'medium';
            message = '현재 원산지로는 FTA 혜택을 받을 수 없습니다.';
            suggestion = `${bestFTA.country} 원산지 선택 시 ${bestFTA.fta_rate} 관세율 혜택`;
          } else if (currentOriginFTA) {
            message = `FTA 혜택 적용 가능 (${currentOriginFTA.fta_rate})`;
          }

          validationResults.push({
            id: `origin_${Date.now()}`,
            type: 'origin',
            status,
            message,
            suggestion,
            severity,
            confidence: 0.8
          });
        }
      }
    } catch (error) {
      console.error('원산지 검증 오류:', error);
    }

    // 4. 수량 검증
    try {
      let status: 'pass' | 'warning' | 'error' = 'pass';
      let severity: 'low' | 'medium' | 'high' = 'low';
      let message = '수량이 적정합니다.';
      let suggestion: string | undefined;

      const calculatedTotal = totalValue || (unitPrice * quantity);

      if (quantity > 1000) {
        status = 'warning';
        severity = 'medium';
        message = '대량 수입으로 상업적 목적 확인이 필요할 수 있습니다.';
      }

      if (calculatedTotal > 100000) {
        status = 'warning';
        severity = 'medium';
        message += ' 고액 신고로 추가 서류가 필요할 수 있습니다.';
        suggestion = '세관신고대행업체 또는 관세사 상담을 권장합니다.';
      }

      validationResults.push({
        id: `quantity_${Date.now()}`,
        type: 'quantity',
        status,
        message,
        suggestion,
        severity,
        confidence: 0.9
      });
    } catch (error) {
      console.error('수량 검증 오류:', error);
    }

    // 5. 종합 위험도 평가
    const declarationData = {
      itemName,
      hsCode,
      origin,
      quantity,
      unitPrice,
      totalValue: totalValue || (unitPrice * quantity)
    };

    const riskAssessment = riskEngine.assessOverallRisk(validationResults, declarationData);

    // 응답 데이터 구성
    const response = {
      validationResults,
      riskAssessment,
      summary: {
        totalChecks: validationResults.length,
        passedChecks: validationResults.filter(r => r.status === 'pass').length,
        warningChecks: validationResults.filter(r => r.status === 'warning').length,
        errorChecks: validationResults.filter(r => r.status === 'error').length,
        overallStatus: riskAssessment.riskLevel === 'low' ? 'pass' : 
                      riskAssessment.riskLevel === 'medium' ? 'warning' : 'error'
      },
      recommendations: riskAssessment.recommendations,
      estimatedClearanceTime: riskAssessment.estimatedClearanceTime
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: `종합 검증이 완료되었습니다. 위험도: ${riskAssessment.riskLevel}`
    } as APIResponse<any>);

  } catch (error) {
    console.error('종합 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}