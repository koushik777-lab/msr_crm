import React from "react";
import { Link } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper,
  SvgIcon
} from "@mui/material";

const NotFound = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            borderRadius: 2,
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <SvgIcon 
            sx={{ 
              fontSize: 100, 
              color: 'error.main',
              mb: 2
            }}
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </SvgIcon>
          
          <Typography 
            variant="h2" 
            component="h1" 
            color="error" 
            gutterBottom 
            fontWeight="bold"
          >
            404
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ mb: 4 }}
          >
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }}
          >
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4
            }}
          >
            Go to Homepage
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
