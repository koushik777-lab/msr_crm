import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
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

const tabIndexMap = {
    draft: 1,
    qcci_ugac: 2,
    qcci_waf: 3,
    master_final: 4
};

const MasterSheet = () => {
    const [tabValue, setTabValue] = useState(0);
    const [editRecord, setEditRecord] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue !== 0) {
            setEditRecord(null);
        }
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setTabValue(0); // Switch to the form view
    };

    const handleSuccess = (type) => {
        const nextTab = tabIndexMap[type] || 1;
        setTabValue(nextTab);
        setEditRecord(null);
    };

    return (
        <Box className="w-full h-full flex flex-col bg-gray-50 rounded-xl">
            <BackHeader title="MASTER SHEET" showBtn={false} />

            <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="DRAFT(ADD RECORD)" sx={{ fontWeight: 'bold' }} />
                        <Tab label="DRAFT(VIEW RECORDS)" sx={{ fontWeight: 'bold' }} />
                        <Tab label="QCCI(UGAC)" sx={{ fontWeight: 'bold' }} />
                        <Tab label="QCCI(WAF)" sx={{ fontWeight: 'bold' }} />
                        <Tab label="MASTER SHEET" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <MasterSheetForm 
                        onSuccess={handleSuccess} 
                        editRecord={editRecord} 
                        onCancelEdit={() => setEditRecord(null)} 
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <MasterSheetTable type="draft" onEdit={handleEdit} />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <MasterSheetTable type="qcci_ugac" onEdit={handleEdit} />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <MasterSheetTable type="qcci_waf" onEdit={handleEdit} />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                    <MasterSheetTable type="master_final" onEdit={handleEdit} />
                </TabPanel>
            </Box>
        </Box>
    );
};

export default MasterSheet;
