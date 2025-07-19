'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ValidationResult {
  id: string;
  type: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high';
}

interface PDFReportGeneratorProps {
  validationResults?: ValidationResult[];
  formData?: any;
  className?: string;
}

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({ 
  validationResults = [], 
  formData = {}, 
  className = '' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // PDF 문서 생성
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 한글 텍스트를 위한 헬퍼 함수
      const addKoreanText = (text: string, x: number, y: number, options?: any) => {
        try {
          // 한글 텍스트 처리를 위한 개선된 방법
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.font = '12px Arial, sans-serif';
            const textWidth = ctx.measureText(text).width;
            
            // 텍스트가 너무 길면 줄바꿈 처리
            if (textWidth > 140 && !options?.align) {
              const words = text.split(' ');
              let line = '';
              let currentY = y;
              
              for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const testWidth = ctx.measureText(testLine).width;
                
                if (testWidth > 140 && i > 0) {
                  pdf.text(line.trim(), x, currentY, options);
                  line = words[i] + ' ';
                  currentY += 4;
                } else {
                  line = testLine;
                }
              }
              pdf.text(line.trim(), x, currentY, options);
              return currentY + 4;
            }
          }
          
          // 기본 텍스트 추가
          pdf.text(text, x, y, options);
          return y;
        } catch (error) {
          // fallback: 영어로 대체
          const englishText = text
            .replace(/수입신고 검증 결과 보고서/g, 'Import Declaration Validation Report')
            .replace(/AI 기반 관세청 신고서 사전 검증 시스템/g, 'AI-based Customs Declaration Pre-verification System')
            .replace(/2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작/g, '2025 Korea Customs Service Innovation Contest Entry')
            .replace(/기본 정보/g, 'Basic Information')
            .replace(/검증 결과/g, 'Validation Results')
            .replace(/권장사항/g, 'Recommendations')
            .replace(/상품명/g, 'Item Name')
            .replace(/원산지/g, 'Origin')
            .replace(/수량/g, 'Quantity')
            .replace(/단가/g, 'Unit Price')
            .replace(/검증 일시/g, 'Validation Date')
            .replace(/정상/g, 'Pass')
            .replace(/경고/g, 'Warning')
            .replace(/오류/g, 'Error')
            .replace(/제안/g, 'Suggestion');
          
          pdf.text(englishText, x, y, options);
          return y;
        }
      };
      
      // 헤더 섹션
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // 파란색
      addKoreanText('수입신고 검증 결과 보고서', pageWidth / 2, 30, { align: 'center' });
      
      // 부제목
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128); // 회색
      addKoreanText('AI 기반 관세청 신고서 사전 검증 시스템', pageWidth / 2, 40, { align: 'center' });
      
      // 공모전 정보
      pdf.setFontSize(10);
      pdf.setTextColor(34, 197, 94); // 초록색
      addKoreanText('2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작', pageWidth / 2, 50, { align: 'center' });
      
      // 구분선
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 55, pageWidth - 20, 55);
      
      let yPosition = 70;
      
      // 기본 정보 섹션
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55); // 검은색
      addKoreanText('기본 정보', 20, yPosition);
      yPosition += 10;
      
      // 검증 날짜
      const currentDate = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      addKoreanText(`검증 일시: ${currentDate}`, 25, yPosition);
      yPosition += 6;
      
      // 폼 데이터가 있는 경우 표시
      if (formData.itemName) {
        addKoreanText(`상품명: ${formData.itemName}`, 25, yPosition);
        yPosition += 6;
      }
      
      if (formData.hsCode) {
        addKoreanText(`HS 코드: ${formData.hsCode}`, 25, yPosition);
        yPosition += 6;
      }
      
      if (formData.origin) {
        addKoreanText(`원산지: ${formData.origin}`, 25, yPosition);
        yPosition += 6;
      }
      
      if (formData.quantity && formData.unit) {
        addKoreanText(`수량: ${formData.quantity} ${formData.unit}`, 25, yPosition);
        yPosition += 6;
      }
      
      if (formData.unitPrice) {
        addKoreanText(`단가: $${formData.unitPrice}`, 25, yPosition);
        yPosition += 6;
      }
      
      yPosition += 10;
      
      // 검증 결과 섹션
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      addKoreanText('검증 결과', 20, yPosition);
      yPosition += 10;
      
      if (validationResults.length > 0) {
        // 통계 정보
        const passCount = validationResults.filter(r => r.status === 'pass').length;
        const warningCount = validationResults.filter(r => r.status === 'warning').length;
        const errorCount = validationResults.filter(r => r.status === 'error').length;
        
        pdf.setFontSize(12);
        pdf.setTextColor(34, 197, 94); // 초록색
        addKoreanText(`정상: ${passCount}`, 25, yPosition);
        
        pdf.setTextColor(251, 191, 36); // 노란색
        addKoreanText(`경고: ${warningCount}`, 70, yPosition);
        
        pdf.setTextColor(239, 68, 68); // 빨간색
        addKoreanText(`오류: ${errorCount}`, 115, yPosition);
        
        yPosition += 15;
        
        // 각 검증 결과 표시
        validationResults.forEach((result, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
          
          // 결과 아이콘 및 제목
          pdf.setFontSize(11);
          
          switch (result.status) {
            case 'pass':
              pdf.setTextColor(34, 197, 94);
              pdf.text('✓', 25, yPosition);
              break;
            case 'warning':
              pdf.setTextColor(251, 191, 36);
              pdf.text('⚠', 25, yPosition);
              break;
            case 'error':
              pdf.setTextColor(239, 68, 68);
              pdf.text('✗', 25, yPosition);
              break;
          }
          
          // 검증 유형
          pdf.setTextColor(75, 85, 99);
          addKoreanText(result.type, 35, yPosition);
          
          yPosition += 6;
          
          // 메시지
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          const messageLines = pdf.splitTextToSize(result.message, pageWidth - 50);
          messageLines.forEach((line: string, lineIndex: number) => {
            addKoreanText(line, 35, yPosition + (lineIndex * 4));
          });
          yPosition += messageLines.length * 4;
          
          // 제안사항
          if (result.suggestion) {
            pdf.setTextColor(59, 130, 246);
            const suggestionLines = pdf.splitTextToSize(`제안: ${result.suggestion}`, pageWidth - 50);
            suggestionLines.forEach((line: string, lineIndex: number) => {
              addKoreanText(line, 35, yPosition + (lineIndex * 4));
            });
            yPosition += suggestionLines.length * 4;
          }
          
          yPosition += 8;
        });
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        addKoreanText('검증 결과가 없습니다.', 25, yPosition);
        yPosition += 15;
      }
      
      // 권장사항 섹션
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      addKoreanText('권장사항', 20, yPosition);
      yPosition += 10;
      
      const recommendations = [
        '정확한 HS 코드 분류를 위해 관세청 HS 코드 검색 서비스를 활용하세요.',
        '가격 이상치가 발견된 경우, 시장 가격을 재조사하고 적정 가격을 적용하세요.',
        'FTA 혜택을 받기 위해 원산지 증명서를 정확히 준비하세요.',
        '통관 지연을 방지하기 위해 모든 서류를 사전에 검토하세요.',
        '정기적인 검증을 통해 신고 정확도를 높이세요.'
      ];
      
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      
      recommendations.forEach((rec, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 30;
        }
        
        addKoreanText(`${index + 1}. ${rec}`, 25, yPosition);
        yPosition += 6;
      });
      
      // 푸터
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      addKoreanText('이 보고서는 AI 기반 수입신고 검증 시스템에 의해 생성되었습니다.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      addKoreanText('© 2025 수입신고 검증 시스템 - 관세청 디지털 혁신 솔루션', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // PDF 저장
      const fileName = `Import_Validation_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 결과 통계 계산
  const passCount = validationResults.filter(r => r.status === 'pass').length;
  const warningCount = validationResults.filter(r => r.status === 'warning').length;
  const errorCount = validationResults.filter(r => r.status === 'error').length;
  const totalCount = validationResults.length;

  return (
    <Card className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>PDF 보고서 생성</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 결과 요약 */}
        {totalCount > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">검증 결과 요약</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                <div className="text-emerald-300 font-bold">{passCount}</div>
                <div className="text-emerald-200 text-xs">정상</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <div className="text-yellow-300 font-bold">{warningCount}</div>
                <div className="text-yellow-200 text-xs">경고</div>
              </div>
              <div className="text-center p-2 bg-red-500/20 rounded-lg border border-red-400/30">
                <div className="text-red-300 font-bold">{errorCount}</div>
                <div className="text-red-200 text-xs">오류</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 보고서 내용 미리보기 */}
        <div className="space-y-2">
          <h4 className="text-white font-medium">보고서 내용</h4>
          <div className="text-blue-200 text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>기본 정보 및 검증 데이터</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>검증 결과 분석 및 통계</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span>권장사항 및 개선 방안</span>
            </div>
          </div>
        </div>
        
        {/* 생성 버튼 */}
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              PDF 생성 중...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              PDF 보고서 다운로드
            </>
          )}
        </Button>
        
        <div className="text-center text-blue-200 text-xs">
          보고서에는 검증 결과, 권장사항, 개선 방안이 포함됩니다.
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFReportGenerator;