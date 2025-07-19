'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, Loader2, DollarSign, TrendingUp, Flag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import TourTrigger from "@/components/TourTrigger";

interface FTABenefit {
  country: string;
  baseRate: string;
  ftaRate: string;
  savingsAmount: number;
  savingsPercentage: number;
  requiresCertificate: boolean;
  certificateType?: string;
}

interface FTACalculationResponse {
  benefits: FTABenefit[];
  recommendedOrigin?: string;
}

export default function FTACalculatorPage() {
  const [formData, setFormData] = useState({
    hsCode: '',
    origin: '',
    totalValue: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FTACalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    '중국', '미국', '일본', '독일', '프랑스', '이탈리아', '영국', '캐나다', 
    '호주', '브라질', '인도', '러시아', '멕시코', '스페인', '네덜란드', 
    '스위스', '벨기에', '스웨덴', '노르웨이', '덴마크', '폴란드', '체코', 
    '헝가리', '터키', '이스라엘', '남아프리카공화국', '싱가포르', '말레이시아', 
    '태국', '베트남', '인도네시아', '필리핀', '대만', '홍콩', '뉴질랜드', 
    '칠레', '아르헨티나', '콜롬비아'
  ];

  const popularHSCodes = [
    { code: '8517120000', name: '스마트폰' },
    { code: '8471300000', name: '노트북' },
    { code: '9102210000', name: '시계' },
    { code: '8471490000', name: '데스크탑' },
    { code: '8528721000', name: 'LCD 모니터' }
  ];

  const demoScenarios = [
    {
      name: '스마트폰 수입 - 중국산',
      data: {
        hsCode: '8517120000',
        origin: '중국',
        totalValue: '30000'
      }
    },
    {
      name: '노트북 수입 - 미국산',
      data: {
        hsCode: '8471300000',
        origin: '미국',
        totalValue: '50000'
      }
    },
    {
      name: '시계 수입 - 일본산',
      data: {
        hsCode: '9102210000',
        origin: '일본',
        totalValue: '15000'
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

  const loadHSCode = (hsCode: string) => {
    setFormData(prev => ({ ...prev, hsCode }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fta/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hsCode: formData.hsCode,
          origin: formData.origin,
          totalValue: parseFloat(formData.totalValue)
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'FTA 계산 중 오류가 발생했습니다.');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBestBenefit = (benefits: FTABenefit[]) => {
    return benefits
      .filter(b => b.country !== '기본 관세')
      .sort((a, b) => b.savingsAmount - a.savingsAmount)[0];
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
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-purple-800/95 to-pink-800/95 backdrop-blur-md border-b border-purple-600/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg md:rounded-xl blur opacity-75"></div>
                <div className="relative p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg md:rounded-xl shadow-xl">
                  <Calculator className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent leading-tight">
                  FTA 혜택 계산기
                </h1>
                <p className="text-purple-100 text-xs md:text-sm font-medium">자유무역협정 혜택 분석 시스템</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full shadow-lg">
                <span className="text-purple-100 text-xs md:text-sm font-medium text-center leading-tight">
                  🏆 2025 관세청<br className="md:hidden" /> 공모전 출품작
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calculator className="h-5 w-5 text-purple-400" />
                  <span>FTA 혜택 계산</span>
                </CardTitle>
                <CardDescription className="text-purple-100">
                  HS코드와 원산지를 입력하여 FTA 혜택을 계산해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hsCode" className="text-white font-medium">HS코드 *</Label>
                    <Input
                      id="hsCode"
                      value={formData.hsCode}
                      onChange={(e) => handleInputChange('hsCode', e.target.value)}
                      placeholder="예: 8517120000 (10자리)"
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400 text-base md:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-white font-medium">원산지 *</Label>
                    <Select value={formData.origin} onValueChange={(value) => handleInputChange('origin', value)}>
                      <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-purple-400 focus:ring-purple-400 h-12 md:h-10">
                        <SelectValue placeholder="원산지를 선택하세요" className="text-purple-200" />
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

                  <div className="space-y-2">
                    <Label htmlFor="totalValue" className="text-white font-medium">총 금액 (USD) *</Label>
                    <Input
                      id="totalValue"
                      type="number"
                      step="0.01"
                      value={formData.totalValue}
                      onChange={(e) => handleInputChange('totalValue', e.target.value)}
                      placeholder="예: 30000.00"
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400 focus:ring-purple-400 text-base md:text-sm"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 md:py-3 text-lg md:text-base rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        계산 중...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-3 h-5 w-5" />
                        FTA 혜택 계산
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Popular HS Codes */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">인기 HS코드</CardTitle>
                <CardDescription className="text-purple-100">
                  자주 사용되는 HS코드를 클릭하여 빠르게 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popularHSCodes.map((item) => (
                    <Button
                      key={item.code}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 p-4 md:p-3 h-auto"
                      onClick={() => loadHSCode(item.code)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-base md:text-sm">{item.code}</div>
                        <div className="text-sm md:text-xs text-purple-200 mt-1">{item.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Scenarios */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">데모 시나리오</CardTitle>
                <CardDescription className="text-purple-100">
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
                      className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 py-4 md:py-3 text-base md:text-sm"
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
                    <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-white">
                      <span>FTA 혜택 요약</span>
                      {result.recommendedOrigin && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg px-3 py-1 text-sm self-start md:self-auto">
                          추천: {result.recommendedOrigin}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const bestBenefit = getBestBenefit(result.benefits);
                      if (bestBenefit) {
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-lg border border-emerald-400/30">
                              <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2">
                                {formatCurrency(bestBenefit.savingsAmount)}
                              </div>
                              <div className="text-base md:text-sm text-emerald-200">최대 절약액</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg border border-purple-400/30">
                              <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
                                {Math.round(bestBenefit.savingsPercentage)}%
                              </div>
                              <div className="text-base md:text-sm text-purple-200">절약 비율</div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-center text-purple-200 py-8">
                          해당 품목에 대한 FTA 혜택이 없습니다.
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Detailed Benefits */}
                <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">국가별 FTA 혜택</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className={`p-4 md:p-3 rounded-lg border ${
                            benefit.country === '기본 관세' 
                              ? 'bg-white/5 border-white/20' 
                              : benefit.savingsAmount > 0 
                                ? 'bg-emerald-500/10 border-emerald-400/30' 
                                : 'bg-yellow-500/10 border-yellow-400/30'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                            <div className="flex items-center space-x-2 flex-wrap">
                              {benefit.country !== '기본 관세' && <Flag className="h-4 w-4 text-purple-400" />}
                              <span className="font-medium text-white text-base md:text-sm">{benefit.country}</span>
                              {benefit.requiresCertificate && (
                                <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-200">
                                  증명서 필요
                                </Badge>
                              )}
                            </div>
                            {benefit.savingsAmount > 0 && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 self-start md:self-auto">
                                {formatCurrency(benefit.savingsAmount)} 절약
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                            <div className="bg-white/5 p-3 md:p-2 rounded border border-white/10">
                              <span className="text-purple-200 block mb-1">기본 관세율:</span>
                              <span className="font-medium text-white text-base md:text-sm">{benefit.baseRate}</span>
                            </div>
                            <div className="bg-white/5 p-3 md:p-2 rounded border border-white/10">
                              <span className="text-purple-200 block mb-1">FTA 관세율:</span>
                              <span className="font-medium text-emerald-400 text-base md:text-sm">{benefit.ftaRate}</span>
                            </div>
                          </div>

                          {benefit.savingsPercentage > 0 && (
                            <div className="mt-3 flex items-center space-x-1 text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-400/20">
                              <TrendingUp className="h-4 w-4" />
                              <span>{Math.round(benefit.savingsPercentage)}% 관세 절약</span>
                            </div>
                          )}

                          {benefit.certificateType && (
                            <div className="mt-3 text-xs text-purple-200 bg-white/5 p-2 rounded border border-white/10">
                              필요 증명서: {benefit.certificateType}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">FTA 활용 가이드</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 md:space-y-3 text-sm">
                      <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-purple-400/20">
                        <span className="text-purple-400 mt-1 text-lg">💡</span>
                        <div className="text-purple-100">
                          <strong className="text-white block mb-1">원산지증명서:</strong>
                          <span className="text-base md:text-sm">FTA 혜택을 받기 위해서는 해당 국가의 원산지증명서가 필요할 수 있습니다.</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-blue-400/20">
                        <span className="text-blue-400 mt-1 text-lg">📋</span>
                        <div className="text-purple-100">
                          <strong className="text-white block mb-1">부가 서류:</strong>
                          <span className="text-base md:text-sm">일부 품목의 경우 추가적인 증명 서류가 요구될 수 있습니다.</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-cyan-400/20">
                        <span className="text-cyan-400 mt-1 text-lg">🕒</span>
                        <div className="text-purple-100">
                          <strong className="text-white block mb-1">처리 시간:</strong>
                          <span className="text-base md:text-sm">FTA 혜택 적용 시 통관 처리 시간이 달라질 수 있습니다.</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-yellow-400/20">
                        <span className="text-yellow-400 mt-1 text-lg">⚖️</span>
                        <div className="text-purple-100">
                          <strong className="text-white block mb-1">법적 요구사항:</strong>
                          <span className="text-base md:text-sm">실제 FTA 적용 시에는 관세청의 최신 규정을 확인하시기 바랍니다.</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Placeholder when no results */}
            {!result && !error && !isLoading && (
              <Card className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardContent>
                  <Calculator className="h-20 w-20 text-purple-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    FTA 계산기 준비 완료
                  </h3>
                  <p className="text-purple-100 text-lg">
                    좌측 폼에 정보를 입력하고 FTA 혜택을 계산해보세요.
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