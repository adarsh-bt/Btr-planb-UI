import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Link} from 'react-router-dom'; 

const earas_list = () => {
  const theme = useTheme();

  const cardData = [
    {
      title: "Zone Details",
      image: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png",
      gradient: "linear-gradient(to right,rgba(255, 128, 119, 0.82) 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)",
      url:""
    },
    {
      title: "e-BTR",
      image: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png",
      gradient: "linear-gradient(to right,rgba(118, 184, 82, 0.88), #8DC26F)",
      url:"/btr"
    },
    {
      title: "Cluster Formation",
      image: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png",
      gradient: "linear-gradient(to right, rgba(141, 68, 173, 0.84), #3498db)",
      url:''
    },
    {
      title: "Crop Cutting Experiment",
      image: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png",
      gradient: "linear-gradient(to right,rgba(255, 154, 139, 0.93), #ffc3a0)",
      url:''
    },
    {
      title: "Reports",
      image: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png",
      gradient: "linear-gradient(to right,rgba(255, 127, 95, 0.86), #feb47b)",
      url:''
    },
    {
      title: "Form 1",
      image: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png",
      gradient: "linear-gradient(to right,rgba(0, 200, 255, 0.89), #0072ff)",
      url:''
    },
  ];

  return (
    <div>
    <Typography variant="h3" sx={{marginBottom:4}}>Earas</Typography>
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 3, gap: 2, backgroundColor: "white" }}
    >
      {cardData.map(({ title, image, gradient,url }, index) => (
        <Card
        component={Link} to={url}
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration:'none',
            width: 400,
            borderRadius: "16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            backgroundColor: "#fff",
            backgroundImage: gradient,
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
              backgroundColor: "#87CEEB",
              backgroundImage: gradient,
            },
          }}
        >
          <CardMedia
          
            component="img"
            sx={{ width: 100, height: 100, margin: 2 }} // Smaller image, no rounded corners
            image={image}
            alt={title}
          />
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <CardContent sx={{ flex: "1 0 auto" }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      ))}
    </Box>
    </div>
  );
};

export default earas_list;
