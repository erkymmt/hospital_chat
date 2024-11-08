import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Target, TrendingUp, Activity, Utensils, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function NewPage() {
  const healthGoal = {
    month: "11月",
    monthlyGoal: "3kg減量",
    dailyGoals: [
      { title: "1日30分運動", icon: <Activity className="h-4 w-4" /> },
      { title: "おやつは1回", icon: <Utensils className="h-4 w-4" /> },
      { title: "8時間睡眠", icon: <Moon className="h-4 w-4" /> }
    ],
    achievementRate: 75
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* メニューバー */}
      <div className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold">メニュー</h2>
        <nav className="space-y-2">
          <Link href="/" className="block px-4 py-2 rounded hover:bg-gray-700">問診</Link>
          <Link href="/workflow" className="block px-4 py-2 rounded hover:bg-gray-700">プラン作成</Link>
          <Link href="/new-page" className="block px-4 py-2 rounded hover:bg-gray-700">月間目標</Link>
          <Link href="/data-record" className="block px-4 py-2 rounded hover:bg-gray-700">データ記録</Link>
          <Link href="/graph" className="block px-4 py-2 rounded hover:bg-gray-700">トレンド</Link>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">11月の目標</h1>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月間目標</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthGoal.month}</div>
                <p className="text-lg text-muted-foreground">目標: {healthGoal.monthlyGoal}</p>
              </CardContent>
            </Card>
          </div>
          {healthGoal.dailyGoals.map((goal, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">毎日の目標 {index + 1}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {goal.icon}
                  <span className="text-xl font-semibold">{goal.title}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">達成率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Progress value={healthGoal.achievementRate} className="w-full" />
              <div className="text-2xl font-bold">{healthGoal.achievementRate}%</div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">今月の目標達成率</p>
          </CardContent>
        </Card>
        <div className="mt-6 text-center space-x-4">
          <Link 
            href="/workflow" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-white rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg"
          >
            戻る
          </Link>
          <Link 
            href="/data-record" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-white rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg"
          >
            データ記録
          </Link>
        </div>
      </div>
    </div>
  );
}
