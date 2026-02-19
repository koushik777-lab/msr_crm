import { createContext, useContext, useEffect, useState } from "react";
import { API_URI } from "../utils/constants";
import axios from "axios";
import { getHeaders } from "../utils/helpers";

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [agentList, setAgents] = useState([]);

  async function fetchAgents() {
    try {
      console.log("----GETTING AGENTS-----");
      const {
        data: { agents },
      } = await axios.get(`${API_URI}/agents`, getHeaders());
      setAgents(agents);
      //   setLoading(false);
      //   console.log(agents);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <AgentContext.Provider value={{ agentList, setAgents }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => useContext(AgentContext);
