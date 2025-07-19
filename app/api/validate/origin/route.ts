import { NextRequest, NextResponse } from 'next/server';
import { getFTARatesForHSCode, getHSCode } from '@/lib/database/sqlite';
import { OriginValidationRequest, APIResponse, OriginValidationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: OriginValidationRequest = await request.json();
    const { hsCode, origin } = body;

    if (!hsCode || !origin) {
      return NextResponse.json({
        success: false,
        error: 'HS코드와 원산지를 모두 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    // HS코드 존재 여부 확인
    const hsCodeData = getHSCode(hsCode);
    if (!hsCodeData) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 HS코드입니다.'
      } as APIResponse<null>, { status: 400 });
    }

    // 해당 HS코드의 FTA 정보 조회
    const ftaRates = getFTARatesForHSCode(hsCode);
    
    // 원산지 유효성 검증
    const isValidOrigin = validateOriginForHSCode(hsCode, origin, hsCodeData);
    const ftaBenefitAvailable = ftaRates.some((fta: any) => fta.country === origin);

    let status: 'pass' | 'warning' | 'error' = 'pass';
    let severity: 'low' | 'medium' | 'high' = 'low';
    let message = '원산지가 유효합니다.';
    let suggestion: string | undefined;

    // 검증 로직
    if (!isValidOrigin.isValid) {
      status = 'error';
      severity = 'high';
      message = isValidOrigin.reason || '유효하지 않은 원산지입니다.';
    } else if (!ftaBenefitAvailable && hasBetterFTAOption(ftaRates, origin)) {
      status = 'warning';
      severity = 'medium';
      message = '현재 원산지로는 FTA 혜택을 받을 수 없습니다.';
      suggestion = getBestFTARecommendation(ftaRates);
    } else if (ftaBenefitAvailable) {
      message = 'FTA 혜택을 받을 수 있는 원산지입니다.';
    }

    const validationResult = {
      id: `origin_${Date.now()}`,
      type: 'origin' as const,
      status,
      message,
      suggestion,
      severity,
      confidence: isValidOrigin.confidence
    };

    const response: OriginValidationResponse = {
      isValid: isValidOrigin.isValid,
      validationResult
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: '성공적으로 원산지를 검증했습니다.'
    } as APIResponse<OriginValidationResponse>);

  } catch (error) {
    console.error('원산지 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}

// 원산지 유효성 검증 함수
function validateOriginForHSCode(hsCode: string, origin: string, hsCodeData: any): {
  isValid: boolean;
  confidence: number;
  reason?: string;
} {
  // 일반적인 원산지 목록
  const validCountries = [
    '한국', '중국', '일본', '미국', '독일', '프랑스', '이탈리아', '영국', 
    '캐나다', '호주', '브라질', '인도', '러시아', '멕시코', '스페인',
    '네덜란드', '스위스', '벨기에', '스웨덴', '노르웨이', '덴마크',
    '폴란드', '체코', '헝가리', '터키', '이스라엘', '남아프리카공화국',
    '싱가포르', '말레이시아', '태국', '베트남', '인도네시아', '필리핀',
    '대만', '홍콩', '뉴질랜드', '칠레', '아르헨티나', '콜롬비아'
  ];

  // 기본 유효성 검증
  if (!validCountries.includes(origin)) {
    return {
      isValid: false,
      confidence: 0.2,
      reason: '지원되지 않는 원산지입니다.'
    };
  }

  // HS코드별 일반적인 원산지 확인
  const commonOrigins = hsCodeData.common_origins ? 
    hsCodeData.common_origins.split(',').map((o: string) => o.trim()) : [];

  if (commonOrigins.length > 0 && commonOrigins.includes(origin)) {
    return {
      isValid: true,
      confidence: 0.9
    };
  }

  // 제품 카테고리별 원산지 검증
  const categoryValidation = validateByCategory(hsCode, origin);
  
  return {
    isValid: true,
    confidence: categoryValidation.confidence,
    reason: categoryValidation.reason
  };
}

// 카테고리별 원산지 유효성 검증
function validateByCategory(hsCode: string, origin: string): {
  confidence: number;
  reason?: string;
} {
  const firstFourDigits = hsCode.substring(0, 4);

  // 전자제품 (8471-8528)
  if (firstFourDigits >= '8471' && firstFourDigits <= '8528') {
    const techCountries = ['중국', '대만', '한국', '일본', '베트남', '말레이시아'];
    if (techCountries.includes(origin)) {
      return { confidence: 0.95 };
    }
    return { 
      confidence: 0.7, 
      reason: '해당 제품의 일반적인 생산국이 아닙니다.' 
    };
  }

  // 시계류 (9101-9114)
  if (firstFourDigits >= '9101' && firstFourDigits <= '9114') {
    const watchCountries = ['스위스', '중국', '일본', '독일'];
    if (watchCountries.includes(origin)) {
      return { confidence: 0.95 };
    }
    return { 
      confidence: 0.6, 
      reason: '해당 제품의 일반적인 생산국이 아닙니다.' 
    };
  }

  // 기본 신뢰도
  return { confidence: 0.8 };
}

// FTA 혜택이 더 좋은 옵션이 있는지 확인
function hasBetterFTAOption(ftaRates: any[], currentOrigin: string): boolean {
  return ftaRates.length > 0 && !ftaRates.some((fta: any) => fta.country === currentOrigin);
}

// 최적의 FTA 추천
function getBestFTARecommendation(ftaRates: any[]): string {
  if (ftaRates.length === 0) {
    return '';
  }

  // 관세율이 0%인 국가 우선 추천
  const zeroTariffCountries = ftaRates.filter((fta: any) => fta.fta_rate === '0%');
  
  if (zeroTariffCountries.length > 0) {
    const countries = zeroTariffCountries.map((fta: any) => fta.country).join(', ');
    return `${countries} 원산지 선택 시 무관세 혜택을 받을 수 있습니다.`;
  }

  // 가장 낮은 관세율 국가 추천
  const bestRate = ftaRates.reduce((min: any, fta: any) => {
    const rate = parseFloat(fta.fta_rate.replace('%', ''));
    const minRate = parseFloat(min.fta_rate.replace('%', ''));
    return rate < minRate ? fta : min;
  });

  return `${bestRate.country} 원산지 선택 시 ${bestRate.fta_rate} 관세율 혜택을 받을 수 있습니다.`;
}