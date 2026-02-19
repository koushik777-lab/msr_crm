import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import React, { useEffect, useState } from "react";
import { Autocomplete, Paper, TextField } from "@mui/material";
import MarketingTable from "../../components/tables/MarketingTable";
import { MARKETING_TABLE_HEADERS, LEAD_STATUS } from "../../constants/constant";
import InfiniteScroll from "react-infinite-scroller";

export default function EmailMarketingPopup({
  onClose,
  handleSend,
  selectedLeads,
  setSelectedLeads,
  isOnlyClose,
}) {
  const [leads, setLeads] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLeads = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      let finalUrl = `${API_URI}/leads?page=${pageNum}&limit=50`;
      if (selectedSource) {
        finalUrl = finalUrl + `&source=${selectedSource}`;
      }
      if (selectedStatus) {
        finalUrl = finalUrl + `&status=${selectedStatus}`;
      }

      const response = await axios.get(finalUrl, getHeaders());
      const newLeads = response?.data?.leads || [];

      if (pageNum === 1) {
        setLeads(newLeads);
      } else {
        setLeads((prevLeads) => [...prevLeads, ...newLeads]);
      }

      setHasMore(newLeads.length === 50); // If we got less than 10 items, there's no more data
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedSource = (source) => {
    source === selectedSource
      ? setSelectedSource(null)
      : setSelectedSource(source);
    setPage(1);
    setHasMore(true);
    setLeads([]);
  };

  const handleInfiniteScroll = async () => {
    if (!loading && hasMore) {
      await fetchLeads(page + 1);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLeads([]);
    fetchLeads(1);
  }, [selectedSource, selectedStatus]);

  const marketingChannels = [
    "GOOGLE MANUAL",
    "FB ADS",
    "FB MANUAL",
    "INSTAGRAM",
    "MCA",
    "INDIAMART",
    "JUST DIAL",
    "REF",
    "RENEWAL DATA",
    "SURVELLIANCE",
    "GOOGLE ADS",
    "WHATSAPP MKT",
    "EMAIL MKT",
    "Company",
    "GST",
    "CONSULTANT",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 top-0 right-0 left-0 bottom-0 z-[50] flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative text-black">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black scale-150 cursor-pointer text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Select Leads
        </h2>

        <div className="mb-6">
          <Paper elevation={2} className="p-4 rounded-lg mb-6">
            <div className="text-black text-lg font-semibold mb-4">
              <span className="border-b-2 border-blue-500 pb-1">
                Filter By Lead Source
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {marketingChannels.map((source) => (
                <div
                  key={source}
                  onClick={() => handleSelectedSource(source)}
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                    selectedSource === source
                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {source}
                </div>
              ))}
            </div>
          </Paper>

          {/* <div className="mb-4">
            <Autocomplete
              id="status-filter"
              options={LEAD_STATUS}
              style={{ width: "100%" }}
              onChange={(e, val) => {
                setSelectedStatus(val);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lead Status"
                  variant="outlined"
                  size="small"
                  value={selectedStatus}
                />
              )}
            />
          </div> */}
        </div>
        <div className="mb-4 text-lg font-semibold">
          Selected Leads : {selectedLeads.length}
        </div>

        {loading && page === 1 ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              {selectedSource && selectedStatus
                ? `No leads found for "${selectedSource}" with status "${selectedStatus}"`
                : selectedSource
                  ? `No leads found for source "${selectedSource}"`
                  : selectedStatus
                    ? `No leads found with status "${selectedStatus}"`
                    : "No leads available"}
            </p>
          </div>
        ) : (
          <MarketingTable
            tableHeaders={MARKETING_TABLE_HEADERS}
            tableBody={leads}
            selectedContacts={selectedLeads}
            setSelectedContacts={setSelectedLeads}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={handleInfiniteScroll}
          />
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => {
              onClose(selectedLeads); // Pass selected leads back to parent
            }}
          >
            Close
          </button>
          {!isOnlyClose && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleSend}
              disabled={selectedLeads.length === 0}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
