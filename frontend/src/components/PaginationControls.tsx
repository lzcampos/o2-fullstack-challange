import React from 'react';
import { Box, Pagination, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}) => {
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent) => {
    onRowsPerPageChange(Number(event.target.value));
    onPageChange(1); // Reset to first page when changing rows per page
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        my: 2,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 2,
      }}
    >
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="rows-per-page-label">Rows</InputLabel>
        <Select
          labelId="rows-per-page-label"
          value={rowsPerPage.toString()}
          onChange={handleRowsPerPageChange}
          label="Rows"
        >
          {rowsPerPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default PaginationControls; 