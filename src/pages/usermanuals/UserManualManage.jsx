import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

import Breadcrumb from 'routes/Breadcrumb';
import userManualService from 'pages/authentication/services/usermanualservice';

const themeColor = '#05307a';

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return 'NA';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : 'NA');

const emptyForm = { id: null, title: '', description: '', roleIds: [], isActive: true, file: null };

// Value of the "Select all" row in the role picker. A string cannot collide with a role id, which
// is always a number, and it is never stored in form.roleIds - it is intercepted on change and
// turned into a bulk toggle.
const SELECT_ALL_ROLES = '__select_all_roles__';

/**
 * Manual administration: upload a PDF, name it, choose which roles may read it, and withdraw it.
 *
 * Reachable from the User Manuals screen only when the backend reports the management permission.
 * That is presentation: every call this screen makes is refused with 403 unless the caller actually
 * holds the permission, so opening the route directly gains nothing.
 */
const UserManualManage = () => {
  const [manuals, setManuals] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Narrows the role picker only. '' means every scheme. Held outside `form` because it is a view
  // preference, not part of what gets saved.
  const [roleSchemeFilter, setRoleSchemeFilter] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);

  const rolesById = useMemo(() => roles.reduce((acc, role) => ({ ...acc, [role.id]: role }), {}), [roles]);

  // Only schemes that actually own an assignable role. Nine schemes exist but most have no roles
  // at all, and offering those would just be eight ways to empty the list.
  const roleSchemes = useMemo(() => {
    const seen = new Map();
    roles.forEach((role) => {
      if (role.schemeId != null && !seen.has(role.schemeId)) {
        seen.set(role.schemeId, role.schemeName ?? `Scheme ${role.schemeId}`);
      }
    });
    return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [roles]);

  const filteredRoles = useMemo(
    () => (roleSchemeFilter === '' ? roles : roles.filter((role) => role.schemeId === roleSchemeFilter)),
    [roles, roleSchemeFilter]
  );

  const filteredRoleIds = useMemo(() => filteredRoles.map((role) => role.id), [filteredRoles]);

  // "Select all" acts on what is currently listed, so it composes with the scheme filter instead
  // of overriding it. Both flags drive the tick box's three states: all, some, none.
  const allFilteredSelected = filteredRoleIds.length > 0 && filteredRoleIds.every((roleId) => form.roleIds.includes(roleId));
  const someFilteredSelected = filteredRoleIds.some((roleId) => form.roleIds.includes(roleId));

  // Users reached by the current selection. Roles can overlap, so this is an upper bound rather
  // than a headcount - but zero is exact, and zero is the case worth warning about: the manual
  // would save successfully and be visible to nobody.
  const reachOfSelection = useMemo(
    () => form.roleIds.reduce((total, roleId) => total + (rolesById[roleId]?.userCount ?? 0), 0),
    [form.roleIds, rolesById]
  );

  const loadManuals = useCallback(async () => {
    setLoading(true);
    const result = await userManualService.fetchAllManuals({
      page,
      size,
      search,
      isActive: statusFilter === '' ? null : statusFilter === 'active'
    });

    if (result.error) {
      setError(result.error);
      setManuals([]);
      setTotalRows(0);
    } else {
      setError(null);
      setManuals(result.content ?? []);
      setTotalRows(result.totalElements ?? 0);
    }
    setLoading(false);
  }, [page, size, search, statusFilter]);

  useEffect(() => {
    loadManuals();
  }, [loadManuals]);

  useEffect(() => {
    const loadRoles = async () => {
      const result = await userManualService.fetchAssignableRoles();
      if (result.error) {
        // The roles endpoint carries the same permission check as the rest of this screen, so a
        // 403 here means the caller should not be on it at all. Any other failure is a transport
        // problem and is reported as one.
        if (result.status === 403) {
          setPermissionDenied(true);
        } else {
          setError(result.error);
        }
        return;
      }
      setRoles(result);
    };
    loadRoles();
  }, []);

  /**
   * Applies a change from the role picker.
   *
   * The "Select all" row arrives here like any other option, so it is intercepted: it toggles
   * exactly the roles currently listed and leaves selections from other schemes untouched, which
   * is the same rule the scheme filter follows everywhere else on this screen.
   */
  const changeRoleSelection = (event) => {
    const chosen = event.target.value;

    if (!chosen.includes(SELECT_ALL_ROLES)) {
      // Rejects anything that is not a role id - the picker's own non-role rows carry '' or
      // undefined. Deliberately not narrowed to the roles currently listed: a manual can be
      // assigned to a role that has since been deactivated, and that assignment must survive an
      // unrelated edit rather than being dropped without a word.
      setForm((current) => ({
        ...current,
        roleIds: chosen.filter((roleId) => typeof roleId === 'number')
      }));
      return;
    }

    setForm((current) => {
      const keptFromOtherSchemes = current.roleIds.filter((roleId) => !filteredRoleIds.includes(roleId));
      return {
        ...current,
        roleIds: allFilteredSelected ? keptFromOtherSchemes : [...keptFromOtherSchemes, ...filteredRoleIds]
      };
    });
  };

  const openCreateDialog = () => {
    setForm(emptyForm);
    setFormError(null);
    setRoleSchemeFilter('');
    setDialogOpen(true);
  };

  const openEditDialog = (manual) => {
    setForm({
      id: manual.id,
      title: manual.title ?? '',
      description: manual.description ?? '',
      roleIds: (manual.roles ?? []).map((role) => role.id),
      isActive: !!manual.isActive,
      file: null
    });
    setFormError(null);
    setRoleSchemeFilter('');
    setDialogOpen(true);
  };

  const chooseFile = (event) => {
    const file = event.target.files?.[0] ?? null;
    setFormError(null);

    // A first check for the obvious case only. The binding rule is the server's: it checks the
    // extension, the content type and the actual PDF signature, and enforces the size limit.
    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
      setForm((current) => ({ ...current, file: null }));
      setFormError('Only PDF files can be uploaded.');
      return;
    }
    setForm((current) => ({ ...current, file }));
  };

  const saveManual = async () => {
    if (!form.title.trim()) {
      setFormError('Manual title is required.');
      return;
    }
    if (form.roleIds.length === 0) {
      setFormError('Select at least one role that may access this manual.');
      return;
    }
    if (!form.id && !form.file) {
      setFormError('Choose the PDF file to upload.');
      return;
    }

    setSaving(true);
    const result = await userManualService.saveManual(form);
    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setDialogOpen(false);
    Swal.fire('Saved', result.message || 'The manual has been saved.', 'success');
    loadManuals();
  };

  const deactivateManual = async (manual) => {
    const confirmed = await Swal.fire({
      title: 'Deactivate this manual?',
      text: `"${manual.title}" will no longer be visible to any user. It can be reactivated later by editing it.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deactivate',
      confirmButtonColor: '#d33'
    });

    if (!confirmed.isConfirmed) return;

    const result = await userManualService.deactivateManual(manual.id);
    if (result.error) {
      Swal.fire('Could not deactivate', result.error, 'error');
      return;
    }
    Swal.fire('Deactivated', result.message || 'The manual has been withdrawn.', 'success');
    loadManuals();
  };

  const columns = [
    {
      name: 'SL.NO',
      selector: (row, index) => index + 1 + page * size,
      width: '80px'
    },
    {
      name: 'Manual',
      cell: (row) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {row.title}
          </Typography>
          {row.description && (
            <Typography variant="caption" color="text.secondary" display="block">
              {row.description}
            </Typography>
          )}
        </Box>
      ),
      grow: 2,
      wrap: true
    },
    {
      name: 'File',
      cell: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PictureAsPdfIcon fontSize="small" color="error" />
          <Typography variant="caption">
            {row.fileName} ({formatSize(row.fileSize)})
          </Typography>
        </Stack>
      ),
      grow: 2,
      wrap: true
    },
    {
      name: 'Assigned Roles',
      cell: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ py: 1 }}>
          {(row.roles ?? []).length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              None
            </Typography>
          ) : (
            // A role nobody holds is flagged here too, so an existing manual that reaches no one
            // is visible as such in the list rather than only inside the edit dialog.
            row.roles.map((role) => {
              const reaches = rolesById[role.id]?.userCount;
              return (
                <Chip
                  key={role.id}
                  label={reaches === 0 ? `${role.name} (no users)` : role.name}
                  size="small"
                  color={reaches === 0 ? 'warning' : 'default'}
                  variant={reaches === 0 ? 'outlined' : 'filled'}
                />
              );
            })
          )}
        </Stack>
      ),
      grow: 2,
      wrap: true
    },
    { name: 'Uploaded', selector: (row) => formatDate(row.uploadedAt), width: '120px' },
    { name: 'Uploaded By', selector: (row) => row.uploadedBy ?? 'NA', wrap: true },
    {
      name: 'Status',
      cell: (row) => <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />,
      width: '110px'
    },
    {
      name: 'Action',
      cell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => openEditDialog(row)}>
            <EditIcon fontSize="small" />
          </Button>
          <Button size="small" variant="outlined" color="error" disabled={!row.isActive} onClick={() => deactivateManual(row)}>
            <BlockIcon fontSize="small" />
          </Button>
        </Stack>
      ),
      width: '140px'
    }
  ];

  if (permissionDenied) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              You are not permitted to manage user manuals. Please contact your administrator if you believe you should have access.
            </Alert>
          </Box>
        </Grid>
      </Grid>
    );
  }

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
              <Typography variant="h5" fontWeight="bold" sx={{ color: themeColor }}>
                User Manuals
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog} sx={{ backgroundColor: themeColor }}>
                Upload Manual
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label="Search"
                value={search}
                onChange={(event) => {
                  setPage(0);
                  setSearch(event.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 260 }}
              />
              <TextField
                size="small"
                select
                label="Status"
                value={statusFilter}
                onChange={(event) => {
                  setPage(0);
                  setStatusFilter(event.target.value);
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <DataTable
              columns={columns}
              data={manuals}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationDefaultPage={page + 1}
              paginationPerPage={size}
              onChangePage={(nextPage) => setPage(nextPage - 1)}
              onChangeRowsPerPage={(nextSize) => {
                setSize(nextSize);
                setPage(0);
              }}
              noDataComponent={
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No manuals found.
                  </Typography>
                </Box>
              }
              highlightOnHover
              dense
            />
          </Paper>
        </Box>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit Manual' : 'Upload Manual'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Manual Title"
              required
              fullWidth
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              inputProps={{ maxLength: 1000 }}
            />

            {roleSchemes.length > 0 && (
              <TextField
                select
                fullWidth
                size="small"
                label="Filter roles by scheme"
                value={roleSchemeFilter}
                onChange={(event) => setRoleSchemeFilter(event.target.value)}
                helperText="Narrows the list below only. Roles already ticked in another scheme stay selected."
              >
                <MenuItem value="">All schemes</MenuItem>
                {roleSchemes.map((scheme) => (
                  <MenuItem key={scheme.id} value={scheme.id}>
                    {scheme.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <FormControl fullWidth required>
              <InputLabel id="user-manual-roles-label">Visible To</InputLabel>
              <Select
                multiple
                labelId="user-manual-roles-label"
                value={form.roleIds}
                onChange={changeRoleSelection}
                input={<OutlinedInput label="Visible To" />}
                // Chips list every selected role, including ones the scheme filter is currently
                // hiding - otherwise narrowing the filter would look like it had dropped them.
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {selected.map((roleId) => (
                      <Chip key={roleId} label={rolesById[roleId]?.name ?? roleId} size="small" />
                    ))}
                  </Stack>
                )}
              >
                {filteredRoles.length === 0 && (
                  <MenuItem disabled value="">
                    No roles in this scheme
                  </MenuItem>
                )}
                {filteredRoles.length > 0 && (
                  <MenuItem
                    value={SELECT_ALL_ROLES}
                    // Separated with a border rather than a Divider child: MUI clones every valid
                    // child of a Select into a clickable option, so a Divider would become a row
                    // that puts an undefined value into the selection when clicked.
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 0.5 }}
                  >
                    <Checkbox
                      checked={allFilteredSelected}
                      indeterminate={someFilteredSelected && !allFilteredSelected}
                      size="small"
                      sx={{ mr: 1, p: 0.5 }}
                    />
                    <ListItemText
                      primary={
                        allFilteredSelected
                          ? 'Clear all'
                          : roleSchemeFilter === ''
                            ? 'Select all roles'
                            : `Select all in ${roleSchemes.find((scheme) => scheme.id === roleSchemeFilter)?.name ?? 'this scheme'}`
                      }
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" sx={{ ml: 2 }} color="text.secondary">
                      {filteredRoleIds.length}
                    </Typography>
                  </MenuItem>
                )}
                {filteredRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox checked={form.roleIds.includes(role.id)} size="small" sx={{ mr: 1, p: 0.5 }} />
                    <ListItemText primary={role.name} />
                    <Typography variant="caption" sx={{ ml: 2 }} color={role.userCount ? 'text.secondary' : 'error'}>
                      {role.userCount === 1 ? '1 user' : `${role.userCount ?? 0} users`}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />}>
                {form.id ? 'Replace PDF (optional)' : 'Choose PDF'}
                <input hidden type="file" accept="application/pdf,.pdf" onChange={chooseFile} />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {form.file ? form.file.name : 'No new file selected.'}
              </Typography>
            </Box>

            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />}
              label="Active"
            />

            {form.roleIds.length > 0 && reachOfSelection === 0 && (
              <Alert severity="warning">
                No users currently hold the selected role{form.roleIds.length > 1 ? 's' : ''}, so nobody will see this manual. It will be
                saved and become visible as soon as someone is given one of these roles.
              </Alert>
            )}

            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveManual} disabled={saving} sx={{ backgroundColor: themeColor }}>
            {saving ? 'Saving...' : form.id ? 'Save' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserManualManage;
