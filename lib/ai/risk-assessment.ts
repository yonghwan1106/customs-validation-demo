import { ValidationResult } from '@/types';

export interface RiskAssessment {
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  recommendations: string[];
  estimatedClearanceTime: string;
  confidence: number;
}

export interface RiskFactor {
  category: 'hscode' | 'price' | 'origin' | 'quantity' | 'compliance';
  description: string;
  impact: number; // 1-10
  weight: number; // 0.0-1.0
  status: 'normal' | 'caution' | 'alert';
}

export class RiskAssessmentEngine {
  private static instance: RiskAssessmentEngine;
  
  public static getInstance(): RiskAssessmentEngine {
    if (!RiskAssessmentEngine.instance) {
      RiskAssessmentEngine.instance = new RiskAssessmentEngine();
    }
    return RiskAssessmentEngine.instance;
  }

  // 종합 위험도 평가
  public assessOverallRisk(validationResults: ValidationResult[], declarationData: any): RiskAssessment {
    const riskFactors = this.calculateRiskFactors(validationResults, declarationData);
    const overallScore = this.calculateOverallScore(riskFactors);
    const riskLevel = this.determineRiskLevel(overallScore);
    const recommendations = this.generateRecommendations(riskFactors, riskLevel);
    const estimatedTime = this.estimateClearanceTime(riskLevel, riskFactors);
    const confidence = this.calculateConfidence(validationResults);

    return {
      overallRiskScore: Math.round(overallScore * 10) / 10,
      riskLevel,
      riskFactors,
      recommendations,
      estimatedClearanceTime: estimatedTime,
      confidence
    };
  }

  // 위험 요소 계산
  private calculateRiskFactors(validationResults: ValidationResult[], declarationData: any): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // HS코드 위험도
    const hsCodeResult = validationResults.find(r => r.type === 'hscode');
    if (hsCodeResult) {
      factors.push(this.assessHSCodeRisk(hsCodeResult));
    }

    // 가격 위험도
    const priceResult = validationResults.find(r => r.type === 'price');
    if (priceResult) {
      factors.push(this.assessPriceRisk(priceResult));
    }

    // 원산지 위험도
    const originResult = validationResults.find(r => r.type === 'origin');
    if (originResult) {
      factors.push(this.assessOriginRisk(originResult));
    }

    // 수량 위험도
    if (declarationData) {
      factors.push(this.assessQuantityRisk(declarationData));
    }

    // 컴플라이언스 위험도
    factors.push(this.assessComplianceRisk(validationResults, declarationData));

    return factors;
  }

  // HS코드 위험도 평가
  private assessHSCodeRisk(result: ValidationResult): RiskFactor {
    let impact = 1;
    let status: 'normal' | 'caution' | 'alert' = 'normal';

    if (result.status === 'error') {
      impact = 8;
      status = 'alert';
    } else if (result.status === 'warning') {
      impact = 5;
      status = 'caution';
    } else if (result.confidence && result.confidence < 0.8) {
      impact = 3;
      status = 'caution';
    }

    return {
      category: 'hscode',
      description: result.message,
      impact,
      weight: 0.3, // HS코드는 높은 가중치
      status
    };
  }

  // 가격 위험도 평가
  private assessPriceRisk(result: ValidationResult): RiskFactor {
    let impact = 1;
    let status: 'normal' | 'caution' | 'alert' = 'normal';

    if (result.status === 'error') {
      impact = 9;
      status = 'alert';
    } else if (result.status === 'warning') {
      impact = 6;
      status = 'caution';
    }

    return {
      category: 'price',
      description: result.message,
      impact,
      weight: 0.25, // 가격도 중요한 요소
      status
    };
  }

  // 원산지 위험도 평가
  private assessOriginRisk(result: ValidationResult): RiskFactor {
    let impact = 1;
    let status: 'normal' | 'caution' | 'alert' = 'normal';

    if (result.status === 'error') {
      impact = 7;
      status = 'alert';
    } else if (result.status === 'warning') {
      impact = 4;
      status = 'caution';
    }

    return {
      category: 'origin',
      description: result.message,
      impact,
      weight: 0.25,
      status
    };
  }

  // 수량 위험도 평가
  private assessQuantityRisk(declarationData: any): RiskFactor {
    let impact = 1;
    let status: 'normal' | 'caution' | 'alert' = 'normal';
    let description = '수량이 정상 범위입니다.';

    if (declarationData.totalValue > 100000) {
      impact = 5;
      status = 'caution';
      description = '고액 신고로 추가 검토가 필요할 수 있습니다.';
    }

    if (declarationData.quantity > 1000) {
      impact = Math.max(impact, 6);
      status = 'caution';
      description = '대량 신고로 상업적 목적 여부 확인이 필요합니다.';
    }

    return {
      category: 'quantity',
      description,
      impact,
      weight: 0.1,
      status
    };
  }

  // 컴플라이언스 위험도 평가
  private assessComplianceRisk(validationResults: ValidationResult[], declarationData: any): RiskFactor {
    const errorCount = validationResults.filter(r => r.status === 'error').length;
    const warningCount = validationResults.filter(r => r.status === 'warning').length;

    let impact = 1;
    let status: 'normal' | 'caution' | 'alert' = 'normal';
    let description = '전반적인 컴플라이언스 상태가 양호합니다.';

    if (errorCount > 0) {
      impact = 7 + errorCount;
      status = 'alert';
      description = `${errorCount}개의 오류가 발견되어 수정이 필요합니다.`;
    } else if (warningCount > 1) {
      impact = 4 + warningCount;
      status = 'caution';
      description = `${warningCount}개의 경고사항이 있어 검토가 권장됩니다.`;
    }

    return {
      category: 'compliance',
      description,
      impact,
      weight: 0.1,
      status
    };
  }

  // 전체 위험도 점수 계산
  private calculateOverallScore(riskFactors: RiskFactor[]): number {
    let weightedScore = 0;
    let totalWeight = 0;

    riskFactors.forEach(factor => {
      weightedScore += (factor.impact * 10) * factor.weight;
      totalWeight += factor.weight;
    });

    // 정규화 (0-100)
    return totalWeight > 0 ? Math.min(100, weightedScore / totalWeight) : 0;
  }

  // 위험도 레벨 결정
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // 권장사항 생성
  private generateRecommendations(riskFactors: RiskFactor[], riskLevel: 'low' | 'medium' | 'high'): string[] {
    const recommendations: string[] = [];

    // 위험도별 기본 권장사항
    if (riskLevel === 'high') {
      recommendations.push('즉시 신고서를 검토하고 오류를 수정하시기 바랍니다.');
      recommendations.push('관세사 또는 전문가와 상담을 권장합니다.');
    } else if (riskLevel === 'medium') {
      recommendations.push('신고서 제출 전 추가 검토를 권장합니다.');
    } else {
      recommendations.push('신고서가 양호한 상태입니다. 제출하셔도 됩니다.');
    }

    // 위험 요소별 구체적 권장사항
    riskFactors.forEach(factor => {
      if (factor.status === 'alert') {
        switch (factor.category) {
          case 'hscode':
            recommendations.push('HS코드를 재검토하고 정확한 분류를 확인하세요.');
            break;
          case 'price':
            recommendations.push('가격 정보를 확인하고 필요시 증빙서류를 준비하세요.');
            break;
          case 'origin':
            recommendations.push('원산지 정보를 재확인하고 FTA 혜택을 검토하세요.');
            break;
          case 'quantity':
            recommendations.push('수량 정보가 정확한지 확인하세요.');
            break;
          case 'compliance':
            recommendations.push('모든 오류를 수정한 후 재검증하세요.');
            break;
        }
      }
    });

    // 중복 제거 및 정렬
    return [...new Set(recommendations)];
  }

  // 예상 통관 시간 계산
  private estimateClearanceTime(riskLevel: 'low' | 'medium' | 'high', riskFactors: RiskFactor[]): string {
    const alertFactors = riskFactors.filter(f => f.status === 'alert').length;
    const cautionFactors = riskFactors.filter(f => f.status === 'caution').length;

    if (riskLevel === 'high' || alertFactors > 0) {
      return '2-5일 (추가 검토 필요)';
    }

    if (riskLevel === 'medium' || cautionFactors > 1) {
      return '1-2일 (일반 심사)';
    }

    return '당일-1일 (신속 처리)';
  }

  // 신뢰도 계산
  private calculateConfidence(validationResults: ValidationResult[]): number {
    if (validationResults.length === 0) return 0.5;

    const confidenceSum = validationResults.reduce((sum, result) => {
      return sum + (result.confidence || 0.7);
    }, 0);

    const averageConfidence = confidenceSum / validationResults.length;
    
    // 검증 항목 수에 따른 보정
    const completenessBonus = Math.min(0.2, validationResults.length * 0.05);
    
    return Math.min(0.98, averageConfidence + completenessBonus);
  }

  // 리스크 히트맵 생성
  public generateRiskHeatmap(riskFactors: RiskFactor[]): {
    categories: string[];
    impactLevels: number[];
    riskMatrix: Array<{category: string; impact: number; weight: number; color: string}>;
  } {
    const categories = riskFactors.map(f => f.category);
    const impactLevels = riskFactors.map(f => f.impact);

    const riskMatrix = riskFactors.map(factor => {
      let color = '#22c55e'; // green (low risk)
      
      if (factor.impact >= 7) {
        color = '#ef4444'; // red (high risk)
      } else if (factor.impact >= 4) {
        color = '#f59e0b'; // yellow (medium risk)
      }

      return {
        category: factor.category,
        impact: factor.impact,
        weight: factor.weight,
        color
      };
    });

    return {
      categories,
      impactLevels,
      riskMatrix
    };
  }

  // 위험도 트렌드 분석 (시뮬레이션)
  public generateRiskTrend(currentAssessment: RiskAssessment): {
    trend: 'improving' | 'stable' | 'deteriorating';
    projectedScore: number;
    factors: string[];
  } {
    // 현재 위험도를 기준으로 트렌드 시뮬레이션
    const { overallRiskScore, riskFactors } = currentAssessment;
    
    // 개선 요소와 악화 요소 분석
    const improvingFactors = riskFactors.filter(f => f.status === 'normal').length;
    const deterioratingFactors = riskFactors.filter(f => f.status === 'alert').length;
    
    let trend: 'improving' | 'stable' | 'deteriorating' = 'stable';
    let projectedScore = overallRiskScore;
    const factors: string[] = [];

    if (deterioratingFactors > improvingFactors) {
      trend = 'deteriorating';
      projectedScore = Math.min(100, overallRiskScore * 1.2);
      factors.push('미해결 오류로 인한 위험도 증가');
    } else if (improvingFactors > deterioratingFactors + 1) {
      trend = 'improving';
      projectedScore = Math.max(0, overallRiskScore * 0.8);
      factors.push('검증 완료 항목 증가로 위험도 감소');
    } else {
      factors.push('현재 위험도 수준 유지');
    }

    return {
      trend,
      projectedScore: Math.round(projectedScore * 10) / 10,
      factors
    };
  }
}