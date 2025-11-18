import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { EcgData } from "@shared/schema";

type FilterPeriod = "day" | "month" | "year";

export default function RecordsPage() {
  const userId = localStorage.getItem("userId");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("month");

  const { data: ecgRecords, isLoading } = useQuery<EcgData[]>({
    queryKey: [`/api/ecg-data/${userId}/${filterPeriod}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Transform data for charts
  const chartData = ecgRecords?.map((record) => ({
    date: new Date(record.timestamp).toLocaleDateString(),
    heartRate: record.heartRate,
    spo2: record.spo2,
    temperature: record.temperature,
    systolic: record.systolicBP,
    diastolic: record.diastolicBP,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Health Records</h1>
          <p className="text-muted-foreground">View and analyze your health data over time</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterPeriod === "day" ? "default" : "outline"}
            onClick={() => setFilterPeriod("day")}
            data-testid="filter-day"
          >
            Day
          </Button>
          <Button
            variant={filterPeriod === "month" ? "default" : "outline"}
            onClick={() => setFilterPeriod("month")}
            data-testid="filter-month"
          >
            Month
          </Button>
          <Button
            variant={filterPeriod === "year" ? "default" : "outline"}
            onClick={() => setFilterPeriod("year")}
            data-testid="filter-year"
          >
            Year
          </Button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No health data available for the selected period.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Heart Rate Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Heart Rate Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="hsl(var(--vital-cyan))"
                  strokeWidth={2}
                  name="Heart Rate (BPM)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* SpO2 Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Oxygen Saturation (SpO2)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[90, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="hsl(var(--vital-cyan))"
                  strokeWidth={2}
                  name="SpO2 (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Blood Pressure Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Blood Pressure</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="hsl(var(--vital-yellow))"
                  strokeWidth={2}
                  name="Systolic"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="hsl(var(--vital-red))"
                  strokeWidth={2}
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Temperature Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Body Temperature</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[36, 39]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="hsl(var(--vital-red))"
                  strokeWidth={2}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
