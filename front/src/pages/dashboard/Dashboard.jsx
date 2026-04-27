import React, { useCallback, useEffect, useMemo, useState } from "react";
import BackHeader from "../../components/BackHeader";
import theme from "../../utils/theme";
import {
  DAILY_LEADS_OVERVIEW_HEADERS,
  DAILY_LEADS_OVERVIEW_BODY,
} from "../../constants/constant";
import DashboardTable from "../../components/tables/DashboardTable";
import DashboardBarChart from "../../components/Charts/DashboardBarChart";
import LeadsBarChart from "../../components/Charts/LeadsBarChart";
import LeadsPieChart from "../../components/Charts/LeadsPieChart";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import PaymentLinkChart from "../../components/Charts/PaymentLinkChart";
import TodaysCallBarChart from "../../components/Charts/TodaysCallBarChart";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import OuotationTable from "../../components/Charts/OuotationTable";
import AgentChart from "../../components/Charts/AgentChart";
import DashboardIdleCallTable from "../../components/Charts/DashboardIdleCallTable";
import PaymentHistorychart from "../../components/Charts/PaymentHistorychart";
import PaymentHistoryTotal from "../../components/Charts/PaymentHistoryTotal";

// API Calls Documentation
/**
 * API Endpoints used:
 * 1. /leads?isAnalytics=true - Fetch all leads for analytics
 * 2. /dashboard - Fetch dashboard data including agent calls and payments
 * 3. /quotationsCount - Fetch quotation statistics
 */

const Dashboard = ({ setLoading }) => {
  console.log(setLoading);
  const [allLeads, setAllLeads] = useState([]);
  const [loadings, setLoadings] = useState({
    allLeads: true,
    agentCalls: true,
    dashboardData: true,
  });
  const [todaysCall, setTodaysCall] = useState([]);
  const [universalLoading, setUniversalLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [quotations, setQuotations] = useState({});
  // async function fetchAllLeads() {
  //   try {
  //     const {
  //       data: { leads },
  //     } = await axios.get(`${API_URI}/leads?isAnalytics=true`, getHeaders());
  //     setAllLeads(leads);
  //     setLoadings((prev) => ({
  //       ...prev,
  //       allLeads: false,
  //     }));
  //     setUniversalLoading(false);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }

  async function fetchDashboardData() {
    try {
      setUniversalLoading(true);
      const {
        data: { data },
      } = await axios.get(`${API_URI}/dashboard`, getHeaders());
      setDashboardData(data);
      setLoadings((prev) => ({
        ...prev,
        dashboardData: false,
      }));
    } catch (error) {
      console.error(error?.message);
    } finally {
      setUniversalLoading(false);
    }
  }

  async function fetchTodaysCall() {
    try {
      setLoadings((prev) => ({
        ...prev,
        agentCalls: true,
      }));
      const {
        data: { data },
      } = await axios.get(`${API_URI}/todays-call`, getHeaders());
      setTodaysCall(data);
      setLoadings((prev) => ({
        ...prev,
        agentCalls: false,
      }));
    } catch (error) {
      console.error(error?.message);
    } finally {
      setUniversalLoading(false);
    }
  }

  const getQuotations = async () => {
    try {
      const {
        data: { quotations },
      } = await axios.get(`${API_URI}/quotationsCount`, getHeaders());
      console.log("QUOTATIONS", quotations);
      setQuotations(quotations);
    } catch (error) {
      console.error(error?.message);
    } finally {
      setUniversalLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysCall();
    // fetchAllLeads();
    fetchDashboardData();
    getQuotations();
  }, []);
  const { isAgent } = useAuth();

  const AGENTCHART = useMemo(() => {
    return (
      <div className="mt-8">
        <AgentChart />
      </div>
    );
  }, []);
  // console.log(dashboardData);
  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="px-6 py-6 flex flex-col gap-8">
          {universalLoading && <Loader className={"mx-auto mt-20"} />}

          {!universalLoading && (
            <React.Fragment>
              <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Today's Calls</h2>
                  <TodaysCallBarChart
                    AgentCalls={todaysCall || []}
                    loading={loadings.agentCalls}
                  />
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Quotations Overview</h2>
                  <OuotationTable
                    dashboardData={dashboardData?.agentPayments || []}
                    quotations={quotations}
                  />
                </div>
              </div>

              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                  {!isAgent && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md flex flex-col justify-center">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Payment Links</h2>
                      <PaymentLinkChart
                        dashboardData={dashboardData?.agentPayments || []}
                      />
                    </div>
                  )}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md flex flex-col justify-center">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Payment Totals</h2>
                    <PaymentHistoryTotal />
                  </div>
                  {!isAgent && (
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Leads Overview</h2>
                      <LeadsBarChart />
                    </div>
                  )}
                </div>

                <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Payment History</h2>
                  <PaymentHistorychart />
                </div>

                {!isAgent && (
                  <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                    <div className="flex-[2] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Dashboard Analytics</h2>
                      <DashboardBarChart setLoading={setLoading} />
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md flex flex-col justify-center items-center">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize w-full text-left">Leads Distribution</h2>
                      <LeadsPieChart />
                    </div>
                  </div>
                )}

                {!isAgent && (
                  <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Agent Performance</h2>
                    {AGENTCHART}
                  </div>
                )}
              </>

              <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">Idle Calls</h2>
                <DashboardIdleCallTable dashboardData={dashboardData} />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
