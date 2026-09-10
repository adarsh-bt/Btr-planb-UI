import React from 'react';
import {
  Alert,
  Box,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { categoryValue } from './useEstimationResults';
import { formatHectares, formatPercent } from './areaEstimationMappers';

/**
 * The drill-down pivot, shared by every results screen.
 *
 * All eight screens render the same thing at different levels: geographic units down the side,
 * the run's categories across the top, previous and current year in each. Writing it once means the
 * mapping from the reporting response to the table exists in one place — and, more to the point,
 * that no screen can quietly reintroduce a calculation of its own.
 *
 * **This component performs no arithmetic.** Every hectare, total and percentage is rendered exactly
 * as the backend published it. A null stays a dash: "no row was produced" and "measured as none"
 * are different statements, and collapsing them into 0 would be a lie about the data.
 *
 * The layout, colours and column structure are the ones the screens already had.
 */
const SUB_HEADER = { color: 'white', fontSize: '0.8rem' };
const SUB_HEADER_LEFT = { color: 'white', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' };
const PREVIOUS_CELL = { color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' };
const TOTAL_PREVIOUS_CELL = { fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' };

/** Separator in the sub-headers, kept out of JSX text so it cannot be mangled by tooling. */
const DOT = '\u00b7';

/** Shown where a figure does not apply, as distinct from one that was never estimated. */
const DASH = '\u2014';

const EstimationPivotTable = ({
  results,
  unitLabel,
  totalsLabel,
  rows,
  onDrillDown,
  extraColumns = [],
  emptyMessage,
  showIrrigationSplit = false
}) => {
  const { loading, error, runId, columns, hasPreviousYear } = results;

  /**
   * How many columns one category occupies.
   *
   * Crops are shown as irrigated and un-irrigated side by side, each with last year and this year,
   * because that is the comparison the reader is making. Land utilization and irrigation-source
   * results carry no irrigation flag, so they keep the single pair.
   */
  const perCategory = showIrrigationSplit ? (hasPreviousYear ? 4 : 2) : hasPreviousYear ? 2 : 1;

  /**
   * Renders one figure of a cell.
   *
   * A missing cell and a zero cell are different facts. The run records the full category list it
   * set out with, so a column with no cell means that crop was estimated and nothing was enumerated
   * for it — said in words rather than left as a dash that reads like a rendering gap.
   */
  const renderValue = (cell, field) => {
    if (!cell) {
      return (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Estimation not done
        </Typography>
      );
    }
    const value = cell[field];
    // The cell exists but carries no split: land utilization and irrigation-source results have no
    // irrigation flag, so this pairing is not applicable rather than unestimated.
    return value === null || value === undefined ? '—' : formatHectares(value);
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" align="center" sx={{ mt: 2 }} color="text.secondary">
          Loading results…
        </Typography>
      </Box>
    );
  }

  // An error is stated, never rendered as an empty or zeroed table — a failed request and a run
  // that produced nothing are entirely different things to a reader.
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!runId) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          No estimation has been run for this selection yet.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Validate and initiate an estimation from the dashboard to see results here.
        </Typography>
      </Box>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          {emptyMessage || `This run produced no ${unitLabel.toLowerCase()} level results.`}
        </Typography>
      </Box>
    );
  }

  const totalFor = (column) =>
    results.levelCategoryTotals.find((total) => total.categoryKey === column.categoryKey) || null;

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: '#04255e' }}>
          <TableRow>
            <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>
              {unitLabel} Name
            </TableCell>

            {extraColumns.map((extra) => (
              <TableCell key={extra.key} rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>
                {extra.header}
              </TableCell>
            ))}

            {columns.map((column) => (
              <TableCell
                key={column.categoryKey}
                colSpan={perCategory}
                align="center"
                sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}
              >
                {column.categoryName}
              </TableCell>
            ))}

            <TableCell
              colSpan={hasPreviousYear ? 2 : 1}
              align="center"
              sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}
            >
              Total Area (Ha)
            </TableCell>
            <TableCell rowSpan={2} align="right" sx={{ color: 'white', fontWeight: 600 }}>
              YoY Variance
            </TableCell>
            <TableCell rowSpan={2} align="right" sx={{ color: 'white', fontWeight: 600 }}>
              Contribution
            </TableCell>
            {onDrillDown && (
              <TableCell rowSpan={2} align="center" sx={{ color: 'white', fontWeight: 600 }} className="no-print">
                Action
              </TableCell>
            )}
          </TableRow>
          <TableRow>
            {columns.map((column) => (
              <React.Fragment key={column.categoryKey}>
                {showIrrigationSplit ? (
                  <>
                    {hasPreviousYear && (
                      <TableCell align="right" sx={SUB_HEADER_LEFT}>
                        Irrigated {DOT} Previous
                      </TableCell>
                    )}
                    <TableCell align="right" sx={hasPreviousYear ? SUB_HEADER : SUB_HEADER_LEFT}>
                      Irrigated {DOT} Current
                    </TableCell>
                    {hasPreviousYear && (
                      <TableCell align="right" sx={SUB_HEADER_LEFT}>
                        Un-irrigated {DOT} Previous
                      </TableCell>
                    )}
                    <TableCell align="right" sx={hasPreviousYear ? SUB_HEADER : SUB_HEADER_LEFT}>
                      Un-irrigated {DOT} Current
                    </TableCell>
                  </>
                ) : (
                  <>
                    {hasPreviousYear && (
                      <TableCell align="right" sx={SUB_HEADER_LEFT}>
                        Previous Year
                      </TableCell>
                    )}
                    <TableCell align="right" sx={SUB_HEADER}>
                      Current Year
                    </TableCell>
                  </>
                )}
              </React.Fragment>
            ))}
            {hasPreviousYear && (
              <TableCell align="right" sx={{ color: 'white', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                Previous Year
              </TableCell>
            )}
            <TableCell align="right" sx={{ color: 'white', fontSize: '0.8rem' }}>
              Current Year
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.geoId} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                  <Typography fontWeight={500}>{row.geoName}</Typography>
                </Box>
              </TableCell>

              {extraColumns.map((extra) => (
                <TableCell key={extra.key}>{extra.render(row)}</TableCell>
              ))}

              {columns.map((column) => {
                const cell = categoryValue(row, column.categoryKey);
                return (
                  <React.Fragment key={column.categoryKey}>
                    {showIrrigationSplit ? (
                      <>
                        {hasPreviousYear && (
                          <TableCell align="right" sx={PREVIOUS_CELL}>
                            {renderValue(cell, 'previousIrrigatedAreaHa')}
                          </TableCell>
                        )}
                        <TableCell align="right">{renderValue(cell, 'irrigatedAreaHa')}</TableCell>
                        {hasPreviousYear && (
                          <TableCell align="right" sx={PREVIOUS_CELL}>
                            {renderValue(cell, 'previousUnirrigatedAreaHa')}
                          </TableCell>
                        )}
                        <TableCell align="right">{renderValue(cell, 'unirrigatedAreaHa')}</TableCell>
                      </>
                    ) : (
                      <>
                        {hasPreviousYear && (
                          <TableCell align="right" sx={PREVIOUS_CELL}>
                            {formatHectares(cell?.previousAreaHa)}
                          </TableCell>
                        )}
                        <TableCell align="right">{renderValue(cell, 'areaHa')}</TableCell>
                      </>
                    )}
                  </React.Fragment>
                );
              })}

              {hasPreviousYear && (
                <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                  {formatHectares(row.previousTotalAreaHa)}
                </TableCell>
              )}
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {formatHectares(row.totalAreaHa)}
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  color:
                    row.yoyVariancePercent === null || row.yoyVariancePercent === undefined
                      ? 'text.secondary'
                      : row.yoyVariancePercent >= 0
                        ? 'success.main'
                        : 'error.main',
                  fontWeight: 500
                }}
              >
                {formatPercent(row.yoyVariancePercent)}
              </TableCell>

              <TableCell align="right">{formatPercent(row.contributionPercent)}</TableCell>

              {onDrillDown && (
                <TableCell align="center" className="no-print">
                  <Tooltip title="Drill down">
                    <IconButton color="primary" onClick={() => onDrillDown(row)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}

          {/* The level's own totals, as published. Not a sum of the rows above: where a level falls
              short of its parent that difference is real, and the coverage note explains it. */}
          <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>{totalsLabel}</TableCell>
            {extraColumns.map((extra) => (
              <TableCell key={extra.key} />
            ))}

            {columns.map((column) => {
              const total = totalFor(column);
              return (
                <React.Fragment key={column.categoryKey}>
                  {showIrrigationSplit ? (
                    <>
                      {hasPreviousYear && <TableCell align="right" sx={TOTAL_PREVIOUS_CELL}>{DASH}</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatHectares(total?.irrigatedAreaHa)}
                      </TableCell>
                      {hasPreviousYear && <TableCell align="right" sx={TOTAL_PREVIOUS_CELL}>{DASH}</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatHectares(total?.unirrigatedAreaHa)}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      {hasPreviousYear && <TableCell align="right" sx={TOTAL_PREVIOUS_CELL}>{DASH}</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatHectares(total?.areaHa)}
                      </TableCell>
                    </>
                  )}
                </React.Fragment>
              );
            })}

            {hasPreviousYear && (
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                {formatHectares(results.breakdown?.previousLevelTotalAreaHa)}
              </TableCell>
            )}
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {formatHectares(results.levelTotalAreaHa)}
            </TableCell>
            <TableCell />
            <TableCell />
            {onDrillDown && <TableCell className="no-print" />}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EstimationPivotTable;
