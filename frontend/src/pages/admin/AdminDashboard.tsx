import React, { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Share2,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalExperiences: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    activeUsers: 0,
  });

  const [monthlyData, setMonthlyData] = useState<
    { month: string; shared: number }[]
  >([]);
  const [typeDistribution, setTypeDistribution] = useState<
    { name: string; count: number }[]
  >([]);

  useEffect(() => {
    // 🚀 Example mock — replace with API calls
    // axios.get("/api/admin/dashboard/experience-stats")
    //   .then(res => setStats(res.data))
    //   .catch(console.error);

    // Simulate incoming data
    setStats({
      totalExperiences: 1240,
      approved: 932,
      pending: 203,
      rejected: 105,
      activeUsers: 589,
    });

    setMonthlyData([
      { month: "Jan", shared: 40 },
      { month: "Feb", shared: 55 },
      { month: "Mar", shared: 78 },
      { month: "Apr", shared: 65 },
      { month: "May", shared: 89 },
      { month: "Jun", shared: 120 },
      { month: "Jul", shared: 133 },
      { month: "Aug", shared: 142 },
      { month: "Sep", shared: 160 },
      { month: "Oct", shared: 174 },
    ]);

    setTypeDistribution([
      { name: "Internship", count: 420 },
      { name: "Full-time", count: 380 },
      { name: "Freelance", count: 220 },
      { name: "Remote", count: 150 },
      { name: "Hybrid", count: 70 },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Experience Overview ✨</h1>
        <p className="text-slate-400 mt-1">
          Track shared experiences, user activity, and status insights.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {/* Total Experiences */}
        <StatCard
          title="Total Experiences"
          value={stats.totalExperiences}
          icon={<Share2 className="w-6 h-6 text-blue-400" />}
          accent="border-blue-500 hover:border-blue-400"
          growth="+10%"
        />
        {/* Approved */}
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle className="w-6 h-6 text-emerald-400" />}
          accent="border-emerald-500 hover:border-emerald-400"
          growth="+5%"
        />
        {/* Pending */}
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-6 h-6 text-yellow-400" />}
          accent="border-yellow-500 hover:border-yellow-400"
          growth="-2%"
        />
        {/* Rejected */}
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle className="w-6 h-6 text-rose-400" />}
          accent="border-rose-500 hover:border-rose-400"
          growth="+1%"
        />
        {/* Active Users */}
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Users className="w-6 h-6 text-purple-400" />}
          accent="border-purple-500 hover:border-purple-400"
          growth="+12%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Shared Experiences */}
        <ChartCard title="Monthly Shared Experiences" icon={<CalendarDays className="w-5 h-5 text-blue-400" />}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <Line type="monotone" dataKey="shared" stroke="#3b82f6" strokeWidth={3} />
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Experience Type Distribution */}
        <ChartCard title="Experience Type Distribution" icon={<TrendingUp className="w-5 h-5 text-purple-400" />}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

// ---------- Reusable Components ----------

const StatCard = ({
  title,
  value,
  icon,
  accent,
  growth,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  growth: string;
}) => (
  <div
    className={`bg-slate-800/70 backdrop-blur-md p-5 rounded-2xl border border-slate-700 ${accent} transition-all shadow-lg`}
  >
    <div className="flex justify-between items-center mb-3">
      <p className="text-slate-400">{title}</p>
      {icon}
    </div>
    <h2 className="text-3xl font-semibold">{value}</h2>
    <p className="text-green-400 text-sm mt-1">{growth} this month</p>
  </div>
);

const ChartCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg">
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        {icon} {title}
      </h3>
    </div>
    {children}
  </div>
);

export default AdminDashboard;
