import { NextRequest, NextResponse } from 'next/server';
import { PriceValidator } from '@/lib/ai/price-validator';
import { PriceValidationRequest, APIResponse, PriceValidationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: PriceValidationRequest = await request.json();
    const { hsCode, unitPrice, quantity } = body;

    // 입력 유효성 검증
    if (!hsCode || !unitPrice || unitPrice <= 0) {
      return NextResponse.json({
        success: false,
        error: 'HS코드와 유효한 단가를 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    if (quantity && quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: '수량은 1 이상이어야 합니다.'
      } as APIResponse<null>, { status: 400 });
    }

    // 가격 검증기 인스턴스 생성
    const validator = PriceValidator.getInstance();
    
    // 가격 검증 수행
    const validation = await validator.validatePrice(hsCode, unitPrice, quantity || 1);

    // 계절성 조정 (현재 월 기준)
    const currentMonth = new Date().getMonth() + 1;
    const adjustedValidation = validator.applySeasonalAdjustment(validation, currentMonth);

    // 대량 주문 할인 검증
    const bulkDiscountCheck = validator.validateBulkDiscount(unitPrice, quantity || 1, hsCode);

    // 검증 결과 상태 결정
    let status: 'pass' | 'warning' | 'error' = 'pass';
    let severity: 'low' | 'medium' | 'high' = 'low';
    let message = '가격이 정상 범위 내에 있습니다.';

    if (!adjustedValidation.isValid) {
      if (adjustedValidation.riskLevel === 'high') {
        status = 'error';
        severity = 'high';
        message = `가격이 평균 대비 ${adjustedValidation.deviation}% 차이가 납니다. 추가 검토가 필요합니다.`;
      } else if (adjustedValidation.riskLevel === 'medium') {
        status = 'warning';
        severity = 'medium';
        message = `가격이 평균보다 ${adjustedValidation.deviation}% 차이가 납니다.`;
      }
    }

    // 대량 할인이 비합리적인 경우 경고
    if (!bulkDiscountCheck.isReasonable && quantity && quantity >= 10) {
      if (status === 'pass') {
        status = 'warning';
        severity = 'medium';
      }
      message += ` ${bulkDiscountCheck.message}`;
    }

    const validationResult = {
      id: `price_${Date.now()}`,
      type: 'price' as const,
      status,
      message,
      suggestion: adjustedValidation.riskLevel === 'high' ? 
        `권장 가격 범위: $${(adjustedValidation.averagePrice * 0.7).toFixed(2)} - $${(adjustedValidation.averagePrice * 1.3).toFixed(2)}` : 
        undefined,
      severity,
      confidence: adjustedValidation.isValid ? 0.9 : (1 - adjustedValidation.deviation / 100)
    };

    const response: PriceValidationResponse = {
      validation: adjustedValidation,
      validationResult
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: '성공적으로 가격을 검증했습니다.'
    } as APIResponse<PriceValidationResponse>);

  } catch (error) {
    console.error('가격 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}

// 가격 제안 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hsCode = searchParams.get('hsCode');

    if (!hsCode) {
      return NextResponse.json({
        success: false,
        error: 'HS코드를 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    const validator = PriceValidator.getInstance();
    
    // 가격 제안 생성
    const suggestion = await validator.generatePriceSuggestion(hsCode);
    
    if (!suggestion) {
      return NextResponse.json({
        success: false,
        error: '해당 HS코드에 대한 가격 정보를 찾을 수 없습니다.'
      } as APIResponse<null>, { status: 404 });
    }

    // 가격 트렌드 생성
    const trend = validator.generatePriceTrend(hsCode);

    return NextResponse.json({
      success: true,
      data: {
        suggestion,
        trend
      },
      message: '성공적으로 가격 정보를 조회했습니다.'
    } as APIResponse<any>);

  } catch (error) {
    console.error('가격 정보 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}