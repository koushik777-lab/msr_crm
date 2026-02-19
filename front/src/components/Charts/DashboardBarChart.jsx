import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import Loader from "../Loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
} from "recharts";

function DashboardBarChart() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMonthlyLeads = async () => {
      try {
        // fetch data from the server
        const { data } = await axios.get(
          `${API_URI}/monthly-leads`,
          getHeaders(),
        );
        setLeads(data);
        setLoading(false);
        return data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };

    getMonthlyLeads();
  }, []);

  // Format data for Recharts
  const chartData = leads?.data
    ? leads.data.map((lead) => ({
        month: lead.month,
        count: lead.count,
      }))
    : [];

  return (
    <>
      {loading ? (
        <div className="w-full h-full flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        // <Card sx={{ width: "100%", height: "100%", margin: "auto", p: 2 }}>
        // <CardContent>
        <div>
          <Typography variant="h6" align="center" color="black" gutterBottom>
            {leads?.message}
          </Typography>

          {leads?.data && (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={chartData}
                margin={{
                  top: 0,
                  right: 10,
                  left: 10,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-42} textAnchor="end" />

                <YAxis />
                <Tooltip />
                {/* <Legend /> */}
                <Bar dataKey="count" name="Leads" fill="darkblue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        // </CardContent>
        // </Card>
      )}
    </>
  );
}

export default DashboardBarChart;
