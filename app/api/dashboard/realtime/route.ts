import { NextResponse } from 'next/server';

// 실시간 대시보드 통계 생성 함수
function generateRealtimeStats() {
  const now = new Date();
  const hourlyData = [];
  const dailyData = [];
  const riskDistribution = [];
  const countryStats = [];

  // 최근 24시간 시간별 데이터 생성
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const validationCount = Math.floor(Math.random() * 50) + 20;
    const errorCount = Math.floor(validationCount * (Math.random() * 0.3 + 0.1));
    
    hourlyData.push({
      time: hour.toISOString(),
      validations: validationCount,
      errors: errorCount,
      success_rate: Math.round(((validationCount - errorCount) / validationCount) * 100)
    });
  }

  // 최근 7일 일별 데이터 생성
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const validationCount = Math.floor(Math.random() * 500) + 200;
    const errorCount = Math.floor(validationCount * (Math.random() * 0.25 + 0.05));
    
    dailyData.push({
      date: day.toISOString().split('T')[0],
      validations: validationCount,
      errors: errorCount,
      success_rate: Math.round(((validationCount - errorCount) / validationCount) * 100)
    });
  }

  // 위험도 분포 데이터
  const totalValidations = hourlyData.reduce((sum, h) => sum + h.validations, 0);
  riskDistribution.push(
    { level: 'low', count: Math.floor(totalValidations * 0.7), color: '#10b981' },
    { level: 'medium', count: Math.floor(totalValidations * 0.2), color: '#f59e0b' },
    { level: 'high', count: Math.floor(totalValidations * 0.1), color: '#ef4444' }
  );

  // 국가별 수입 현황
  const countries = [
    { name: '중국', code: 'CN', validations: Math.floor(Math.random() * 200) + 100 },
    { name: '미국', code: 'US', validations: Math.floor(Math.random() * 150) + 80 },
    { name: '일본', code: 'JP', validations: Math.floor(Math.random() * 100) + 60 },
    { name: '독일', code: 'DE', validations: Math.floor(Math.random() * 80) + 40 },
    { name: '베트남', code: 'VN', validations: Math.floor(Math.random() * 120) + 70 }
  ];

  countryStats.push(...countries.map(country => ({
    ...country,
    percentage: Math.round((country.validations / totalValidations) * 100)
  })));

  // 실시간 통계 요약
  const currentHour = hourlyData[hourlyData.length - 1];
  const previousHour = hourlyData[hourlyData.length - 2];
  const todayTotal = hourlyData.slice(-new Date().getHours()).reduce((sum, h) => sum + h.validations, 0);
  
  return {
    summary: {
      total_validations_today: todayTotal,
      current_hour_validations: currentHour.validations,
      hourly_change: currentHour.validations - previousHour.validations,
      average_success_rate: Math.round(hourlyData.reduce((sum, h) => sum + h.success_rate, 0) / hourlyData.length),
      active_users: Math.floor(Math.random() * 50) + 20,
      processing_time_avg: (Math.random() * 0.5 + 0.8).toFixed(1) + 's'
    },
    charts: {
      hourly_trend: hourlyData,
      daily_trend: dailyData,
      risk_distribution: riskDistribution,
      country_stats: countryStats
    },
    last_updated: now.toISOString()
  };
}

export async function GET() {
  try {
    const stats = generateRealtimeStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('실시간 대시보드 데이터 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '실시간 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}