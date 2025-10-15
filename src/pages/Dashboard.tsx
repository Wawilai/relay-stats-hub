import { useState } from "react";
import Layout from "@/components/Layout";
import KPICard from "@/components/dashboard/KPICard";
import EmailChart from "@/components/dashboard/EmailChart";
import TimeDistributionChart from "@/components/dashboard/TimeDistributionChart";
import TopFailureTable from "@/components/dashboard/TopFailureTable";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"weekly" | "last30days">("weekly");

  // Mock data for KPIs
  const kpiData = {
    sending: 15234,
    success: 14567,
    block: 423,
    reject: 244,
  };

  // Mock data for chart
  const weeklyData = [
    { date: "จ", sending: 2100, success: 2000, block: 60, reject: 40 },
    { date: "อ", sending: 2300, success: 2200, block: 65, reject: 35 },
    { date: "พ", sending: 2500, success: 2400, block: 70, reject: 30 },
    { date: "พฤ", sending: 2200, success: 2100, block: 55, reject: 45 },
    { date: "ศ", sending: 2400, success: 2300, block: 60, reject: 40 },
    { date: "ส", sending: 1900, success: 1800, block: 58, reject: 42 },
    { date: "อา", sending: 1834, success: 1767, block: 55, reject: 12 },
  ];

  const last30DaysData = [
    { date: "สัปดาห์ 1", sending: 14000, success: 13400, block: 380, reject: 220 },
    { date: "สัปดาห์ 2", sending: 15234, success: 14567, block: 423, reject: 244 },
    { date: "สัปดาห์ 3", sending: 16500, success: 15800, block: 450, reject: 250 },
    { date: "สัปดาห์ 4", sending: 14800, success: 14200, block: 400, reject: 200 },
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
            <Button
              variant={viewMode === "weekly" ? "default" : "outline"}
              onClick={() => setViewMode("weekly")}
            >
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Sending"
            value={kpiData.sending}
            icon={Mail}
            variant="default"
          />
          <KPICard
            title="Success"
            value={kpiData.success}
            icon={CheckCircle2}
            variant="success"
          />
          <KPICard
            title="Block"
            value={kpiData.block}
            icon={ShieldAlert}
            variant="warning"
          />
          <KPICard
            title="Reject"
            value={kpiData.reject}
            icon={XCircle}
            variant="destructive"
          />
        </div>

        <EmailChart data={chartData} />

        <TimeDistributionChart data={timeDistribution} />

        <TopFailureTable data={topFailures} />
      </div>
    </Layout>
  );
};

export default Dashboard;
