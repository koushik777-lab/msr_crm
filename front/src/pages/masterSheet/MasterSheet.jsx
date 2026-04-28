import React, { useState } from "react";
import { Box, Tab, Tabs, Typography, Paper } from "@mui/material";
import MasterSheetForm from "./MasterSheetForm";
import MasterSheetTable from "./MasterSheetTable";
import BackHeader from "../../components/BackHeader";

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MasterSheet = () => {
    const [tabValue, setTabValue] = useState(0);
    const [editRecord, setEditRecord] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 1) {
            setEditRecord(null);
        }
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setTabValue(0); // Switch to the form view
    };

    return (
        <Box className="w-full h-full flex flex-col bg-gray-50 rounded-xl">
            <BackHeader title="MASTER SHEET" showBtn={false} />

            <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="Form (Add Record)" sx={{ fontWeight: 'bold' }} />
                        <Tab label="Table (View Records)" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <MasterSheetForm onSuccess={() => { setTabValue(1); setEditRecord(null); }} editRecord={editRecord} onCancelEdit={() => setEditRecord(null)} />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <MasterSheetTable onEdit={handleEdit} />
                </TabPanel>
            </Box>
        </Box>
    );
};

export default MasterSheet;
