import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import Breadcrumb from 'routes/Breadcrumb';
import userManualService from 'pages/authentication/services/usermanualservice';

const themeColor = '#05307a';

/** Bytes as a short, readable size for the manual cards. */
const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '');

/**
 * The manuals available to the signed-in user.
 *
 * The list comes from the backend already filtered by the caller's roles, so this screen renders
 * whatever it is given. The management entry point is shown only when the backend reports that the
 * caller holds the management permission - the screen itself knows no role names.
 */
const UserManuals = () => {
  const navigate = useNavigate();

  const [manuals, setManuals] = useState([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [search, setSearch] = useState('');

  // Filtered in the browser, not by a request. The backend has already returned exactly the
  // manuals this user is entitled to - a handful of rows - so searching them is a display concern
  // and does not need a round trip. It also cannot widen what the user can see.
  const visibleManuals = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return manuals;
    return manuals.filter((manual) =>
      [manual.title, manual.description, manual.fileName].some((field) => (field ?? '').toLowerCase().includes(term))
    );
  }, [manuals, search]);

  const loadManuals = useCallback(async () => {
    setLoading(true);
    const result = await userManualService.fetchMyManuals();

    if (result.error) {
      setError(result.error);
      setManuals([]);
      setCanManage(false);
    } else {
      setError(null);
      setManuals(result.manuals);
      setCanManage(result.canManage);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadManuals();
  }, [loadManuals]);

  /**
   * Opens a manual in a new tab.
   *
   * The PDF is fetched with the session token and handed to the browser as a blob: there is no
   * public URL to link to, which is what keeps the authorization check on the request.
   */
  const openManual = async (manual) => {
    setOpeningId(manual.id);
    const result = await userManualService.downloadManual(manual.id);
    setOpeningId(null);

    if (result.error) {
      Swal.fire('Could not open manual', result.error, 'error');
      return;
    }

    const url = window.URL.createObjectURL(result.blob);
    const opened = window.open(url, '_blank');

    if (!opened) {
      // A blocked popup would otherwise look like a silent failure, so fall back to a download.
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName || manual.fileName || 'manual.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    // Released once the browser has had a chance to load it; revoking immediately cancels the view.
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <Paper sx={{ p: { xs: 2, sm: 4 }, boxShadow: 6, borderRadius: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <MenuBookIcon sx={{ color: themeColor }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: themeColor }}>
                  User Manuals
                </Typography>
              </Stack>

              {canManage && (
                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => navigate('/user_manuals/manage')}>
                  Manage Manuals
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {!loading && !error && manuals.length > 0 && (
              <TextField
                fullWidth
                size="small"
                placeholder="Search manuals by title, description or file name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ mb: 3, maxWidth: 480 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear search" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            )}

            {loading && (
              <Stack alignItems="center" sx={{ py: 6 }}>
                <CircularProgress />
              </Stack>
            )}

            {!loading && error && (
              <Alert severity="error" action={<Button onClick={loadManuals}>Retry</Button>}>
                {error}
              </Alert>
            )}

            {!loading && !error && manuals.length === 0 && (
              <Alert severity="info">
                No user manuals have been shared with your role yet. Please contact your administrator if you expect a manual here.
              </Alert>
            )}

            {!loading && !error && manuals.length > 0 && visibleManuals.length === 0 && (
              <Alert severity="info">No manuals match &quot;{search}&quot;.</Alert>
            )}

            {!loading && !error && visibleManuals.length > 0 && (
              <Stack spacing={2}>
                {visibleManuals.map((manual) => (
                  <Paper key={manual.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: '#e3e8ef' }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {manual.title}
                        </Typography>
                        {manual.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {manual.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {manual.fileName}
                          {manual.fileSize ? ` · ${formatSize(manual.fileSize)}` : ''}
                          {manual.uploadedAt ? ` · Uploaded ${formatDate(manual.uploadedAt)}` : ''}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        startIcon={<OpenInNewIcon />}
                        disabled={openingId === manual.id}
                        onClick={() => openManual(manual)}
                        sx={{ backgroundColor: themeColor, whiteSpace: 'nowrap' }}
                      >
                        {openingId === manual.id ? 'Opening...' : 'Open Manual'}
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
};

export default UserManuals;
