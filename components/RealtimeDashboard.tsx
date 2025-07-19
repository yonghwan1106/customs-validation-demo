'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Activity, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Globe
} from "lucide-react";
import LineChart from './charts/LineChart';
import DonutChart from './charts/DonutChart';
import BarChart from './charts/BarChart';
import DashboardPDFReport from './DashboardPDFReport';

interface RealtimeStats {
  summary: {
    total_validations_today: number;
    current_hour_validations: number;
    hourly_change: number;
    average_success_rate: number;
    active_users: number;
    processing_time_avg: string;
  };
  charts: {
    hourly_trend: Array<{
      time: string;
      validations: number;
      errors: number;
      success_rate: number;
    }>;
    daily_trend: Array<{
      date: string;
      validations: number;
      errors: number;
      success_rate: number;
    }>;
    risk_distribution: Array<{
      level: string;
      count: number;
      color: string;
    }>;
    country_stats: Array<{
      name: string;
      code: string;
      validations: number;
      percentage: number;
    }>;
  };
  last_updated: string;
}

export default function RealtimeDashboard() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/realtime');
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '데이터를 가져올 수 없습니다.');
      }
      
      setStats(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // 5초마다 데이터 업데이트
    const interval = setInterval(fetchStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        {/* 로딩 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-white/20 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-md border border-red-400/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">데이터 로드 오류</h3>
            <p className="text-red-200">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-blue-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-emerald-400";
    if (change < 0) return "text-red-400";
    return "text-blue-400";
  };

  return (
    <div className="space-y-8">
      {/* 실시간 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 오늘 총 검증 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span>오늘 총 검증</span>
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.summary.total_validations_today.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(stats.summary.hourly_change)}
              <span className={`text-sm font-medium ${getTrendColor(stats.summary.hourly_change)}`}>
                {stats.summary.hourly_change >= 0 ? '+' : ''}{stats.summary.hourly_change} (시간당)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 평균 성공률 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span>평균 성공률</span>
              <BarChart3 className="h-6 w-6 text-cyan-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {stats.summary.average_success_rate}%
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.summary.average_success_rate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* 활성 사용자 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span>활성 사용자</span>
              <Users className="h-6 w-6 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {stats.summary.active_users}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-200">실시간 활성</span>
            </div>
          </CardContent>
        </Card>

        {/* 평균 처리 시간 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span>평균 처리 시간</span>
              <Clock className="h-6 w-6 text-orange-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {stats.summary.processing_time_avg}
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              목표: 1.0초 미만
            </Badge>
          </CardContent>
        </Card>

        {/* 현재 시간 검증 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span>현재 시간 검증</span>
              <Activity className="h-6 w-6 text-blue-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {stats.summary.current_hour_validations}
            </div>
            <div className="text-sm text-blue-200">
              마지막 업데이트: {new Date(stats.last_updated).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* 위험도 분포 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span>위험도 분포</span>
              <PieChart className="h-6 w-6 text-pink-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart 
              data={stats.charts.risk_distribution} 
              title="위험도 분포" 
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 시간별 검증 트렌드 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <span>시간별 검증 트렌드</span>
            </CardTitle>
            <CardDescription className="text-blue-200">
              최근 24시간 검증 건수 추이
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={stats.charts.hourly_trend}
              title="시간별 검증"
              dataKey="validations"
              timeKey="time"
              color="#06b6d4"
              fillColor="rgba(6, 182, 212, 0.1)"
              height={300}
            />
          </CardContent>
        </Card>

        {/* 국가별 수입 현황 */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-400" />
              <span>국가별 수입 현황</span>
            </CardTitle>
            <CardDescription className="text-blue-200">
              오늘 원산지별 검증 건수
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={stats.charts.country_stats}
              title="국가별 검증"
              color="#8b5cf6"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* 일별 트렌드 */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span>주간 검증 트렌드</span>
          </CardTitle>
          <CardDescription className="text-blue-200">
            최근 7일간 일별 검증 건수 및 성공률
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart 
            data={stats.charts.daily_trend}
            title="일별 검증"
            dataKey="validations"
            timeKey="date"
            color="#10b981"
            fillColor="rgba(16, 185, 129, 0.1)"
            height={350}
          />
        </CardContent>
      </Card>

      {/* Dashboard PDF Report */}
      <DashboardPDFReport stats={stats} className="mt-8" />
    </div>
  );
}