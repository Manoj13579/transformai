"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const usageData = [
  { endpoint: "/api/generate-image", count: 1234 },
  { endpoint: "/api/remove-background", count: 890 },
  { endpoint: "/api/summarize-resume", count: 450 },
];

export default function UsageTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usageData}>
            <XAxis dataKey="endpoint" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}