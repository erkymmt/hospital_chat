import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Target, TrendingUp, Activity, Utensils, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function NewPage() {
  const healthGoal = {
    month: "6月",
    monthlyGoal: "5kg減量",
    dailyGoals: [
      { title: "30分運動", icon: <Activity className="h-4 w-4" /> },
      { title: "1800kcal以下", icon: <Utensils className="h-4 w-4" /> },
      { title: "8時間睡眠", icon: <Moon className="h-4 w-4" /> }
    ],
    achievementRate: 75
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">6月の目標</h1>
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
    </div>
  );
}
