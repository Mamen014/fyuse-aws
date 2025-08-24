'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { fetcher } from '@/lib/fetcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, Users, RefreshCcw, Percent } from 'lucide-react';
import LineChartCard from '@/components/LineChartCard';
import PieChartCard from '@/components/PieChartCard';
import { useAuth } from 'react-oidc-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DashboardPage() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('all-time');

  // === ACCESS CONTROL ===
  const allowedEmail = "ryaniaska14@gmail.com";

  const { data, error, isLoading } = useSWR(
    `/api/metrics-analyze?timeframe=${timeframe}`,
    fetcher
  );

  const attemptsRaw = data?.dailyAttempts;
  const attempts = Array.isArray(attemptsRaw) ? attemptsRaw : [];

  const totalAttempts = data?.totalAttempts ?? 0;
  const uniqueUsers = data?.users ?? 0;
  const attemptsPerUser = data?.attemptsPerUser ?? 0;
  const successRate =
    data?.successRate != null ? (data.successRate * 100).toFixed(1) + '%' : '—';

  const sortedAttempts = [...attempts].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const styleDistribution = [
    ...(data?.clothingCategories
      ? Object.entries(data.clothingCategories).map(([key, value]) => ({
          label: key, // ← must be the name of the category
          value: value,
        }))
      : []),
    ...(data?.fashionTypes
      ? Object.entries(data.fashionTypes).map(([key, value]) => ({
          label: key,
          value: value,
        }))
      : []),
  ];

  const profileDistribution = [
    ...(data?.bodyShapes
      ? Object.entries(data.bodyShapes).map(([key, value]) => ({
          label: key, // ← name of the body shape
          value: value,
        }))
      : []),
    ...(data?.skinTones
      ? Object.entries(data.skinTones).map(([key, value]) => ({
          label: key,
          value: value,
        }))
      : []),
  ];

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated || auth.user?.profile?.email !== allowedEmail) {
    return <div className="text-red-500 p-4">Unauthorized Access</div>;
  }
    
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Performance Dashboard</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distributions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-days">7-Days</SelectItem>
              <SelectItem value="4-weeks">4-Weeks</SelectItem>
              <SelectItem value="all-time">All time</SelectItem>
            </SelectContent>
          </Select>

          <LineChartCard data={sortedAttempts} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<BarChart2 />}
              label="Styling Attempts"
              value={isLoading ? '—' : totalAttempts}
            />
            <StatCard
              icon={<Users />}
              label="Unique Users"
              value={isLoading ? '—' : uniqueUsers}
            />
            <StatCard
              icon={<RefreshCcw />}
              label="Attempts per User"
              value={isLoading ? '—' : attemptsPerUser}
            />
            <StatCard
              icon={<Percent />}
              label="Success Rate"
              value={isLoading ? '—' : successRate}
            />
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <PieChartCard
            title="Body Shape Distribution"
            data={Object.entries(data?.bodyShapes || {}).map(([label, value]) => ({ label, value }))}
          />

          <PieChartCard
            title="Skin Tone Distribution"
            data={Object.entries(data?.skinTones || {}).map(([label, value]) => ({ label, value }))}
          />

          <PieChartCard
            title="Clothing Category Distribution"
            data={Object.entries(data?.clothingCategories || {}).map(([label, value]) => ({ label, value }))}
          />

          <PieChartCard
            title="Fashion Type Distribution"
            data={Object.entries(data?.fashionTypes || {}).map(([label, value]) => ({ label, value }))}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">Physical Attributes Chart</CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">Style Preferences Chart</CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="flex items-center p-4 gap-4">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
