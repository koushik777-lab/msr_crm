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
      <Card sx={{ width: "100%", height: "100%", margin: "auto", p: 2 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            Today's Call Stats
          </Typography>
          <Loader className="flex justify-center" />
        </CardContent>
      </Card>
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
      <Card sx={{ width: "100%", height: "100%", margin: "auto", p: 2 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            Today's Call Stats
          </Typography>

          {AgentCalls && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{
                  // top: 20,
                  // right: 30,
                  // left: 20,
                  bottom: 10,
                }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="agent"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Leads" fill="darkblue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default TodaysCallBarChart;
