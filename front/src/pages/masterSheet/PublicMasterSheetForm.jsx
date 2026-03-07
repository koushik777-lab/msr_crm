import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import MasterSheetForm from "./MasterSheetForm";

const PublicMasterSheetForm = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                py: 4,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Container maxWidth="md">
                <Box textAlign="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Client Information Form
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Please fill out the details below. This information will be securely recorded in our system.
                    </Typography>
                </Box>

                <MasterSheetForm isPublic={true} />
            </Container>
        </Box>
    );
};

export default PublicMasterSheetForm;
