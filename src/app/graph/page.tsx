"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

async function registerChartJS() {
  const ChartJS = await import('chart.js');
  const { registry, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } = ChartJS;
  registry.add(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
}

registerChartJS();

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });

const dummyData = {
  bloodPressure: {
    systolic: [120, 125, 130, 128, 122, 118, 115],
    diastolic: [80, 82, 85, 84, 81, 79, 77],
  },
  pulse: [70, 72, 75, 73, 71, 69, 68],
  weight: [70, 70.5, 71, 70.8, 70.2, 69.8, 69.5],
  labels: ['月', '火', '水', '木', '金', '土', '日'],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
};

const bloodPressureData = {
  labels: dummyData.labels,
  datasets: [
    {
      label: '収縮期血圧',
      data: dummyData.bloodPressure.systolic,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: '拡張期血圧',
      data: dummyData.bloodPressure.diastolic,
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    },
  ],
};

const pulseData = {
  labels: dummyData.labels,
  datasets: [
    {
      label: '脈拍',
      data: dummyData.pulse,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    },
  ],
};

const weightData = {
  labels: dummyData.labels,
  datasets: [
    {
      label: '体重',
      data: dummyData.weight,
      borderColor: 'rgb(153, 102, 255)',
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
    },
  ],
};

export default function GraphPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-6">
      {/* メニューバー */}
      <div className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold">メニュー</h2>
        <nav className="space-y-2">
          <Link href="/" className="block px-4 py-2 rounded hover:bg-gray-700">問診</Link>
          <Link href="/workflow" className="block px-4 py-2 rounded hover:bg-gray-700">プラン作成</Link>
          <Link href="/data-record" className="block px-4 py-2 rounded hover:bg-gray-700">データ記録</Link>
          <Link href="/new-page" className="block px-4 py-2 rounded hover:bg-gray-700">月間目標</Link>
          <Link href="/graph" className="block px-4 py-2 rounded hover:bg-gray-700">トレンド</Link>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">ヘルスケアデータトレンド</h1>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Line options={options} data={bloodPressureData} />
          </div>
          <div className="lg:col-span-3">
            <Line options={options} data={pulseData} />
          </div>
          <div className="lg:col-span-3">
            <Line options={options} data={weightData} />
          </div>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="text-center mt-6">
        <Link href="/data-record" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          データ記録に戻る
        </Link>
      </div>
    </div>
  );
}
