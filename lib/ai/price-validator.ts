import { PriceValidation } from '@/types';
import { getPriceStats } from '@/lib/database/sqlite';

export class PriceValidator {
  private static instance: PriceValidator;
  
  public static getInstance(): PriceValidator {
    if (!PriceValidator.instance) {
      PriceValidator.instance = new PriceValidator();
    }
    return PriceValidator.instance;
  }

  // 가격 이상치 탐지 (Z-Score 기반)
  public async validatePrice(hsCode: string, unitPrice: number, quantity: number = 1): Promise<PriceValidation> {
    // 데이터베이스에서 가격 통계 조회
    const priceStats = getPriceStats(hsCode);
    
    if (!priceStats) {
      // 통계 데이터가 없는 경우 기본 검증
      return {
        isValid: true,
        currentPrice: unitPrice,
        averagePrice: unitPrice,
        deviation: 0,
        zScore: 0,
        riskLevel: 'low'
      };
    }

    const { avg_price, std_dev } = priceStats as any;
    
    // Z-Score 계산
    const zScore = Math.abs((unitPrice - avg_price) / std_dev);
    
    // 편차 계산 (백분율)
    const deviation = Math.abs(((unitPrice - avg_price) / avg_price) * 100);
    
    // 위험도 레벨 결정
    const riskLevel = this.determineRiskLevel(zScore, deviation);
    
    // 유효성 판단 (Z-Score > 2 or 편차 > 50%면 이상치)
    const isValid = zScore <= 2 && deviation <= 50;

    return {
      isValid,
      currentPrice: unitPrice,
      averagePrice: avg_price,
      deviation: Math.round(deviation * 100) / 100,
      zScore: Math.round(zScore * 100) / 100,
      riskLevel
    };
  }

  // 위험도 레벨 결정
  private determineRiskLevel(zScore: number, deviation: number): 'low' | 'medium' | 'high' {
    // 높은 위험: Z-Score > 2.5 또는 편차 > 70%
    if (zScore > 2.5 || deviation > 70) {
      return 'high';
    }
    
    // 중간 위험: Z-Score > 1.5 또는 편차 > 30%
    if (zScore > 1.5 || deviation > 30) {
      return 'medium';
    }
    
    // 낮은 위험
    return 'low';
  }

  // 가격 범위 제안
  public generatePriceSuggestion(hsCode: string): Promise<{
    recommendedRange: { min: number; max: number };
    averagePrice: number;
    confidence: number;
  } | null> {
    return new Promise((resolve) => {
      const priceStats = getPriceStats(hsCode);
      
      if (!priceStats) {
        resolve(null);
        return;
      }

      const { avg_price, std_dev, sample_count } = priceStats as any;
      
      // 권장 가격 범위 (평균 ± 1.5 표준편차)
      const range = {
        min: Math.max(0, avg_price - (1.5 * std_dev)),
        max: avg_price + (1.5 * std_dev)
      };

      // 신뢰도 계산 (샘플 수가 많을수록 높은 신뢰도)
      const confidence = Math.min(0.95, Math.max(0.5, sample_count / 1000));

      resolve({
        recommendedRange: {
          min: Math.round(range.min * 100) / 100,
          max: Math.round(range.max * 100) / 100
        },
        averagePrice: Math.round(avg_price * 100) / 100,
        confidence: Math.round(confidence * 100) / 100
      });
    });
  }

  // 가격 트렌드 분석 (시뮬레이션)
  public generatePriceTrend(hsCode: string): {
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercentage: number;
    dataPoints: Array<{ month: string; price: number }>;
  } {
    const priceStats = getPriceStats(hsCode);
    
    if (!priceStats) {
      return {
        trend: 'stable',
        changePercentage: 0,
        dataPoints: []
      };
    }

    const { avg_price, std_dev } = priceStats as any;
    
    // 최근 6개월 가격 트렌드 시뮬레이션
    const months = ['6개월전', '5개월전', '4개월전', '3개월전', '2개월전', '1개월전'];
    const dataPoints = months.map((month, index) => {
      // 약간의 변동성을 가진 가격 생성
      const variation = (Math.random() - 0.5) * std_dev * 0.3;
      const trendFactor = index * 0.02; // 약간의 상승 트렌드
      
      return {
        month,
        price: Math.round((avg_price + variation + trendFactor) * 100) / 100
      };
    });

    // 트렌드 계산
    const firstPrice = dataPoints[0].price;
    const lastPrice = dataPoints[dataPoints.length - 1].price;
    const changePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 5) {
      trend = changePercentage > 0 ? 'increasing' : 'decreasing';
    }

    return {
      trend,
      changePercentage: Math.round(changePercentage * 100) / 100,
      dataPoints
    };
  }

  // 대량 거래 할인 적용 여부 검증
  public validateBulkDiscount(unitPrice: number, quantity: number, hsCode: string): {
    isReasonable: boolean;
    expectedDiscountRange: { min: number; max: number };
    message: string;
  } {
    const priceStats = getPriceStats(hsCode);
    
    if (!priceStats || quantity < 10) {
      return {
        isReasonable: true,
        expectedDiscountRange: { min: 0, max: 0 },
        message: '대량 주문이 아니므로 할인 검증을 생략합니다.'
      };
    }

    const { avg_price } = priceStats as any;
    
    // 수량별 예상 할인율
    let expectedDiscountPercentage = 0;
    if (quantity >= 100) expectedDiscountPercentage = 15;
    else if (quantity >= 50) expectedDiscountPercentage = 10;
    else if (quantity >= 20) expectedDiscountPercentage = 5;
    else if (quantity >= 10) expectedDiscountPercentage = 2;

    const expectedDiscountRange = {
      min: expectedDiscountPercentage - 5,
      max: expectedDiscountPercentage + 5
    };

    // 실제 할인율 계산
    const actualDiscountPercentage = ((avg_price - unitPrice) / avg_price) * 100;
    
    const isReasonable = actualDiscountPercentage >= expectedDiscountRange.min && 
                        actualDiscountPercentage <= expectedDiscountRange.max;

    let message = '';
    if (isReasonable) {
      message = `수량 ${quantity}개에 대한 할인율이 적정합니다.`;
    } else if (actualDiscountPercentage > expectedDiscountRange.max) {
      message = `할인율이 예상보다 높습니다. 추가 검토가 필요할 수 있습니다.`;
    } else {
      message = `수량에 비해 할인율이 낮습니다.`;
    }

    return {
      isReasonable,
      expectedDiscountRange,
      message
    };
  }

  // 계절성 가격 변동 고려
  public applySeasonalAdjustment(baseValidation: PriceValidation, month: number): PriceValidation {
    // 간단한 계절성 팩터 (실제로는 더 복잡한 모델 필요)
    const seasonalFactors = [
      1.0,  // 1월
      0.95, // 2월 (설날 할인)
      1.0,  // 3월
      1.0,  // 4월
      1.0,  // 5월
      1.0,  // 6월
      1.0,  // 7월
      1.0,  // 8월
      1.0,  // 9월
      1.0,  // 10월
      1.1,  // 11월 (블랙프라이데이)
      1.15  // 12월 (크리스마스)
    ];

    const seasonalFactor = seasonalFactors[month - 1] || 1.0;
    const adjustedAverage = baseValidation.averagePrice * seasonalFactor;
    
    // 계절성을 고려한 새로운 편차 계산
    const adjustedDeviation = Math.abs(((baseValidation.currentPrice - adjustedAverage) / adjustedAverage) * 100);

    return {
      ...baseValidation,
      averagePrice: Math.round(adjustedAverage * 100) / 100,
      deviation: Math.round(adjustedDeviation * 100) / 100,
      riskLevel: this.determineRiskLevel(baseValidation.zScore, adjustedDeviation)
    };
  }
}