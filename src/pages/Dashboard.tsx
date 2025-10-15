import { useState } from "react";
import Layout from "@/components/Layout";
import KPICard from "@/components/dashboard/KPICard";
import EmailChart from "@/components/dashboard/EmailChart";
import TimeDistributionChart from "@/components/dashboard/TimeDistributionChart";
import TopFailureTable from "@/components/dashboard/TopFailureTable";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"weekly" | "last30days">("weekly");

  // Mock data for KPIs
  const kpiData = {
    total: 15234,
    success: 14567,
    fail: 667,
  };

  // Mock data for chart
  const weeklyData = [
    { date: "จ", total: 2100, success: 2000, fail: 100 },
    { date: "อ", total: 2300, success: 2200, fail: 100 },
    { date: "พ", total: 2500, success: 2400, fail: 100 },
    { date: "พฤ", total: 2200, success: 2100, fail: 100 },
    { date: "ศ", total: 2400, success: 2300, fail: 100 },
    { date: "ส", total: 1900, success: 1800, fail: 100 },
    { date: "อา", total: 1834, success: 1767, fail: 67 },
  ];

  const last30DaysData = [
    { date: "สัปดาห์ 1", total: 14000, success: 13400, fail: 600 },
    { date: "สัปดาห์ 2", total: 15234, success: 14567, fail: 667 },
    { date: "สัปดาห์ 3", total: 16500, success: 15800, fail: 700 },
    { date: "สัปดาห์ 4", total: 14800, success: 14200, fail: 600 },
  ];

  // Mock data for time distribution
  const timeDistribution = [
    { timeRange: "00:00-03:00", count: 324 },
    { timeRange: "03:00-06:00", count: 156 },
    { timeRange: "06:00-09:00", count: 1823 },
    { timeRange: "09:00-12:00", count: 3456 },
    { timeRange: "12:00-15:00", count: 2987 },
    { timeRange: "15:00-18:00", count: 3124 },
    { timeRange: "18:00-21:00", count: 2145 },
    { timeRange: "21:00-24:00", count: 1219 },
  ];

  // Mock data for top failures
  const topFailures = [
    { destination: "gmail.com", failures: 145 },
    { destination: "yahoo.com", failures: 98 },
    { destination: "hotmail.com", failures: 87 },
    { destination: "outlook.com", failures: 76 },
    { destination: "example.com", failures: 54 },
  ];

  const chartData = viewMode === "weekly" ? weeklyData : last30DaysData;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex gap-2">
            <Button variant={viewMode === "weekly" ? "default" : "outline"} onClick={() => setViewMode("weekly")}>
              รายสัปดาห์
            </Button>
            <Button
              variant={viewMode === "last30days" ? "default" : "outline"}
              onClick={() => setViewMode("last30days")}
            >
              ย้อนหลัง 30 วัน
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <KPICard title="Total" value={kpiData.total} icon={Mail} variant="default" />
          <KPICard title="Success" value={kpiData.success} icon={CheckCircle2} variant="success" />
          <KPICard title="Fail" value={kpiData.fail} icon={AlertCircle} variant="destructive" />
        </div>

        <EmailChart data={chartData} />

        <TimeDistributionChart data={timeDistribution} />

        <TopFailureTable data={topFailures} />
      </div>
    </Layout>
  );
};

export default Dashboard;
