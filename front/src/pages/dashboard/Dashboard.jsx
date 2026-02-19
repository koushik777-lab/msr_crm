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
      // console.log("DATA", data);

      setUniversalLoading(false);
    } catch (error) {
      console.error(error?.message);
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
      setUniversalLoading(false);
    } catch (error) {
      console.error(error?.message);
    }
  }

  const getQuotations = async () => {
    try {
      const {
        data: { quotations },
      } = await axios.get(`${API_URI}/quotationsCount`, getHeaders());
      console.log("QUOTATIONS", quotations);
      setQuotations(quotations);
      setUniversalLoading(false);
    } catch (error) {}
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
    <div className="w-full  flex flex-col">
      {/* <BackHeader title="dashboard" addbuttonText={"Export"} onClick={()=> {}}  showBtn={true}/> */}
      <div className="flex-1 overflow-y-auto  no-scrollbar">
        {/* <div className="flex items-center justify-end px-4 py-3 my-3">
          <h3 className="text-black text-center flex-1 text-5xl">
            Monthly Leads Overview
          </h3>
        </div> */}
        <div className="px-1 flex flex-col gap-10">
          {/* <DashboardTable
            tableHeaders={DAILY_LEADS_OVERVIEW_HEADERS}
            tableBody={DAILY_LEADS_OVERVIEW_BODY}
          /> */}
          {universalLoading && <Loader className={"mx-auto "} />}

          {!universalLoading && (
            <React.Fragment>
              <div className="flex gap-4 items-center">
                <TodaysCallBarChart
                  AgentCalls={todaysCall || []}
                  loading={loadings.agentCalls}
                />
                <OuotationTable
                  dashboardData={dashboardData?.agentPayments || []}
                  quotations={quotations}
                />
              </div>

              {/* {!isAgent && ( */}
              <>
                <div className="flex justify-between gap-4 items-center">
                  {!isAgent && (
                    <div className="basis-[100px]">
                      <PaymentLinkChart
                        dashboardData={dashboardData?.agentPayments || []}
                      />
                    </div>
                  )}
                  <div>
                    <PaymentHistoryTotal />
                  </div>
                  {!isAgent && (
                    <div className="grow">
                      <LeadsBarChart
                      // leads={allLeads}
                      // loading={loadings.allLeads}
                      />
                    </div>
                  )}
                </div>

                <div className="grow border-2 shadow py-3">
                  <PaymentHistorychart
                  //  dashboardData={dashboardData?.agentPayments || []}
                  />
                </div>
                {!isAgent && (
                  <div className="flex  gap-4 items-center">
                    <div className="grow shadow py-4">
                      <DashboardBarChart setLoading={setLoading} />
                    </div>
                    <div className="basis-1/3">
                      <LeadsPieChart
                      // leads={allLeads}
                      // loading={loadings.allLeads}
                      />
                    </div>
                  </div>
                )}
                {!isAgent && AGENTCHART}
              </>
              {/* // )} */}

              <DashboardIdleCallTable dashboardData={dashboardData} />
              {/* </div> */}
              {/* <div clas> */}

              {/* </div> */}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
