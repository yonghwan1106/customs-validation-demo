import { NextRequest, NextResponse } from 'next/server';
import { getFTARatesForHSCode, getHSCode } from '@/lib/database/sqlite';
import { FTACalculationRequest, APIResponse, FTACalculationResponse, FTABenefit } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: FTACalculationRequest = await request.json();
    const { hsCode, origin, totalValue } = body;

    if (!hsCode || !origin || !totalValue || totalValue <= 0) {
      return NextResponse.json({
        success: false,
        error: 'HS코드, 원산지, 총 금액을 모두 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    // HS코드 정보 조회
    const hsCodeData = getHSCode(hsCode);
    if (!hsCodeData) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 HS코드입니다.'
      } as APIResponse<null>, { status: 400 });
    }

    // 모든 FTA 정보 조회
    const allFTARates = getFTARatesForHSCode(hsCode);
    
    // FTA 혜택 계산
    const benefits = calculateFTABenefits(hsCodeData, allFTARates, totalValue);
    
    // 현재 원산지의 FTA 혜택 찾기
    const currentOriginBenefit = benefits.find(benefit => benefit.country === origin);
    
    // 최적의 원산지 추천
    const recommendedOrigin = findBestOrigin(benefits);

    const response: FTACalculationResponse = {
      benefits,
      recommendedOrigin: recommendedOrigin?.country !== origin ? recommendedOrigin?.country : undefined
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: currentOriginBenefit ? 
        `${origin} 원산지로 $${currentOriginBenefit.savingsAmount.toFixed(2)} 절약 가능합니다.` :
        'FTA 혜택 계산이 완료되었습니다.'
    } as APIResponse<FTACalculationResponse>);

  } catch (error) {
    console.error('FTA 계산 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}

// 모든 가능한 FTA 혜택 계산
function calculateFTABenefits(hsCodeData: any, ftaRates: any[], totalValue: number): FTABenefit[] {
  const baseRate = parseFloat(hsCodeData.base_tariff_rate.replace('%', '')) / 100;
  const baseTariff = totalValue * baseRate;

  const benefits: FTABenefit[] = [];

  // 기본 관세율 (FTA 없음)
  benefits.push({
    country: '기본 관세',
    baseRate: hsCodeData.base_tariff_rate,
    ftaRate: hsCodeData.base_tariff_rate,
    savingsAmount: 0,
    savingsPercentage: 0,
    requiresCertificate: false
  });

  // 각 FTA 혜택 계산
  ftaRates.forEach(fta => {
    const ftaRate = parseFloat(fta.fta_rate.replace('%', '')) / 100;
    const ftaTariff = totalValue * ftaRate;
    const savings = baseTariff - ftaTariff;
    const savingsPercentage = baseTariff > 0 ? (savings / baseTariff) * 100 : 0;

    benefits.push({
      country: fta.country,
      baseRate: fta.base_rate,
      ftaRate: fta.fta_rate,
      savingsAmount: Math.max(0, savings),
      savingsPercentage: Math.max(0, savingsPercentage),
      requiresCertificate: fta.requires_certificate === 1,
      certificateType: fta.certificate_type
    });
  });

  // 절약액 기준으로 정렬
  return benefits.sort((a, b) => b.savingsAmount - a.savingsAmount);
}

// 최적의 원산지 찾기
function findBestOrigin(benefits: FTABenefit[]): FTABenefit | null {
  // 기본 관세를 제외한 FTA 혜택만 고려
  const ftaBenefits = benefits.filter(benefit => benefit.country !== '기본 관세');
  
  if (ftaBenefits.length === 0) {
    return null;
  }

  // 가장 높은 절약액을 제공하는 원산지 반환
  return ftaBenefits[0];
}

// FTA 요구사항 확인 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hsCode = searchParams.get('hsCode');
    const country = searchParams.get('country');

    if (!hsCode) {
      return NextResponse.json({
        success: false,
        error: 'HS코드를 입력해주세요.'
      } as APIResponse<null>, { status: 400 });
    }

    const hsCodeData = getHSCode(hsCode);
    if (!hsCodeData) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 HS코드입니다.'
      } as APIResponse<null>, { status: 400 });
    }

    const ftaRates = getFTARatesForHSCode(hsCode);
    
    if (country) {
      // 특정 국가의 FTA 정보 조회
      const countryFTA: any = ftaRates.find((fta: any) => fta.country === country);
      
      if (!countryFTA) {
        return NextResponse.json({
          success: false,
          error: `${country}와의 FTA 협정이 없거나 해당 품목이 적용되지 않습니다.`
        } as APIResponse<null>, { status: 404 });
      }

      const requirements = generateFTARequirements(countryFTA);
      
      return NextResponse.json({
        success: true,
        data: {
          country: countryFTA.country,
          ftaRate: countryFTA.fta_rate,
          baseRate: countryFTA.base_rate,
          requirements
        },
        message: `${country}의 FTA 요구사항 정보입니다.`
      } as APIResponse<any>);
    }

    // 모든 FTA 정보 반환
    const allRequirements = ftaRates.map((fta: any) => ({
      country: fta.country,
      ftaRate: fta.fta_rate,
      baseRate: fta.base_rate,
      requirements: generateFTARequirements(fta)
    }));

    return NextResponse.json({
      success: true,
      data: allRequirements,
      message: 'FTA 요구사항 정보를 조회했습니다.'
    } as APIResponse<any>);

  } catch (error) {
    console.error('FTA 요구사항 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as APIResponse<null>, { status: 500 });
  }
}

// FTA 요구사항 생성
function generateFTARequirements(ftaData: any): {
  requiresCertificate: boolean;
  certificateType?: string;
  additionalRequirements: string[];
  processingTime: string;
  notes: string[];
} {
  const requirements = {
    requiresCertificate: ftaData.requires_certificate === 1,
    certificateType: ftaData.certificate_type,
    additionalRequirements: [] as string[],
    processingTime: '즉시 적용',
    notes: [] as string[]
  };

  // 국가별 추가 요구사항
  switch (ftaData.country) {
    case '중국':
      requirements.additionalRequirements = [
        '한중 FTA 원산지증명서 제출',
        '누적기준 충족 확인',
        '부가가치 기준 40% 이상'
      ];
      requirements.processingTime = '1-2 영업일';
      requirements.notes = [
        '전자제품의 경우 추가 서류가 필요할 수 있습니다.',
        '원산지 증명서는 발급일로부터 1년간 유효합니다.'
      ];
      break;

    case '미국':
      requirements.additionalRequirements = [
        '한미 FTA 원산지 신고서',
        '생산자 또는 수출자 신고',
        '원산지 기준 충족 입증'
      ];
      requirements.processingTime = '즉시 적용';
      requirements.notes = [
        '자율신고 방식으로 별도 발급 기관 불요',
        '신고서는 수입자, 수출자, 생산자가 작성 가능'
      ];
      break;

    case '일본':
      requirements.additionalRequirements = [
        '한일 EPA 원산지증명서',
        '상공회의소 발급 증명서',
        '원산지 결정기준 명시'
      ];
      requirements.processingTime = '2-3 영업일';
      requirements.notes = [
        '일본 세관에서 추가 검증을 요구할 수 있습니다.',
        '원산지증명서는 선적일 이전에 발급되어야 합니다.'
      ];
      break;

    default:
      requirements.additionalRequirements = [
        '해당 FTA 원산지증명서',
        '원산지 기준 충족 확인'
      ];
      requirements.notes = [
        'FTA별 상세 요구사항을 확인하시기 바랍니다.'
      ];
  }

  return requirements;
}