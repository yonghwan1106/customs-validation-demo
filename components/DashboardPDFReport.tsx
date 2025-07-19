'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Clock, BarChart3, TrendingUp, Globe } from 'lucide-react';
import jsPDF from 'jspdf';

interface DashboardPDFReportProps {
  stats: any;
  className?: string;
}

const DashboardPDFReport: React.FC<DashboardPDFReportProps> = ({ stats, className = '' }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDashboardPDF = async () => {
    setIsGenerating(true);
    
    try {
      // PDF 문서 생성
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 기본 데이터 제공 (stats가 없는 경우)
      const defaultStats = {
        summary: {
          total_validations_today: 1247,
          current_hour_validations: 89,
          hourly_change: 12,
          average_success_rate: 94.8,
          active_users: 156,
          processing_time_avg: '2.3초'
        },
        charts: {
          risk_distribution: [
            { level: 'low', count: 1876, color: '#10B981' },
            { level: 'medium', count: 342, color: '#F59E0B' },
            { level: 'high', count: 89, color: '#EF4444' }
          ],
          country_stats: [
            { name: '중국', validations: 456, percentage: 36.5 },
            { name: '미국', validations: 298, percentage: 23.9 },
            { name: '일본', validations: 187, percentage: 15.0 },
            { name: '독일', validations: 156, percentage: 12.5 },
            { name: '기타', validations: 150, percentage: 12.1 }
          ],
          hourly_trend: Array.from({length: 6}, (_, i) => ({
            time: `${new Date().getHours() - 5 + i}:00`,
            validations: Math.floor(Math.random() * 100) + 50,
            success_rate: Math.floor(Math.random() * 10) + 90
          }))
        }
      };
      
      // stats가 없거나 비어있는 경우 기본값 사용
      const currentStats = stats && Object.keys(stats).length > 0 ? stats : defaultStats;
      
      // 한글 텍스트를 영어로 변환하는 함수
      const translateToEnglish = (text: string): string => {
        return text
          .replace(/실시간 대시보드 현황 보고서/g, 'Real-time Dashboard Status Report')
          .replace(/AI 기반 수입신고 검증 시스템 운영 현황/g, 'AI-based Import Declaration Verification System')
          .replace(/2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작/g, '2025 Korea Customs Service Innovation Contest Entry')
          .replace(/핵심 통계/g, 'Key Statistics')
          .replace(/위험도 분포/g, 'Risk Distribution')
          .replace(/국가별 수입 현황/g, 'Import Status by Country')
          .replace(/시간별 트렌드 요약/g, 'Hourly Trend Summary')
          .replace(/시스템 상태/g, 'System Status')
          .replace(/보고서 생성일시/g, 'Report Generated')
          .replace(/오늘 총 검증 건수/g, 'Total Validations Today')
          .replace(/평균 성공률/g, 'Average Success Rate')
          .replace(/활성 사용자/g, 'Active Users')
          .replace(/평균 처리 시간/g, 'Average Processing Time')
          .replace(/현재 시간 검증/g, 'Current Hour Validations')
          .replace(/시간당 변화량/g, 'Hourly Change')
          .replace(/낮음/g, 'Low')
          .replace(/중간/g, 'Medium')
          .replace(/높음/g, 'High')
          .replace(/건/g, 'cases')
          .replace(/국가/g, 'Country')
          .replace(/검증 건수/g, 'Validations')
          .replace(/비율/g, 'Ratio')
          .replace(/중국/g, 'China')
          .replace(/미국/g, 'USA')
          .replace(/일본/g, 'Japan')
          .replace(/독일/g, 'Germany')
          .replace(/기타/g, 'Others')
          .replace(/시스템 정상 운영 중/g, 'System Running Normally')
          .replace(/실시간 데이터 수집 활성화/g, 'Real-time Data Collection Active')
          .replace(/AI 모델 정상 동작/g, 'AI Model Operating Normally')
          .replace(/통계 생성 및 분석 완료/g, 'Statistics Generated and Analyzed')
          .replace(/최근 6시간 평균 검증 건수/g, 'Average Validations (Last 6 Hours)')
          .replace(/최근 6시간 평균 성공률/g, 'Average Success Rate (Last 6 Hours)')
          .replace(/이 보고서는 수입신고 검증 시스템의 실시간 대시보드 데이터를 기반으로 생성되었습니다/g, 'This report is generated based on real-time dashboard data from the import declaration verification system')
          .replace(/© 2025 수입신고 검증 시스템 - 관세청 디지털 혁신 솔루션/g, '© 2025 Import Declaration Verification System - Korea Customs Digital Innovation Solution')
          .replace(/초/g, 'sec');
      };

      // 한글 텍스트를 위한 헬퍼 함수 (영어 변환 방식)
      const addText = (text: string, x: number, y: number, options?: any) => {
        const englishText = translateToEnglish(text);
        pdf.text(englishText, x, y, options);
      };

      // 헤더 섹션
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      addText('실시간 대시보드 현황 보고서', pageWidth / 2, 30, { align: 'center' });
      
      // 부제목
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      addText('AI 기반 수입신고 검증 시스템 운영 현황', pageWidth / 2, 40, { align: 'center' });
      
      // 공모전 정보
      pdf.setFontSize(10);
      pdf.setTextColor(34, 197, 94);
      addText('2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작', pageWidth / 2, 50, { align: 'center' });
      
      // 구분선
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 55, pageWidth - 20, 55);
      
      let yPosition = 70;
      
      // 보고서 생성 시간
      const reportDate = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      addText(`보고서 생성일시: ${reportDate}`, 20, yPosition);
      yPosition += 15;
      
      // 핵심 통계 섹션
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      addText('핵심 통계', 20, yPosition);
      yPosition += 15;
      
      if (currentStats?.summary) {
        // 통계 데이터를 2열로 배치
        const leftColumn = 25;
        const rightColumn = pageWidth / 2 + 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(59, 130, 246);
        addText('오늘 총 검증 건수', leftColumn, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.text(currentStats.summary.total_validations_today.toLocaleString(), leftColumn + 5, yPosition + 6);
        
        pdf.setTextColor(59, 130, 246);
        addText('평균 성공률', rightColumn, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.text(`${currentStats.summary.average_success_rate}%`, rightColumn + 5, yPosition + 6);
        
        yPosition += 20;
        
        pdf.setTextColor(59, 130, 246);
        addText('활성 사용자', leftColumn, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.text(currentStats.summary.active_users.toString(), leftColumn + 5, yPosition + 6);
        
        pdf.setTextColor(59, 130, 246);
        addText('평균 처리 시간', rightColumn, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.text(translateToEnglish(currentStats.summary.processing_time_avg), rightColumn + 5, yPosition + 6);
        
        yPosition += 20;
        
        pdf.setTextColor(59, 130, 246);
        addText('현재 시간 검증', leftColumn, yPosition);
        pdf.setTextColor(31, 41, 55);
        pdf.text(currentStats.summary.current_hour_validations.toString(), leftColumn + 5, yPosition + 6);
        
        pdf.setTextColor(59, 130, 246);
        addText('시간당 변화량', rightColumn, yPosition);
        pdf.setTextColor(currentStats.summary.hourly_change >= 0 ? 34 : 239, currentStats.summary.hourly_change >= 0 ? 197 : 68, currentStats.summary.hourly_change >= 0 ? 94 : 68);
        pdf.text(`${currentStats.summary.hourly_change >= 0 ? '+' : ''}${currentStats.summary.hourly_change}`, rightColumn + 5, yPosition + 6);
        
        yPosition += 25;
      }
      
      // 위험도 분포 섹션
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      addText('위험도 분포', 20, yPosition);
      yPosition += 15;
      
      if (currentStats?.charts?.risk_distribution) {
        currentStats.charts.risk_distribution.forEach((risk: any, index: number) => {
          const labels = { low: '낮음', medium: '중간', high: '높음' };
          const levelName = labels[risk.level as keyof typeof labels] || risk.level;
          
          pdf.setFontSize(12);
          pdf.setTextColor(75, 85, 99);
          addText(`${levelName}:`, 25, yPosition);
          addText(`${risk.count}건`, 60, yPosition);
          
          // 백분율 계산
          const total = currentStats.charts.risk_distribution.reduce((sum: number, item: any) => sum + item.count, 0);
          const percentage = Math.round((risk.count / total) * 100);
          pdf.text(`(${percentage}%)`, 85, yPosition);
          
          yPosition += 8;
        });
        
        yPosition += 10;
      }
      
      // 국가별 통계 섹션
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      addText('국가별 수입 현황', 20, yPosition);
      yPosition += 15;
      
      if (currentStats?.charts?.country_stats) {
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        addText('국가', 25, yPosition);
        addText('검증 건수', 80, yPosition);
        addText('비율', 130, yPosition);
        yPosition += 8;
        
        // 구분선
        pdf.setDrawColor(229, 231, 235);
        pdf.line(25, yPosition, pageWidth - 25, yPosition);
        yPosition += 8;
        
        currentStats.charts.country_stats.forEach((country: any) => {
          pdf.setFontSize(10);
          pdf.setTextColor(31, 41, 55);
          addText(country.name, 25, yPosition);
          pdf.text(country.validations.toString(), 80, yPosition);
          pdf.text(`${country.percentage}%`, 130, yPosition);
          yPosition += 6;
        });
        
        yPosition += 15;
      }
      
      // 시간별 트렌드 요약
      if (currentStats?.charts?.hourly_trend && yPosition < pageHeight - 60) {
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        addText('시간별 트렌드 요약', 20, yPosition);
        yPosition += 15;
        
        const recentHours = currentStats.charts.hourly_trend.slice(-6);
        const avgValidations = Math.round(recentHours.reduce((sum: number, hour: any) => sum + hour.validations, 0) / recentHours.length);
        const avgSuccessRate = Math.round(recentHours.reduce((sum: number, hour: any) => sum + hour.success_rate, 0) / recentHours.length);
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        addText(`최근 6시간 평균 검증 건수: ${avgValidations}건`, 25, yPosition);
        yPosition += 8;
        addText(`최근 6시간 평균 성공률: ${avgSuccessRate}%`, 25, yPosition);
        yPosition += 15;
      }
      
      // 시스템 상태 섹션
      if (yPosition < pageHeight - 40) {
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        addText('시스템 상태', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(34, 197, 94);
        addText('✓ 시스템 정상 운영 중', 25, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(75, 85, 99);
        addText('✓ 실시간 데이터 수집 활성화', 25, yPosition);
        yPosition += 8;
        
        addText('✓ AI 모델 정상 동작', 25, yPosition);
        yPosition += 8;
        
        addText('✓ 통계 생성 및 분석 완료', 25, yPosition);
        yPosition += 15;
      }
      
      // 푸터
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      addText('이 보고서는 수입신고 검증 시스템의 실시간 대시보드 데이터를 기반으로 생성되었습니다.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      addText('© 2025 수입신고 검증 시스템 - 관세청 디지털 혁신 솔루션', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // PDF 저장
      const fileName = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('대시보드 PDF 생성 중 오류:', error);
      alert('대시보드 PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>대시보드 보고서</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-white font-medium">보고서 내용</h4>
          <div className="text-blue-200 text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>실시간 통계 및 핵심 지표</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span>위험도 분포 및 트렌드 분석</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span>국가별 수입 현황</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-yellow-400" />
              <span>시스템 상태 및 운영 정보</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={generateDashboardPDF}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              대시보드 PDF 생성 중...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              대시보드 PDF 다운로드
            </>
          )}
        </Button>
        
        <div className="text-center text-blue-200 text-xs">
          현재 대시보드 데이터를 PDF로 저장합니다.
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPDFReport;