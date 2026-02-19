import { Autocomplete, Box, Button, TextField } from "@mui/material";
import React from "react";
import { FaTimes } from "react-icons/fa";
import { marketingChannels } from "../../utils/helpers";

function UploadExcelPopup({ onClose, handleExcelUpload }) {
  const [selectedSource, setSelectedSource] = React.useState("");
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 top-0 bottom-0 left-0 right-0 z-[50]">
      <div className="bg-white p-6 rounded-lg w-[650px] relative text-black">
        <button
          className="absolute top-4 right-4 cursor-pointer"
          onClick={onClose}
        >
          <FaTimes className="text-xl" />
        </button>
        <h2 className="text-center text-lg font-semibold mb-4">
          Upload Leads Excel
        </h2>
        <Autocomplete
          options={marketingChannels}
          style={{ minWidth: 200 }}
          onChange={(e, val) => {
            setSelectedSource(val);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Source"
              variant="outlined"
              size="small"
              value={selectedSource}
            />
          )}
        />
        <Box display={"flex"} justifyContent="start" gap={3} mt={2}>
          <a
            href="/SampleLeadsFormat.xlsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="small" variant="outlined" sx={{ height: "40px" }}>
              Download Sample Excel
            </Button>
          </a>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleExcelUpload(e, selectedSource)}
            style={{ display: "none" }}
            id="excel-upload"
          />
          <Button
            disabled={!selectedSource}
            component="label"
            htmlFor="excel-upload"
            size="small"
            variant="contained"
            sx={{ height: "40px" }}
          >
            Upload Excel
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default UploadExcelPopup;
