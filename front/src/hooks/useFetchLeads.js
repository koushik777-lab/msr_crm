import { useEffect, useState } from "react";
import { getHeaders } from "../utils/helpers";
import axios from "axios";
import { API_URI } from "../utils/constants";

export const useFetchLeads = () => {
  const [leads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  // console.log({ month, year });
  async function fetchAllLeads() {
    setLoading(true);
    try {
      const {
        data: { leads },
      } = await axios.get(
        `${API_URI}/leads`,
        getHeaders({
          isAnalytics: true,
          month,
          year,
        }),
      );
      setAllLeads(leads);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // setLoading(true);
    fetchAllLeads();
    // setLoading(false);
  }, [month, year]);

  return {
    leads,
    loading,
    month,
    year,
    setMonth,
    setYear,
  };
};
