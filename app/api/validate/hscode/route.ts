import { NextRequest, NextResponse } from 'next/server';
import { HSCodeClassifier } from '@/lib/ai/hscode-classifier';
import { HSCodeValidationRequest, APIResponse, HSCodeValidationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: HSCodeValidationRequest = await request.json();
    const { itemName, description } = body;

    if (!itemName || itemName.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '상품명을 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    // HS코드 분류기 인스턴스 생성
    const classifier = HSCodeClassifier.getInstance();
    
    // AI 모델로 HS코드 예측
    const predictions = await classifier.classifyItem(itemName, description);

    if (predictions.length === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 상품에 대한 HS코드를 찾을 수 없습니다.'
      } as APIResponse<null>, { status: 404 });
    }

    // 최고 예측의 신뢰도를 기반으로 검증 결과 생성
    const bestPrediction = predictions[0];
    let status: 'pass' | 'warning' | 'error' = 'pass';
    let severity: 'low' | 'medium' | 'high' = 'low';
    let message = '적절한 HS코드가 예측되었습니다.';

    if (bestPrediction.confidence < 0.5) {
      status = 'error';
      severity = 'high';
      message = 'HS코드 예측 신뢰도가 낮습니다. 수동 확인이 필요합니다.';
    } else if (bestPrediction.confidence < 0.7) {
      status = 'warning';
      severity = 'medium';
      message = 'HS코드 예측 신뢰도가 보통입니다. 검토를 권장합니다.';
    }

    const validationResult = {
      id: `hscode_${Date.now()}`,
      type: 'hscode' as const,
      status,
      message,
      suggestion: predictions.length > 1 ? 
        `다른 옵션: ${predictions.slice(1).map(p => `${p.hsCode} (${Math.round(p.confidence * 100)}%)`).join(', ')}` : 
        undefined,
      severity,
      confidence: bestPrediction.confidence
    };

    const response: HSCodeValidationResponse = {
      predictions,
      validationResult
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: '성공적으로 HS코드를 예측했습니다.'
    } as APIResponse<HSCodeValidationResponse>);

  } catch (error) {
    console.error('HS코드 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}

// HS코드 매칭 검증 API
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { hsCode, itemName } = body;

    if (!hsCode || !itemName) {
      return NextResponse.json({
        success: false,
        error: 'HS코드와 상품명을 모두 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    const classifier = HSCodeClassifier.getInstance();
    const matchResult = await classifier.validateHSCodeMatch(hsCode, itemName);

    let status: 'pass' | 'warning' | 'error' = 'pass';
    let severity: 'low' | 'medium' | 'high' = 'low';
    let message = 'HS코드와 상품명이 일치합니다.';

    if (!matchResult.isValid) {
      if (matchResult.confidence < 0.3) {
        status = 'error';
        severity = 'high';
        message = 'HS코드와 상품명이 일치하지 않습니다.';
      } else {
        status = 'warning';
        severity = 'medium';
        message = 'HS코드와 상품명의 일치성을 재검토해주세요.';
      }
    }

    const validationResult = {
      id: `hscode_match_${Date.now()}`,
      type: 'hscode' as const,
      status,
      message,
      suggestion: matchResult.suggestion,
      severity,
      confidence: matchResult.confidence
    };

    return NextResponse.json({
      success: true,
      data: {
        isValid: matchResult.isValid,
        confidence: matchResult.confidence,
        validationResult
      },
      message: '성공적으로 HS코드 매칭을 검증했습니다.'
    } as APIResponse<any>);

  } catch (error) {
    console.error('HS코드 매칭 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}