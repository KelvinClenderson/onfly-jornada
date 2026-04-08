import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Users, Target, AlertCircle, Sparkles, BarChart3, Home } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { mockMetrics } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const periods = ["Hoje", "7 dias", "30 dias"];

const AdminMetrics = () => {
  const [activePeriod, setActivePeriod] = useState(1);
  const navigate = useNavigate();

  const kpis = [
    {
      label: "Taxa de aceite 1ª opção",
      value: `${mockMetrics.acceptRate.value}%`,
      trend: mockMetrics.acceptRate.trend,
      icon: Target,
      positive: true,
    },
    {
      label: "Média de reloads/sessão",
      value: mockMetrics.avgReloads.value.toFixed(1),
      icon: RefreshCw,
      subtitle: "↓ 20% vs mês anterior",
      positive: true,
    },
    {
      label: "Taxa de abandono",
      value: `${mockMetrics.abandonRate.value}%`,
      icon: AlertCircle,
      subtitle: `vs ${mockMetrics.abandonRate.previous}% anterior`,
      positive: true,
    },
    {
      label: "Uso de personalização",
      value: `${mockMetrics.customizationRate.value}%`,
      icon: Sparkles,
      subtitle: `${mockMetrics.customizationRate.total} sessões`,
      positive: false,
    },
  ];

  const funnelData = mockMetrics.funnel.map((f) => ({
    name: f.stage,
    value: f.value,
    pct: f.pct,
  }));

  const statusStyles: Record<string, string> = {
    confirmed: "bg-success/10 text-success",
    abandoned: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar — dark contrast */}
      <aside className="hidden md:flex flex-col w-60 border-r border-sidebar-border bg-sidebar p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground text-sm">Onfly Admin</span>
        </div>
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-primary text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Métricas
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm"
          >
            <Home className="w-4 h-4" /> Início
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-foreground">Dashboard de Métricas</h1>
            <div className="flex bg-card border border-card-border rounded-full p-1">
              {periods.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activePeriod === i ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <motion.div
                key={i}
                className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold font-mono text-primary">{kpi.value}</p>
                {kpi.trend && (
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.positive ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className="text-xs text-success">+{kpi.trend}%</span>
                  </div>
                )}
                {kpi.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Funnel */}
          <motion.div
            className="glass-card p-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Funil de Conversão</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(200 15% 42%)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid hsl(210 25% 88%)",
                    borderRadius: "8px",
                    color: "#1A2332",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string, props: { payload: { pct: number } }) => [
                    `${value} (${props.payload.pct}%)`,
                    "Sessões",
                  ]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {funnelData.map((_, i) => {
                    const opacity = 1 - i * 0.12;
                    return (
                      <Cell
                        key={i}
                        fill={`hsl(207 100% ${42 + i * 6}%)`}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sessions table */}
          <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-4 border-b border-card-border">
              <h2 className="text-sm font-semibold text-foreground">Sessões Recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Usuário</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Destino</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Opção</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Reloads</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMetrics.sessions.map((s, i) => (
                    <tr key={i} className="border-b border-card-border/50 hover:bg-secondary/50">
                      <td className="p-3 font-mono text-muted-foreground">{s.user}</td>
                      <td className="p-3 text-foreground">{s.destination}</td>
                      <td className="p-3 text-foreground">{s.option}</td>
                      <td className="p-3 font-mono text-foreground">{s.reloads}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[s.status]}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{s.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminMetrics;
