'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Calculator, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import RealtimeDashboard from "@/components/RealtimeDashboard";
import MobileOptimizedDashboard from "@/components/MobileOptimizedDashboard";
import TourTrigger from "@/components/TourTrigger";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Home() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden tour-welcome">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-purple-950/30"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-blue-800/95 to-indigo-800/95 backdrop-blur-md border-b border-blue-600/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent mb-2">
                  수입신고 검증 시스템
                </h1>
                <p className="text-blue-100 text-lg font-medium">AI 기반 관세청 신고서 사전 검증</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-xl px-4 py-2 text-sm font-semibold">
                🚀 데모 버전
              </Badge>
              <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-white text-sm font-medium">시스템 활성</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="mb-12">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-md border border-blue-400/40 rounded-full mb-8 shadow-xl hover:scale-105 transition-transform">
              <span className="text-blue-100 text-base font-semibold">🏆 2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
              수입신고 오류를<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">사전에 검증</span>하세요
            </h2>
            <p className="text-2xl text-blue-100 mb-12 max-w-5xl mx-auto leading-relaxed">
              첨단 AI 기술로 HS코드, 가격, 원산지를 실시간 분석하여<br />
              <span className="text-cyan-300 font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">통관 지연과 추가 비용을 원천 차단</span>합니다
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center mb-16">
            <Link href="/validation" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className={`group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-0 rounded-2xl tour-validation-button ${
                  isMobile ? 'w-full py-4 px-8 text-lg min-h-[60px]' : 'px-12 py-6 text-xl'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center justify-center">
                  <FileText className={`group-hover:rotate-12 transition-transform ${isMobile ? 'mr-3 h-5 w-5' : 'mr-4 h-7 w-7'}`} />
                  수입신고 검증하기
                  <div className="ml-3 opacity-70 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </Button>
            </Link>
            <Link href="/fta-calculator" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className={`group relative bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-2xl tour-fta-button ${
                  isMobile ? 'w-full py-4 px-8 text-lg min-h-[60px]' : 'px-12 py-6 text-xl'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center">
                  <Calculator className={`group-hover:rotate-12 transition-transform ${isMobile ? 'mr-3 h-5 w-5' : 'mr-4 h-7 w-7'}`} />
                  FTA 혜택 계산하기
                  <div className="ml-3 opacity-70 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Real-time Dashboard */}
          <div className="mb-20 tour-dashboard">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">
                📊 실시간 시스템 현황
              </h3>
              <p className="text-blue-200 text-lg">AI 검증 시스템의 실시간 운영 상태를 확인하세요</p>
            </div>
{isMobile ? <MobileOptimizedDashboard /> : <RealtimeDashboard />}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 tour-features">
          <Card className="group text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold">HS코드 검증</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-200 leading-relaxed">
                AI 모델로 상품명과 HS코드 일치성을 검증하고 올바른 분류를 제안합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="group text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-green-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold">가격 이상치 탐지</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-200 leading-relaxed">
                통계적 분석으로 비정상적인 가격을 탐지하고 적정 가격 범위를 제안합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="group text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold">FTA 혜택 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-200 leading-relaxed">
                원산지별 FTA 혜택을 계산하고 최적의 관세 절약 방안을 제시합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="group text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold">종합 위험도 평가</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-200 leading-relaxed">
                모든 검증 결과를 종합하여 통관 위험도와 예상 처리 시간을 제공합니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Scenarios */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-10 mb-20 shadow-2xl tour-demo-scenarios">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-4">
              🎯 실시간 데모 시나리오
            </h3>
            <p className="text-blue-200 text-lg">실제 수입신고 케이스로 시스템 성능을 확인해보세요</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <Card className="group bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white font-bold">✅ 정상 케이스</CardTitle>
                  <div className="p-2 bg-green-500 rounded-full">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <CardDescription className="text-green-200">스마트폰 수입 (중국산)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-green-100">
                  <div className="flex justify-between">
                    <span>HS코드:</span>
                    <span className="font-mono">8517.12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>단가:</span>
                    <span className="font-mono">$300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>수량:</span>
                    <span className="font-mono">100개</span>
                  </div>
                  <Badge className="bg-green-500 text-white border-0 mt-3">
                    위험도: 낮음
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white font-bold">⚠️ 경고 케이스</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <CardDescription className="text-yellow-200">시계 수입 (브라질산)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-yellow-100">
                  <div className="flex justify-between">
                    <span>HS코드:</span>
                    <span className="font-mono">9101.11</span>
                  </div>
                  <div className="flex justify-between">
                    <span>단가:</span>
                    <span className="font-mono">$1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>수량:</span>
                    <span className="font-mono">2개</span>
                  </div>
                  <Badge className="bg-yellow-500 text-white border-0 mt-3">
                    위험도: 중간
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-400/30 hover:border-red-400/60 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white font-bold">❌ 오류 케이스</CardTitle>
                  <div className="p-2 bg-red-500 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <CardDescription className="text-red-200">노트북 수입 (저가격)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-red-100">
                  <div className="flex justify-between">
                    <span>HS코드:</span>
                    <span className="font-mono">8471.30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>단가:</span>
                    <span className="font-mono">$50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>수량:</span>
                    <span className="font-mono">5개</span>
                  </div>
                  <Badge className="bg-red-500 text-white border-0 mt-3">
                    위험도: 높음
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link href="/validation">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
                🚀 지금 바로 테스트해보기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-slate-800/90 to-blue-800/90 backdrop-blur-sm border-t border-white/10 mt-20 tour-complete">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">수입신고 검증 시스템</span>
              </div>
              <p className="text-blue-200 text-lg mb-2">AI 기반 적극행정 및 규제혁신 솔루션</p>
              <p className="text-cyan-300 text-sm font-medium">🏆 2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>실시간 AI 검증</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>FTA 혜택 분석</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>위험도 평가</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>통관 최적화</span>
              </div>
            </div>

            <div className="text-xs text-blue-300 opacity-75">
              © 2025 수입신고 검증 시스템. 관세청과 수입업체의 디지털 혁신을 위한 AI 솔루션
            </div>
          </div>
        </div>
      </footer>

      {/* 온보딩 투어 */}
      <TourTrigger />
    </div>
  );
}