import axios from "axios";
import Loader from "../Loader";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
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
import AgentCallPopup from "../agents/AgentCallPopup";

function TodaysCallBarChart({ AgentCalls, loading }) {
  // Format data for Recharts
  const chartData = AgentCalls
    ? AgentCalls?.map((call) => ({
      agent: call.agent,
      count: call.count,
    }))
    : [];
  console.log(AgentCalls, " -------------------------");
  const [Popup, setPopup] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const handleBarClick = (data) => {
    // console.log(data);
    // return;
    setPopup(true);
    setAgentId(AgentCalls.find((v) => v.agent == data.activeLabel)?._id);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-4">
        <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
          Loading Stats...
        </Typography>
        <Loader className="flex justify-center" />
      </div>
    );
  }

  return (
    <>
      {Popup && (
        <AgentCallPopup
          isToday={true}
          agentId={agentId}
          onClose={() => {
            setPopup(false);
            setAgentId(null);
          }}
        />
      )}
      <div className="w-full h-full min-h-[400px]">
        {AgentCalls && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: -20,
                bottom: 30,
              }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="agent"
                angle={-45}
                textAnchor="end"
                height={90}
                tick={{ fill: '#6B7280', fontSize: 13 }}
                tickMargin={10}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(55, 150, 207, 0.1)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="count" name="Leads" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default TodaysCallBarChart;
