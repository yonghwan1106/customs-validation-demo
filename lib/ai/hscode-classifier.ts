import { HSCodePrediction } from '@/types';
import { searchHSCodes } from '@/lib/database/sqlite';

// Mock AI 모델 - 실제 TensorFlow.js는 나중에 통합
export class HSCodeClassifier {
  private static instance: HSCodeClassifier;
  
  public static getInstance(): HSCodeClassifier {
    if (!HSCodeClassifier.instance) {
      HSCodeClassifier.instance = new HSCodeClassifier();
    }
    return HSCodeClassifier.instance;
  }

  // 상품명을 기반으로 HS코드 예측
  public async classifyItem(itemName: string, description?: string): Promise<HSCodePrediction[]> {
    // 키워드 기반 검색 로직 (실제 AI 모델 시뮬레이션)
    const searchResults = this.searchByKeywords(itemName);
    
    // 신뢰도 점수 계산
    const predictions = searchResults.map((result, index) => {
      const confidence = this.calculateConfidence(itemName, result, index);
      
      return {
        hsCode: result.code,
        description: result.description,
        confidence: confidence,
        tariffRate: result.base_tariff_rate
      };
    });

    // 신뢰도 순으로 정렬
    return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  // 키워드 매칭을 통한 HS코드 검색
  private searchByKeywords(itemName: string): any[] {
    const keywords = this.extractKeywords(itemName);
    let results: any[] = [];

    for (const keyword of keywords) {
      const matches = searchHSCodes(keyword, 5);
      results = [...results, ...matches];
    }

    // 중복 제거
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.code === item.code)
    );

    return uniqueResults.slice(0, 5);
  }

  // 상품명에서 키워드 추출
  private extractKeywords(itemName: string): string[] {
    const normalizedName = itemName.toLowerCase().trim();
    
    // 주요 키워드 매핑 테이블
    const keywordMappings: { [key: string]: string[] } = {
      // 전자제품
      '노트북': ['노트북', 'laptop', 'notebook'],
      '랩톱': ['노트북', 'laptop', 'notebook'],
      'laptop': ['노트북', 'laptop', 'notebook'],
      'notebook': ['노트북', 'laptop', 'notebook'],
      
      // 스마트폰
      '아이폰': ['스마트폰', 'smartphone', 'phone'],
      '갤럭시': ['스마트폰', 'smartphone', 'phone'],
      '스마트폰': ['스마트폰', 'smartphone', 'phone'],
      '휴대폰': ['스마트폰', 'smartphone', 'phone'],
      'phone': ['스마트폰', 'smartphone', 'phone'],
      'iphone': ['스마트폰', 'smartphone', 'phone'],
      
      // 컴퓨터
      '컴퓨터': ['컴퓨터', 'computer', 'PC'],
      '데스크탑': ['컴퓨터', 'desktop', 'PC'],
      'computer': ['컴퓨터', 'computer', 'PC'],
      'desktop': ['컴퓨터', 'desktop', 'PC'],
      
      // 모니터
      '모니터': ['모니터', 'monitor', 'display'],
      '디스플레이': ['모니터', 'monitor', 'display'],
      'monitor': ['모니터', 'monitor', 'display'],
      'display': ['모니터', 'monitor', 'display'],
      
      // 시계
      '시계': ['시계', 'watch'],
      '스마트워치': ['시계', 'smartwatch', 'watch'],
      'watch': ['시계', 'watch'],
      'smartwatch': ['시계', 'smartwatch', 'watch']
    };

    const extractedKeywords: string[] = [];
    
    // 직접 매핑된 키워드 찾기
    for (const [key, mappedKeywords] of Object.entries(keywordMappings)) {
      if (normalizedName.includes(key)) {
        extractedKeywords.push(...mappedKeywords);
      }
    }

    // 브랜드명 추출
    const brands = ['삼성', '애플', 'apple', 'samsung', 'lg', '소니', 'sony'];
    brands.forEach(brand => {
      if (normalizedName.includes(brand)) {
        extractedKeywords.push(brand);
      }
    });

    // 기본 단어 분리
    const words = normalizedName.split(/[\s\-_]+/).filter(word => word.length > 1);
    extractedKeywords.push(...words);

    return [...new Set(extractedKeywords)]; // 중복 제거
  }

  // 신뢰도 점수 계산
  private calculateConfidence(itemName: string, hsCodeData: any, rank: number): number {
    let confidence = 0.5; // 기본 신뢰도

    const normalizedName = itemName.toLowerCase();
    const description = hsCodeData.description.toLowerCase();
    const keywords = hsCodeData.keywords ? hsCodeData.keywords.toLowerCase() : '';

    // 정확한 키워드 매칭 점수
    const nameWords = normalizedName.split(/[\s\-_]+/);
    const keywordArray = keywords.split(',').map((k: string) => k.trim());

    let exactMatches = 0;
    let partialMatches = 0;

    nameWords.forEach(word => {
      if (word.length < 2) return;
      
      // 정확한 매칭
      if (keywordArray.some((k: string) => k === word) || description.includes(word)) {
        exactMatches++;
      }
      // 부분 매칭
      else if (keywordArray.some((k: string) => k.includes(word)) || description.includes(word.substring(0, 3))) {
        partialMatches++;
      }
    });

    // 매칭 점수 계산
    const matchScore = (exactMatches * 0.3 + partialMatches * 0.1);
    confidence += matchScore;

    // 순위 페널티
    confidence -= rank * 0.1;

    // 브랜드 보너스
    const brands = ['삼성', '애플', 'apple', 'samsung'];
    if (brands.some(brand => normalizedName.includes(brand))) {
      confidence += 0.1;
    }

    // 신뢰도 범위 제한 (0.1 ~ 0.98)
    return Math.min(0.98, Math.max(0.1, confidence));
  }

  // HS코드 형식 검증
  public validateHSCodeFormat(hsCode: string): boolean {
    // 10자리 숫자 형식 확인
    const hsCodePattern = /^\d{10}$/;
    return hsCodePattern.test(hsCode);
  }

  // HS코드와 상품명 일치성 검증
  public async validateHSCodeMatch(hsCode: string, itemName: string): Promise<{
    isValid: boolean;
    confidence: number;
    suggestion?: string;
  }> {
    if (!this.validateHSCodeFormat(hsCode)) {
      return {
        isValid: false,
        confidence: 0,
        suggestion: 'HS코드는 10자리 숫자 형식이어야 합니다.'
      };
    }

    // AI 예측과 비교
    const predictions = await this.classifyItem(itemName);
    const matchingPrediction = predictions.find(p => p.hsCode === hsCode);

    if (matchingPrediction) {
      return {
        isValid: true,
        confidence: matchingPrediction.confidence,
      };
    }

    // 일치하지 않는 경우 최고 예측 제안
    const bestPrediction = predictions[0];
    if (bestPrediction && bestPrediction.confidence > 0.7) {
      return {
        isValid: false,
        confidence: 0.3,
        suggestion: `${bestPrediction.hsCode} (${bestPrediction.description})을(를) 권장합니다.`
      };
    }

    return {
      isValid: false,
      confidence: 0.2,
      suggestion: '상품명과 HS코드가 일치하지 않을 수 있습니다.'
    };
  }
}