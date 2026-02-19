import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroller";

const MarketingTable = ({
  tableHeaders = [],
  tableBody = [],
  selectedContacts,
  setSelectedContacts,
  hasMore,
  loading,
  onLoadMore,
}) => {
  const handleCheckboxToggle = (contact) => {
    // Get unique identifier (prefer _id, fallback to id)
    const contactId = contact._id || contact.id;
    setSelectedContacts((prevSelected) => {
      // Check if contact already exists in selection using consistent ID
      const isAlreadySelected = prevSelected.some(
        (item) => (item._id || item.id) === contactId,
      );
      // console.log(contact);

      if (isAlreadySelected) {
        // Remove from selection using consistent ID check
        return prevSelected.filter(
          (item) => (item._id || item.id) !== contactId,
        );
      } else {
        // Add to selection
        return [...prevSelected, contact];
      }
    });
  };

  const isSelected = (contact) => {
    // Get unique identifier (prefer _id, fallback to id)
    const contactId = contact._id || contact.id;

    return selectedContacts.some((item) => (item._id || item.id) === contactId);
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    if (selectedContacts.length === Math.min(200, tableBody.length)) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(
        [...Array(Math.min(200, tableBody.length))].map((_, i) => tableBody[i]),
      );
    }
  };

  return (
    <TableContainer component={Paper} id="MarketingTable" className="h-[70vh]">
      <InfiniteScroll
        pageStart={0}
        loadMore={onLoadMore}
        hasMore={hasMore && !loading}
        useWindow={false}
        getScrollParent={() => document.querySelector("#MarketingTable")}
        loader={
          <div key={0} className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <Table stickyHeader aria-label="marketing table">
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e3f2fd",
                  width: "48px",
                }}
              >
                <Checkbox
                  indeterminate={
                    selectedContacts.length > 0 &&
                    selectedContacts.length < tableBody.length
                  }
                  checked={
                    tableBody.length > 0 &&
                    selectedContacts.length === tableBody.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              {tableHeaders.map((header, index) => (
                <TableCell
                  key={index}
                  align={header.align || "left"}
                  className="uppercase"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    fontSize: "16px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableBody.map((row, rowIndex) => (
              <MyTableRow
                key={rowIndex}
                tableHeaders={tableHeaders}
                isChecked={isSelected(row)}
                handleCheckboxToggle={() => handleCheckboxToggle(row)}
                row={row}
              />
            ))}
          </TableBody>
        </Table>
      </InfiniteScroll>
    </TableContainer>
  );
};

const MyTableRow = ({ tableHeaders, isChecked, handleCheckboxToggle, row }) => {
  return (
    <TableRow
      // key={rowIndex}
      selected={isChecked}
      className="hover:bg-gray-100"
    >
      <TableCell padding="checkbox">
        <Checkbox checked={isChecked} onChange={handleCheckboxToggle} />
      </TableCell>
      {tableHeaders.map((header, cellIndex) => (
        <TableCell
          key={cellIndex}
          align={header.align || "left"}
          sx={{ fontSize: "16px" }}
        >
          {row[header.key]}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default MarketingTable;
