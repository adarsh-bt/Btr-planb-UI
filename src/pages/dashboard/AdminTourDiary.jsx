import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Typography,
  Stack,
  MenuItem,
  Box,
  Grid,
  Modal,
  Button
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


  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const role = authservice.getrole();
  const userId = authservice.userid();

  // Handle modal close
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  // Handle menu selection for tour diary type
  const handleMenuSelect = (type) => {
    if (!selectedRow) return;
    
    const selectedUserId = selectedRow.userId || selectedRow.id || selectedRow.user_id || selectedRow.empId;
    
    console.log("Navigating with userId:", selectedUserId, "from row:", selectedRow);
    
    if (!selectedUserId) {
      console.error("No valid user ID found in row:", selectedRow);
      alert("Cannot view tour diary: User ID not found");
      handleCloseModal();
      return;
    }
    
    if (type === 'advanced') {
      navigate("/approval_manage/tourdiary/user-submissions", { 
        state: { userId: selectedUserId } 
      });
    } else if (type === 'regular') {
      navigate("/approval_manage/tourdiary/user-submissions", { 
        state: { userId: selectedUserId } 
      });
    }
    
    handleCloseModal();
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
          onClick={() => {
            setSelectedRow(row);
            setOpenModal(true);
          }}
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
        <Breadcrumb />
      <Grid item xs={12}>
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
        {/* Modal for Tour Diary Selection */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="tour-diary-modal-title"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}>
            <Typography id="tour-diary-modal-title" variant="h6" component="h2" sx={{ mb: 3 }}>
              Select Tour Diary Type
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => handleMenuSelect('advanced')}
                sx={{ backgroundColor: '#1976d2' }}
              >
                Advanced Tour Program
              </Button>
              <Button
                variant="contained"
                onClick={() => handleMenuSelect('regular')}
                sx={{ backgroundColor: '#2e7d32' }}
              >
                Tour Diary
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Grid>
    </Grid>
  );
};

export default AdminTourDiary;