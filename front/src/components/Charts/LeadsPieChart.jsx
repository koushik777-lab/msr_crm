import { Card, Typography } from "@mui/material";
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Loader from "../../components/Loader";
import MonthYear from "../MonthYear";
import { useFetchLeads } from "../../hooks/useFetchLeads";

export default function LeadsPieChart({}) {
  // Memoize the chart data to prevent unnecessary recalculations
  const { leads, loading, month, year, setMonth, setYear } = useFetchLeads();
  const { finalLeads, chartData } = useMemo(() => {
    let finalLeads = {};
    if (leads.length > 0) {
      let obj = {};
      for (let i = 0; i < leads.length; i++) {
        if (obj[leads[i]?.status]) {
          obj[leads[i]?.status] = obj[leads[i]?.status] + 1;
        } else {
          obj[leads[i]?.status] = 1;
        }
      }
      finalLeads = obj;
    }

    // Create chart data for Recharts
    const pieChartColors = [
      "#C27D78", // Muted Red
      "#789AC2", // Soft Blue
      "#C278A6", // Subtle Pink
      "#78C27D", // Gentle Green
      "#C2A678", // Warm Beige
      "#8A78C2", // Mild Purple
      "#C28F78", // Earthy Orange
      "#78C2B8", // Soft Teal
      "#788FC2", // Dusty Blue
    ];

    const chartData = Object.keys(finalLeads).map((status, index) => ({
      name: status,
      value: finalLeads[status],
      color: pieChartColors[index % pieChartColors.length],
    }));

    return { finalLeads, chartData };
  }, [leads]); // Only recalculate when leads change

  // We won't use this function anymore as we're removing the percentage labels
  // Keeping it commented in case you want to restore it later
  /*
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  */

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {Object.keys(finalLeads).length >= 0 && (
        <Card sx={{ width: "100%", height: "100%", margin: "auto", p: 2 }}>
          <Typography variant="h6" align="center" gutterBottom>
            {"Status Wise Leads"}
          </Typography>
          <div className="w-full my-2 ">
            <MonthYear
              month={month}
              year={year}
              setMonth={setMonth}
              setYear={setYear}
            />
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                // innerRadius={100}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${name}: ${value}`, ""]}
                labelFormatter={() => ""}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
