import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Typography,
  Stack,
  MenuItem,
  Box,
  Grid
} from "@mui/material";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ApprovedUserService from "pages/functional-components/approvels/ApprovedUserService";
import Breadcrumb from "routes/Breadcrumb";
import authservice from "pages/authentication/services/authservice";

const AdminTourDiary = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [level, setLevel] = useState("ALL");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [search, setSearch] = useState("");

  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loggedDistrictId, setLoggedDistrictId] = useState(null);
  const [loggedTalukId, setLoggedTalukId] = useState(null);

  const role = authservice.getrole();
  const userId = authservice.userid();

  // Handle navigation to user's tour diary view
  const handleViewTourDiary = (row) => {
    // Try multiple possible ID fields to get the userId
    const selectedUserId = row.userId || row.id || row.user_id || row.empId;
    
    console.log("Navigating to tour diary with userId:", selectedUserId, "from row:", row);
    
    if (!selectedUserId) {
      console.error("No valid user ID found in row:", row);
      alert("Cannot view tour diary: User ID not found");
      return;
    }
    
    // Navigate to the tour diary detail page with the userId in state
    navigate("/approval_manage/tourdiary/user-submissions", { 
      state: { userId: selectedUserId } 
    });
  };

  // Columns
  const columns = [
    { name: "SL.NO", selector: (row, idx) => idx + 1 + page * size, width: "90px" },
    { name: "Name", selector: row => row.name ?? "NA" },
    { name: "Email", selector: row => row.email ?? "NA" },
    { name: "PEN No", selector: row => row.empNumber ?? row.penNo ?? "NA" },
    { name: "Designation", selector: row => row.designation ?? row.roles ?? "NA" },
    { name: "Office Location", selector: row => row.officelocation ?? "NA" },
    {
      name: "Action",
      cell: (row) => (
        <button
          style={{
            background: "green",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer"
          }}
          onClick={() => handleViewTourDiary(row)}
        >
          <VisibilityIcon />
        </button>
      ),
      width: "100px",
    },
  ];

  // Fetch USERS
  const fetchUsers = async () => {
    setLoading(true);

    const res = await ApprovedUserService.fetchPagedApprovedUsers({
      page,
      size,
      level: level === "ALL" ? null : level,
      districtId: district || null,
      talukId: taluk || null,
      search: search || null,
    });

    if (!res.error && res.payload) {
      console.log("Fetched Users:", res.payload);
      setUsers(res.payload.content);
      setTotalRows(res.payload.totalElements);
      setLoggedDistrictId(res.payload.distId || null);
      setLoggedTalukId(res.payload.talukId || null);
    } else {
      setUsers([]);
      setTotalRows(0);
    }

    setLoading(false);
  };

  // Reset taluk when district changes
  useEffect(() => {
    setTaluk("");
  }, [district]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  // Auto-set level when district or taluk changes
  useEffect(() => {
    if (taluk) {
      setLevel("TALUK");
    } else if (district) {
      setLevel("DISTRICT");
    } else {
      setLevel("ALL");
    }
  }, [district, taluk]);

  // Reset district/taluk when level changes
  useEffect(() => {
    if (role !== "District Level Approver") {
      if (level === "ALL" || level === "DIRECTORATE") {
        setDistrict("");
        setTaluk("");
      }

      if (level === "DISTRICT") {
        setTaluk("");
      }
    }
  }, [level, role]);

  useEffect(() => {
    if (
      role === "District Level Approver" &&
      loggedDistrictId &&
      !district
    ) {
      setDistrict(loggedDistrictId);
      setLevel("DISTRICT");
    }
  }, [role, loggedDistrictId, district]);

  // Fetch district list
  const loadDistricts = async () => {
    const res = await ApprovedUserService.getDistricts();
    if (res.payload) setDistricts(res.payload);
  };

  // Fetch taluks when district changes
  const loadTaluks = async () => {
    if (!district) {
      setTaluks([]);
      setTaluk("");
      return;
    }
    const res = await ApprovedUserService.getTaluks(district);
    if (res.payload) setTaluks(res.payload);
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    loadTaluks();
  }, [district]);

  useEffect(() => {
    fetchUsers();
  }, [page, size, level, district, taluk, search]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Active Users - Tour Diary
        </Typography>

        {/* Filters */}
        <Paper elevation={3} style={{ padding: "14px", marginBottom: "16px", width: "100%" }}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            style={{ width: "90%" }}
          >
            {/* LEVEL */}
            {(role !== "Taluk Level Approver" && role !== "District Level Approver") &&
              <TextField
                label="Office Type"
                select
                size="small"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ width: "180px" }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="DIRECTORATE">Directorate</MenuItem>
                <MenuItem value="DISTRICT">District</MenuItem>
                <MenuItem value="TALUK">Taluk</MenuItem>
              </TextField>}

            {/* DISTRICT */}
            {role !== "Taluk Level Approver" && (
              <TextField
                label="District"
                select
                size="small"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: "180px" }}
                disabled={
                  level === "DIRECTORATE" ||
                  role === "District Level Approver"
                }
              >
                {role !== "District Level Approver" && (
                  <MenuItem value="">All</MenuItem>
                )}

                {districts.map((d) => (
                  <MenuItem
                    key={d.districtOfficeId}
                    value={d.districtOfficeId}
                  >
                    {d.districtOfficeNameEn}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* TALUK */}
            {role !== "Taluk Level Approver" &&
              <TextField
                label="Taluk"
                select
                size="small"
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                style={{ width: "180px" }}
                disabled={!district || level === "DIRECTORATE"}
              >
                {role !== "District Level Approver" && (
                  <MenuItem value="">All</MenuItem>
                )}

                {taluks.map((t) => (
                  <MenuItem key={t.desTalukId} value={t.desTalukId}>
                    {t.talukOfficeNameEn}
                  </MenuItem>
                ))}
              </TextField>}

            {/* SEARCH */}
            <TextField
              label="Search"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "220px" }}
            />
          </Stack>
        </Paper>

        {/* TABLE */}
        <Box>
          <DataTable
            columns={columns}
            data={users}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            onChangePage={(pg) => setPage(pg - 1)}
            onChangeRowsPerPage={(perPage) => setSize(perPage)}
            customStyles={{
              headCells: {
                style: {
                  background: "#04255e",
                  color: "white",
                  fontWeight: "bold",
                },
              },
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default AdminTourDiary;