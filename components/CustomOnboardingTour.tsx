'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface CustomOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomOnboardingTour: React.FC<CustomOnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const steps: TourStep[] = [
    {
      id: 'welcome',
      target: '.tour-welcome',
      title: '🎉 수입신고 검증 시스템에 오신 것을 환영합니다!',
      content: 'AI 기반 관세청 신고서 사전 검증 시스템의 주요 기능을 소개해드리겠습니다. 2025 관세청 적극행정·규제혁신 아이디어 대국민 공모전 출품작입니다.',
      position: 'center'
    },
    {
      id: 'dashboard',
      target: '.tour-dashboard',
      title: '📊 실시간 대시보드',
      content: '시스템의 실시간 운영 현황을 확인할 수 있습니다. 오늘의 검증 건수, 성공률, 시간별/일별 트렌드, 위험도 분포 등을 5초마다 자동 갱신합니다.',
      position: 'top'
    },
    {
      id: 'validation',
      target: '.tour-validation-button',
      title: '🔍 수입신고 검증',
      content: 'HS코드 검증, 가격 이상치 탐지, 원산지 검증, 종합 위험도 평가 등 주요 검증 기능을 제공합니다. AI 모델과 통계적 분석으로 정확한 결과를 제공합니다.',
      position: 'bottom'
    },
    {
      id: 'fta',
      target: '.tour-fta-button',
      title: '💰 FTA 혜택 계산',
      content: 'FTA(자유무역협정) 관련 혜택을 계산합니다. 원산지별 FTA 적용 가능 여부, 예상 관세 절약 금액, 필요한 원산지 증명서류를 안내합니다.',
      position: 'bottom'
    },
    {
      id: 'features',
      target: '.tour-features',
      title: '🚀 핵심 기능',
      content: '시스템의 4가지 핵심 기능을 확인하세요. HS코드 검증, 가격 이상치 탐지, FTA 혜택 분석, 종합 위험도 평가를 통해 통관 프로세스를 최적화합니다.',
      position: 'bottom'
    },
    {
      id: 'demo',
      target: '.tour-demo-scenarios',
      title: '🎯 실시간 데모',
      content: '실제 수입신고 케이스로 시스템을 테스트해보세요. 정상 케이스, 경고 케이스, 오류 케이스 등 다양한 시나리오를 통해 시스템 성능을 확인할 수 있습니다.',
      position: 'top'
    },
    {
      id: 'complete',
      target: '.tour-complete',
      title: '🎊 투어 완료!',
      content: '수입신고 검증 시스템의 주요 기능을 모두 살펴보았습니다. 이제 실제 기능을 사용해보시고, 궁금한 점이 있으시면 언제든 각 기능을 클릭해보세요!',
      position: 'center'
    }
  ];

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        updateStyles(element, steps[currentStep].position);
        
        // 스크롤하여 요소가 보이도록 조정
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isOpen, currentStep]);

  const updateStyles = (element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // 오버레이 스타일 (하이라이트 효과)
    if (position !== 'center') {
      setOverlayStyle({
        position: 'fixed',
        top: `${rect.top - 10}px`,
        left: `${rect.left - 10}px`,
        width: `${rect.width + 20}px`,
        height: `${rect.height + 20}px`,
        border: '3px solid #3b82f6',
        borderRadius: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
      });
    }

    // 툴팁 스타일
    let tooltipTop = 0;
    let tooltipLeft = 0;

    switch (position) {
      case 'top':
        tooltipTop = rect.top + scrollY - 20;
        tooltipLeft = rect.left + scrollX + rect.width / 2 - 200;
        break;
      case 'bottom':
        tooltipTop = rect.bottom + scrollY + 20;
        tooltipLeft = rect.left + scrollX + rect.width / 2 - 200;
        break;
      case 'left':
        tooltipTop = rect.top + scrollY + rect.height / 2 - 100;
        tooltipLeft = rect.left + scrollX - 420;
        break;
      case 'right':
        tooltipTop = rect.top + scrollY + rect.height / 2 - 100;
        tooltipLeft = rect.right + scrollX + 20;
        break;
      case 'center':
        tooltipTop = window.innerHeight / 2 - 150;
        tooltipLeft = window.innerWidth / 2 - 200;
        break;
    }

    setTooltipStyle({
      position: position === 'center' ? 'fixed' : 'absolute',
      top: `${tooltipTop}px`,
      left: `${tooltipLeft}px`,
      zIndex: 10000,
      width: '400px'
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9998" />
      
      {/* 요소 하이라이트 */}
      {currentStepData.position !== 'center' && (
        <div style={overlayStyle} />
      )}
      
      {/* 툴팁 */}
      <Card className="bg-white shadow-2xl border-0" style={tooltipStyle}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 pr-4">
              {currentStepData.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={skipTour}
                className="text-gray-600"
              >
                건너뛰기
              </Button>
              
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="text-gray-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  이전
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === steps.length - 1 ? '완료' : '다음'}
                {currentStep < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomOnboardingTour;