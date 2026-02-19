import { Card, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from "../../components/Loader";
import { useFetchLeads } from "../../hooks/useFetchLeads";
import MonthYear from "../MonthYear";

export default function LeadsBarChart({}) {
  // location wise chart
  const { leads, loading, month, year, setMonth, setYear } = useFetchLeads();
  var finalLeads = [];
  if (leads.length > 0) {
    const leadMap = new Map();
    for (let i = 0; i < leads.length; i++) {
      if (leadMap.has(leads[i]?.address)) {
        leadMap.set(leads[i]?.address, [
          ...leadMap.get(leads[i]?.address),
          leads[i],
        ]);
      } else {
        leadMap.set(leads[i]?.address, [leads[i]]);
      }
    }
    const obj = Object.fromEntries(leadMap);
    for (let key in obj) {
      finalLeads.push([key, obj[key]]);
    }

    finalLeads.sort((a, b) => b[1].length - a[1].length);
    finalLeads = finalLeads.filter((v, idx) => idx <= 9);
    finalLeads = finalLeads.map((v) => {
      return [v[0], v[1].map((i) => i.status)];
    });
    for (let i = 0; i < finalLeads.length; i++) {
      const obj = {
        Unassigned: 0,
        "Not Contacted": 0,
        Contacted: 0,
        "Quotation Sent": 0,
        "Payment Link sent": 0,
        "Documents Received": 0,
        "Payment Received": 0,
        Completed: 0,
        Rejected: 0,
      };
      for (let j = 0; j < finalLeads[i][1].length; j++) {
        obj[finalLeads[i][1][j]] = obj[finalLeads[i][1][j]]
          ? obj[finalLeads[i][1][j]] + 1
          : 1;
      }
      finalLeads[i][1] = obj;
    }

    // Format the data for Recharts stacked bar chart
    finalLeads = finalLeads.map((lead) => {
      return {
        location: lead[0],
        Unassigned: lead[1]["Unassigned"] || 0,
        "Not Contacted": lead[1]["Not Contacted"] || 0,
        Contacted: lead[1]["Contacted"] || 0,
        "Quotation Sent": lead[1]["Quotation Sent"] || 0,
        "Payment Link sent": lead[1]["Payment Link sent"] || 0,
        "Documents Received": lead[1]["Documents Received"] || 0,
        "Payment Received": lead[1]["Payment Received"] || 0,
        Completed: lead[1]["Completed"] || 0,
        Rejected: lead[1]["Rejected"] || 0,
      };
    });
  }

  // Define colors for each status
  const statusColors = {
    Unassigned: "#3A86FF", // Vibrant Blue
    "Not Contacted": "#8338EC", // Purple
    Contacted: "#FF006E", // Hot Pink
    "Quotation Sent": "#FB5607", // Bright Orange
    "Payment Link sent": "#FFBE0B", // Golden Yellow
    "Documents Received": "#06D6A0", // Turquoise
    "Payment Received": "#1A759F", // Deep Teal
    Completed: "#52B788", // Green
    Rejected: "#EF476F", // Raspberry
  };

  // All status types
  const statusTypes = [
    "Unassigned",
    "Not Contacted",
    "Contacted",
    "Quotation Sent",
    "Payment Link sent",
    "Documents Received",
    "Payment Received",
    "Completed",
    "Rejected",
  ];
  console.log(finalLeads);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="text-black w-full h-full">
      {finalLeads.length >= 0 && (
        <>
          {/* <Card sx={{ width: "100%", height: "100%", margin: "auto", p: 2 }}> */}
          <Typography variant="h6" align="center" gutterBottom>
            {"State Wise Leads"}
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
            <BarChart
              data={finalLeads}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="location"
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="left"
                wrapperStyle={{ paddingBottom: 20 }}
              />
              {statusTypes.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="a"
                  fill={statusColors[status]}
                  name={status}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {/* </Card> */}
        </>
      )}
    </div>
  );
}
