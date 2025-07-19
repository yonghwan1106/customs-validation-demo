'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, AlertTriangle, ArrowLeft, Loader2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import TourTrigger from "@/components/TourTrigger";
import PDFReportGenerator from "@/components/PDFReportGenerator";

interface ValidationResult {
  id: string;
  type: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  estimatedClearanceTime: string;
  confidence: number;
}

interface ValidationResponse {
  validationResults: ValidationResult[];
  riskAssessment: RiskAssessment;
  summary: {
    totalChecks: number;
    passedChecks: number;
    warningChecks: number;
    errorChecks: number;
    overallStatus: 'pass' | 'warning' | 'error';
  };
}

export default function ValidationPage() {
  const [formData, setFormData] = useState({
    itemName: '',
    hsCode: '',
    origin: '',
    quantity: '',
    unitPrice: '',
    unit: '개'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    '중국', '미국', '일본', '독일', '프랑스', '이탈리아', '영국', '캐나다', 
    '호주', '브라질', '인도', '러시아', '멕시코', '스페인', '네덜란드', 
    '스위스', '벨기에', '스웨덴', '노르웨이', '덴마크', '폴란드', '체코', 
    '헝가리', '터키', '이스라엘', '남아프리카공화국', '싱가포르', '말레이시아', 
    '태국', '베트남', '인도네시아', '필리핀', '대만', '홍콩', '뉴질랜드', 
    '칠레', '아르헨티나', '콜롬비아'
  ];

  const units = ['개', 'kg', 'g', 'L', 'mL', 'm', 'cm', '박스', '세트', '쌍'];

  const demoScenarios = [
    {
      name: '정상 케이스 - 스마트폰',
      data: {
        itemName: '스마트폰',
        hsCode: '8517.12',
        origin: '중국',
        quantity: '100',
        unitPrice: '300',
        unit: '개'
      }
    },
    {
      name: '경고 케이스 - 시계',
      data: {
        itemName: '시계',
        hsCode: '9101.11',
        origin: '브라질',
        quantity: '2',
        unitPrice: '1200',
        unit: '개'
      }
    },
    {
      name: '오류 케이스 - 노트북',
      data: {
        itemName: '노트북',
        hsCode: '8471.30',
        origin: '한국',
        quantity: '5',
        unitPrice: '50',
        unit: '개'
      }
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadDemoScenario = (scenario: typeof demoScenarios[0]) => {
    setFormData(scenario.data);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/validate/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: formData.itemName,
          hsCode: formData.hsCode,
          origin: formData.origin,
          quantity: parseInt(formData.quantity) || 1,
          unitPrice: parseFloat(formData.unitPrice),
          unit: formData.unit
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '검증 중 오류가 발생했습니다.');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
      case 'high':
        return 'bg-red-500/20 text-red-300 border border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-purple-950/30"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-blue-800/95 to-indigo-800/95 backdrop-blur-md border-b border-blue-600/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 backdrop-blur-sm flex-shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  돌아가기
                </Button>
              </Link>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg md:rounded-xl blur opacity-75"></div>
                <div className="relative p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl shadow-xl">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
                  수입신고 검증
                </h1>
                <p className="text-blue-100 text-xs md:text-sm font-medium">AI 기반 실시간 검증 시스템</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full shadow-lg">
                <span className="text-blue-100 text-xs md:text-sm font-medium text-center leading-tight">
                  🏆 2025 관세청<br className="md:hidden" /> 공모전 출품작
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-white">수입신고 정보 입력</CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  검증하고자 하는 수입신고 정보를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="itemName" className="text-white font-medium">상품명 *</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => handleInputChange('itemName', e.target.value)}
                      placeholder="예: 스마트폰"
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-200 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hsCode" className="text-white font-medium">HS코드</Label>
                    <Input
                      id="hsCode"
                      value={formData.hsCode}
                      onChange={(e) => handleInputChange('hsCode', e.target.value)}
                      placeholder="예: 8517.12 (선택사항)"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-200 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-white font-medium">원산지</Label>
                    <Select value={formData.origin} onValueChange={(value) => handleInputChange('origin', value)}>
                      <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-cyan-400 focus:ring-cyan-400">
                        <SelectValue placeholder="원산지를 선택하세요" className="text-blue-200" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} className="text-white hover:bg-slate-700">
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-white font-medium">수량</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="1"
                        min="1"
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-white font-medium">단위</Label>
                      <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                        <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-cyan-400 focus:ring-cyan-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit} className="text-white hover:bg-slate-700">
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitPrice" className="text-white font-medium">단가 (USD) *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                      placeholder="예: 300.00"
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-200 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        검증 중...
                      </>
                    ) : (
                      '🚀 검증 시작'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Demo Scenarios */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">데모 시나리오</CardTitle>
                <CardDescription className="text-blue-100">
                  미리 준비된 시나리오로 빠르게 테스트해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoScenarios.map((scenario, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                      onClick={() => loadDemoScenario(scenario)}
                    >
                      {scenario.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <>
                {/* Summary */}
                <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      검증 결과 요약
                      <Badge className={getRiskLevelColor(result.riskAssessment.riskLevel)}>
                        위험도: {result.riskAssessment.riskLevel === 'low' ? '낮음' : 
                                result.riskAssessment.riskLevel === 'medium' ? '중간' : '높음'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">
                          {result.riskAssessment.overallRiskScore}
                        </div>
                        <div className="text-sm text-blue-200">위험도 점수</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400">
                          {result.summary.passedChecks}/{result.summary.totalChecks}
                        </div>
                        <div className="text-sm text-blue-200">통과한 검증</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">예상 통관 시간:</span>
                        <span className="font-medium text-white">{result.riskAssessment.estimatedClearanceTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">검증 신뢰도:</span>
                        <span className="font-medium text-white">{Math.round(result.riskAssessment.confidence * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Results */}
                <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">상세 검증 결과</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.validationResults.map((validation) => (
                        <div
                          key={validation.id}
                          className="flex items-start space-x-3 p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm"
                        >
                          {getStatusIcon(validation.status)}
                          <div className="flex-1">
                            <div className="font-medium text-white">{validation.message}</div>
                            {validation.suggestion && (
                              <div className="text-sm text-blue-200 mt-1">
                                💡 {validation.suggestion}
                              </div>
                            )}
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="outline" className="text-xs bg-white/10 text-blue-200 border-white/20">
                                {validation.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-white/10 text-blue-200 border-white/20">
                                신뢰도: {Math.round(validation.confidence * 100)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {result.riskAssessment.recommendations.length > 0 && (
                  <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white">권장사항</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.riskAssessment.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="text-cyan-400 mt-1 font-bold">•</span>
                            <span className="text-sm text-blue-200">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* PDF Report Generator */}
                <PDFReportGenerator 
                  validationResults={result.validationResults}
                  formData={formData}
                  className="mt-6"
                />
              </>
            )}

            {/* Placeholder when no results */}
            {!result && !error && !isLoading && (
              <Card className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardContent>
                  <Shield className="h-20 w-20 text-blue-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    검증 준비 완료
                  </h3>
                  <p className="text-blue-100 text-lg">
                    좌측 폼에 정보를 입력하고 검증을 시작하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* 온보딩 투어 */}
      <TourTrigger />
    </div>
  );
}