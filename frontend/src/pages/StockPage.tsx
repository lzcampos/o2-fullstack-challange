import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Chip,
  Autocomplete,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { 
  StockMovementFilters, 
  StockMovement, 
  NewStockMovement 
} from '../types/stockMovement';
import { ProductWithStock } from '../types/product';
import * as stockMovementService from '../services/stockMovementService';
import * as productService from '../services/productService';
import PaginationControls from '../components/PaginationControls';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

// Helper function to format price from cents to dollars
const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2);
};

const StockPage: React.FC = () => {
  // State for stock movements
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMovements, setTotalMovements] = useState(0);
  
  // Filters and pagination
  const [filters, setFilters] = useState<StockMovementFilters>({
    start: 0,
    take: 25,
  });
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out' | ''>('');
  
  // Products for dropdown
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [newMovement, setNewMovement] = useState<Partial<NewStockMovement>>({
    movement_type: 'in',
    quantity: 1,
  });
  const [formError, setFormError] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Load stock movements on initial render and when filters change
  useEffect(() => {
    loadStockMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  // Load products once
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await productService.getProducts({
        take: 1000, // Get all products for dropdown
        in_stock: false, // Include out of stock products too
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setProductsLoading(false);
    }
  };
  
  const loadStockMovements = async () => {
    setLoading(true);
    try {
      const response = await stockMovementService.getStockMovements(filters);
      setStockMovements(response.data);
      setTotalMovements(response.meta.total);
    } catch (error) {
      console.error('Failed to load stock movements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = () => {
    // Update filters based on selected date and type
    const newFilters: StockMovementFilters = {
      ...filters,
      start: 0, // Reset to first page on filter change
    };
    
    if (startDate) {
      newFilters.start_date = startDate.format('YYYY-MM-DD');
    } else {
      delete newFilters.start_date;
    }
    
    if (endDate) {
      newFilters.end_date = endDate.format('YYYY-MM-DD');
    } else {
      delete newFilters.end_date;
    }
    
    if (movementType) {
      newFilters.movement_type = movementType;
    } else {
      delete newFilters.movement_type;
    }
    
    setFilters(newFilters);
  };
  
  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      start: (page - 1) * (filters.take || 25),
    });
  };
  
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setFilters({
      ...filters,
      take: rowsPerPage,
      start: 0, // Reset to first page when changing rows per page
    });
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedProduct(null);
    setNewMovement({
      movement_type: 'in',
      quantity: 1,
    });
    setFormError({});
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setNewMovement({
      movement_type: 'in',
      quantity: 1,
    });
    setFormError({});
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedProduct) {
      errors.product = 'Product is required';
    }
    
    if (!newMovement.quantity || newMovement.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than zero';
    }
    
    if (newMovement.movement_type === 'out' && selectedProduct) {
      // Check if there's enough stock
      if (selectedProduct.quantity < (newMovement.quantity || 0)) {
        errors.quantity = `Not enough stock. Available: ${selectedProduct.quantity}`;
      }
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveMovement = async () => {
    if (!validateForm() || !selectedProduct) return;
    
    const movement: NewStockMovement = {
      product_id: selectedProduct.id,
      quantity: newMovement.quantity || 1,
      movement_type: newMovement.movement_type as 'in' | 'out',
      notes: newMovement.notes,
    };
    
    setSaveLoading(true);
    try {
      await stockMovementService.createStockMovement(movement);
      handleCloseDialog();
      loadStockMovements();
      loadProducts(); // Reload products to update stock quantities
    } catch (error) {
      console.error('Failed to save stock movement:', error);
      alert('Failed to save stock movement. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setNewMovement({
      ...newMovement,
      [name]: name === 'quantity' ? parseInt(value as string, 10) || 0 : value,
    });
    
    // Clear error for this field if it was previously set
    if (formError[name]) {
      setFormError({
        ...formError,
        [name]: '',
      });
    }
  };
  
  // Calculate pagination info
  const page = Math.floor((filters.start || 0) / (filters.take || 25)) + 1;
  const totalPages = Math.ceil(totalMovements / (filters.take || 25));
  
  return (
    <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" component="h1" className="page-title">
        Stock Movements
      </Typography>
      
      {/* Filters */}
      <Box className="filters-container">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          slotProps={{ textField: { size: 'small' } }}
        />
        
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          slotProps={{ textField: { size: 'small' } }}
        />
        
        <FormControl variant="outlined" size="medium" sx={{ minWidth: 150 }}>
          <InputLabel id="movement-type-label">Movement Type</InputLabel>
          <Select
            labelId="movement-type-label"
            value={movementType}
            onChange={(e: SelectChangeEvent) => setMovementType(e.target.value as 'in' | 'out' | '')}
            label="Movement Type"
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            <MenuItem value="in">In</MenuItem>
            <MenuItem value="out">Out</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleFilterChange}
        >
          Apply Filters
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ ml: 'auto' }}
        >
          Add Movement
        </Button>
      </Box>
      
      {/* Stock Movements Table */}
      <TableContainer component={Paper} className="table-container" sx={{ width: '100%' }}>
        <Table aria-label="stock movements table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : stockMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No stock movements found
                </TableCell>
              </TableRow>
            ) : (
              stockMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.id}</TableCell>
                  <TableCell>
                    {dayjs(movement.movement_date).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell>{movement.product_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={movement.movement_type.toUpperCase()} 
                      color={movement.movement_type === 'in' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>
                    {movement.notes || <em>No notes</em>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {!loading && stockMovements.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          rowsPerPage={filters.take || 25}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
      
      {/* Add Stock Movement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stock Movement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={products}
              loading={productsLoading}
              getOptionLabel={(option) => option.name}
              value={selectedProduct}
              onChange={(_event, newValue) => {
                setSelectedProduct(newValue);
                if (formError.product) {
                  setFormError({
                    ...formError,
                    product: '',
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product"
                  error={!!formError.product}
                  helperText={formError.product}
                  required
                />
              )}
            />
            
            {selectedProduct && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  Current Stock: <strong>{selectedProduct.quantity}</strong>
                </Typography>
                <Typography variant="body2">
                  Price: <strong>${formatPrice(selectedProduct.price)}</strong>
                </Typography>
              </Box>
            )}
            
            <FormControl fullWidth>
              <InputLabel id="movement-type-select-label">Movement Type</InputLabel>
              <Select
                labelId="movement-type-select-label"
                name="movement_type"
                value={newMovement.movement_type}
                onChange={handleInputChange}
                label="Movement Type"
                required
              >
                <MenuItem value="in">In (Add to Stock)</MenuItem>
                <MenuItem value="out">Out (Remove from Stock)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={newMovement.quantity || ''}
              onChange={handleInputChange}
              error={!!formError.quantity}
              helperText={formError.quantity}
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              required
            />
            
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={newMovement.notes || ''}
              onChange={handleInputChange}
              multiline
              rows={2}
              placeholder="Optional notes about this stock movement"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveMovement}
            color="primary"
            variant="contained"
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={20} /> : null}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockPage; 