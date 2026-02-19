import { Autocomplete, Box, Button } from "@mui/material";
import React, { useState } from "react";
import MyInput from "../../components/MyInput";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import EmailMarketingPopup from "../marketing/EmailMarketingPopup";

export default function WhatsappForm({ renderFn }) {
  const [info, setInfo] = React.useState({
    whatsapp_number: [],
    template_name: "",
    template_lang: "en_US",
  });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { isAgent, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // console.log(selectedLeads);
  async function handleSubmit() {
    const isLeadSelected = selectedLeads.length != 0;
    try {
      setLoading(true);
      //
      let numbers = [];
      if (isLeadSelected) {
        numbers = selectedLeads.map((v) => v.number);
      } else {
        numbers = info.whatsapp_number;
      }
      // console.log(info.whatsapp_number);
      // return;
      if (numbers === 0) {
        throw new Error("Please enter at least one whatsapp number");
      }

      if (info.template_name.length === 0) {
        throw new Error("Please enter template name");
      }
      if (info.template_lang.length === 0) {
        throw new Error("Please enter template language");
      }
      const allResponses = await Promise.allSettled(
        numbers.map((number) => {
          return axios.post(
            `${API_URI}/whatsappMessage`,
            {
              phoneNumber: number,
              tempName: info.template_name,
              tempLang: "en_US",
              agentName: isAgent ? user.name : "admin",
            },
            getHeaders(),
          );
        }),
      );
      console.log(allResponses);
      let isWrongTemplate = false;
      allResponses.forEach((response) => {
        if (response.status == "rejected") {
          if (
            response.reason?.response?.data?.error ==
            "Template for the selected language not found in the system, if you have created template recently on Facebook please sync templates again."
          ) {
            toast.error(response.reason.response.data.error);
            isWrongTemplate = true;
            return;
          }
        }
      });
      !isWrongTemplate && toast.success("Message Sent Successfully");
      setInfo((prev) => ({ ...prev, whatsapp_number: [] }));
      setSelectedLeads([]);
      renderFn();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  const handleSelectLeads = (leads) => {
    // console.log(leads);
    const phoneNumbers = leads
      .filter((lead) => lead.phone)
      .map((lead) => lead.phone.toString());
    setInfo({ ...info, whatsapp_number: phoneNumbers });
    setSelectedLeads(leads);
  };

  return (
    <Box
      sx={{
        flex: "1 1 30%",
        p: 2,
        border: "1px solid #ddd",
        borderRadius: 1,
      }}
      className="text-black space-y-4"
    >
      <div>
        <Autocomplete
          freeSolo
          multiple
          disabled={selectedLeads.length != 0}
          value={info.whatsapp_number}
          onChange={(event, newValue) => {
            console.log(newValue);
            if (newValue?.length > 0) {
              if (newValue[newValue.length - 1]?.length != 10) {
                toast.error("Please enter only 10 digit mobile number");
                return;
              }
              setInfo({ ...info, whatsapp_number: newValue });
            } else {
              setInfo({ ...info, whatsapp_number: [] });
            }
          }}
          options={[]}
          renderInput={(params) => (
            <MyInput
              {...params}
              label={"Whatsapp Number"}
              placeholder={"Enter Whatsapp Number"}
              type={"text"}
              name={"whatsapp_number"}
              required={true}
              margin={"normal"}
              fullWidth={true}
              variant={"outlined"}
            />
          )}
        />
        <div className="text-xs text-gray-500 italic ">
          NOTE : Enter 10 Digit Mobile number only{" "}
        </div>
      </div>
      <div>
        <MyInput
          label={"Template Name"}
          placeholder={"Enter Template Name"}
          type={"text"}
          name={"template_name"}
          required={true}
          margin={"normal"}
          fullWidth={true}
          variant={"outlined"}
          onChange={(e) => setInfo({ ...info, template_name: e.target.value })}
        />
      </div>
      <div>
        {loading ? (
          <Loader />
        ) : (
          <div className="flex gap-4">
            <Button variant="contained" onClick={handleSubmit}>
              SEND
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowPopup(true)}
              disabled={info.whatsapp_number.length > 0}
            >
              Select Leads {`(${selectedLeads.length})`}
            </Button>
          </div>
        )}
      </div>

      {showPopup && (
        <EmailMarketingPopup
          onClose={() => {
            // setSelectedLeads([])
            setShowPopup(false);
          }}
          selectedLeads={selectedLeads}
          // setSelectedLeads={(leads) => {
          //   console.log(leads);
          //   handleSelectLeads(leads);
          //   setShowPopup(false);
          // }}
          setSelectedLeads={setSelectedLeads}
          handleSend={handleSubmit}
          isOnlyClose={true}
        />
      )}
    </Box>
  );
}
