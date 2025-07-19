'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play, X } from 'lucide-react';
import CustomOnboardingTour from './CustomOnboardingTour';
import { useIsMobile } from '@/hooks/useIsMobile';

const TourTrigger: React.FC = () => {
  const [showTour, setShowTour] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // 첫 방문 확인
    const hasVisited = localStorage.getItem('customs-demo-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowWelcome(true);
      localStorage.setItem('customs-demo-visited', 'true');
    }
  }, []);

  const startTour = () => {
    setShowTour(true);
    setShowWelcome(false);
  };

  const closeTour = () => {
    setShowTour(false);
  };

  const closeWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {/* 첫 방문 환영 메시지 */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full p-6 relative ${isMobile ? 'max-w-sm' : 'max-w-md p-8'}`}>
            <button
              onClick={closeWelcome}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                처음 방문하셨군요! 👋
              </h2>
              <p className="text-gray-600 mb-4">
                수입신고 검증 시스템의 주요 기능을 안내해드릴까요?
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">투어에서 알아볼 내용:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 실시간 대시보드 사용법</li>
                <li>• 수입신고 검증 프로세스</li>
                <li>• FTA 혜택 계산 방법</li>
                <li>• 시스템 주요 기능 설명</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={startTour}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                투어 시작하기
              </Button>
              <Button 
                onClick={closeWelcome}
                variant="outline"
                className="flex-1"
              >
                나중에 하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 투어 버튼 */}
      <div className={`fixed z-40 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
        <Button
          onClick={startTour}
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full ${
            isMobile ? 'p-3 min-h-[48px] min-w-[48px]' : 'p-4'
          }`}
          title="가이드 투어 시작"
        >
          <HelpCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
        </Button>
      </div>

      {/* 투어 컴포넌트 */}
      <CustomOnboardingTour isOpen={showTour} onClose={closeTour} />
    </>
  );
};

export default TourTrigger;