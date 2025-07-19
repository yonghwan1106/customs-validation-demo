'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Activity, 
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
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

export default function MobileOptimizedDashboard() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    stats: true,
    charts: false,
    trends: false
  });

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
    const interval = setInterval(fetchStats, 10000); // 10초마다 업데이트 (모바일에서는 덜 빈번하게)
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  if (loading && !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-white/20 rounded w-1/2"></div>
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
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">데이터 로드 오류</h3>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* 실시간 통계 요약 - 접을 수 있는 섹션 */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('stats')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-bold">📊 실시간 통계</CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              {expandedSections.stats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.stats && (
          <CardContent className="space-y-4">
            {/* 컴팩트한 통계 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-emerald-400 text-lg font-bold">
                    {stats.summary.total_validations_today.toLocaleString()}
                  </span>
                </div>
                <div className="text-white text-sm font-medium">오늘 총 검증</div>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(stats.summary.hourly_change)}
                  <span className={`text-xs ${getTrendColor(stats.summary.hourly_change)}`}>
                    {stats.summary.hourly_change >= 0 ? '+' : ''}{stats.summary.hourly_change}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-400 text-lg font-bold">
                    {stats.summary.active_users}
                  </span>
                </div>
                <div className="text-white text-sm font-medium">활성 사용자</div>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-200 text-xs">실시간</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-400 text-lg font-bold">
                    {stats.summary.average_success_rate}%
                  </span>
                </div>
                <div className="text-white text-sm font-medium">평균 성공률</div>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${stats.summary.average_success_rate}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <span className="text-orange-400 text-lg font-bold">
                    {stats.summary.processing_time_avg}
                  </span>
                </div>
                <div className="text-white text-sm font-medium">처리 시간</div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs mt-1">
                  목표: 1.0초
                </Badge>
              </div>
            </div>

            <div className="text-center pt-2">
              <div className="text-blue-200 text-xs">
                마지막 업데이트: {new Date(stats.last_updated).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 차트 섹션 - 접을 수 있는 섹션 */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('charts')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-bold">📈 차트 및 분석</CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              {expandedSections.charts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.charts && (
          <CardContent className="space-y-6">
            {/* 위험도 분포 */}
            <div>
              <h4 className="text-white font-semibold mb-3">🎯 위험도 분포</h4>
              <DonutChart 
                data={stats.charts.risk_distribution} 
                title="위험도 분포" 
                height={200}
              />
            </div>

            {/* 국가별 현황 */}
            <div>
              <h4 className="text-white font-semibold mb-3">🌍 국가별 현황</h4>
              <BarChart 
                data={stats.charts.country_stats}
                title="국가별 검증"
                color="#8b5cf6"
                height={200}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 트렌드 섹션 - 접을 수 있는 섹션 */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('trends')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-bold">📊 트렌드 분석</CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              {expandedSections.trends ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.trends && (
          <CardContent className="space-y-6">
            {/* 시간별 트렌드 */}
            <div>
              <h4 className="text-white font-semibold mb-3">⏰ 시간별 트렌드</h4>
              <LineChart 
                data={stats.charts.hourly_trend}
                title="시간별 검증"
                dataKey="validations"
                timeKey="time"
                color="#06b6d4"
                fillColor="rgba(6, 182, 212, 0.1)"
                height={200}
              />
            </div>

            {/* 일별 트렌드 */}
            <div>
              <h4 className="text-white font-semibold mb-3">📅 일별 트렌드</h4>
              <LineChart 
                data={stats.charts.daily_trend}
                title="일별 검증"
                dataKey="validations"
                timeKey="date"
                color="#10b981"
                fillColor="rgba(16, 185, 129, 0.1)"
                height={200}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dashboard PDF Report */}
      <DashboardPDFReport stats={stats} className="mt-6" />
    </div>
  );
}