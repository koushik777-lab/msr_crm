import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import StatsCard from "../Card";
import Loader from "../Loader";

export default function AgentCallPopup({ onClose, agentId, isToday }) {
  const [agentLogs, setAgentLogs] = useState([]);
  const [loading, setloading] = useState(true);
  let today = new Date();
  // today.setHours(0, 0, 0, 0);
  today = today.toISOString().split("T")[0];

  async function fetchLogs() {
    try {
      const {
        data: { logs },
      } = await axios.get(
        `${API_URI}/logs/${agentId}`,
        getHeaders(),
        // { isToday }
      );
      let temp = logs.map((v) =>
        v.direction == "Missed" ? { ...v, duration: 0 } : v,
      );
      setAgentLogs(temp);
      // console.log(temp);
    } catch (error) {
      console.log(error.message);
    } finally {
      setloading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 top-0 bottom-0 left-0 right-0 z-[50]">
      <div className="bg-white p-6 rounded-lg z-[60] w-[70vw] min-h-[40vh] max-h-[70vh] overflow-y-auto relative text-black">
        <button
          className="absolute top-4 right-4 cursor-pointer"
          onClick={onClose}
        >
          <FaTimes className="text-xl" />
        </button>
        <h2 className="text-center text-lg font-semibold mb-4">Call Details</h2>

        <div className="flex gap-8">
          {[
            {
              title: "Today's Calls",
              value: agentLogs?.reduce(
                (acc, call) =>
                  moment().isSame(call.time, "day") ? acc + 1 : acc,
                0,
              ),
            },
            {
              title: "Today's Connected Calls",
              value: agentLogs.reduce((acc, call) => {
                if (moment().isSame(call.time, "day") && call.duration > 0) {
                  return acc + 1;
                }
                return acc;
              }, 0),
            },
            {
              title: "Today's Average Call Duration",
              value: moment
                .utc(
                  (agentLogs.reduce((acc, call) => {
                    if (
                      moment().isSame(call.time, "day") &&
                      call.duration > 0
                    ) {
                      return acc + call.duration;
                    }
                    return acc;
                  }, 0) /
                    agentLogs.reduce((acc, call) => {
                      if (
                        moment().isSame(call.time, "day") &&
                        call.duration > 0
                      ) {
                        return acc + 1;
                      }
                      return acc;
                    }, 0)) *
                    1000 || 0,
                )
                .format("m[m] s[s]"),
            },
            {
              title: "Monthly Calls",
              value: agentLogs.reduce(
                (acc, call) =>
                  moment().isSame(call.time, "month") ? acc + 1 : acc,
                0,
              ),
            },
            {
              title: "Monthly Average Call Duration",
              value: moment
                .utc(
                  (agentLogs.reduce((acc, call) => {
                    if (
                      moment().isSame(call.time, "month") &&
                      call.duration > 0
                    ) {
                      return acc + call.duration;
                    }
                    return acc;
                  }, 0) /
                    agentLogs.reduce((acc, call) => {
                      if (
                        moment().isSame(call.time, "month") &&
                        call.duration > 0
                      ) {
                        return acc + 1;
                      }
                      return acc;
                    }, 0)) *
                    1000 || 0,
                )
                .format("m[m] s[s]"),
            },
          ].map((card, index) => (
            <StatsCard key={index} title={card.title} value={card.value} />
          ))}
        </div>

        {agentLogs.filter((v) => {
          // console.log( moment(v.time).isSame(moment(), 'day'))
          return isToday ? moment(v.time).isSame(moment(), "day") : true;
        }).length === 0 ? (
          <div className="text-xl font-bold text-left flex items-center justify-center mt-10">
            {loading ? <Loader /> : "No logs found..."}
          </div>
        ) : (
          <table className="w-full mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3">PHONE NUMBER</th>
                <th className="text-left p-3">TIME</th>
                <th className="text-left p-3">DURATION</th>
                <th className="text-left p-3">DIRECTION</th>
              </tr>
            </thead>
            <tbody className="font-light">
              {agentLogs
                .filter((v) => {
                  // console.log( moment(v.time).isSame(moment(), 'day'))
                  return isToday
                    ? moment(v.time).isSame(moment(), "day")
                    : true;
                })
                .map((call, index) => (
                  <tr className="" key={index}>
                    <td className="p-3">{call.number}</td>
                    <td className="p-3">
                      {moment(call.time).format("Do MMM YYYY, hh:mm:ss A")}
                    </td>
                    <td className="p-3">
                      {moment.utc(call.duration * 1000).format("m[m] s[s]")}
                    </td>
                    <td className="p-3">{call.direction}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
