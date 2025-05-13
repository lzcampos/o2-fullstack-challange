import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { ProductWithStock, ProductFilters, Product } from '../types/product';
import * as productService from '../services/productService';
import PaginationControls from '../components/PaginationControls';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Helper functions for price conversion
const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2);
};

const parsePrice = (priceInDollars: string): number => {
  return Math.round(parseFloat(priceInDollars) * 100);
};

const ProductsPage: React.FC = () => {
  // State for products list
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filters and pagination
  const [filters, setFilters] = useState<ProductFilters>({
    start: 0,
    take: 25,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Dialog states
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [formError, setFormError] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Load products on initial render and when filters change
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  // Load categories once
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      const categoriesList = await productService.getCategories();
      setCategories(categoriesList);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.data);
      setTotalProducts(response.meta.total);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      search: searchTerm,
      start: 0, // Reset to first page on new search
    });
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters({
      ...filters,
      category: category || undefined,
      start: 0, // Reset to first page on filter change
    });
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
  
  // Dialog handlers
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setCurrentProduct({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
      });
    } else {
      setCurrentProduct({});
    }
    setFormError({});
    setOpenProductDialog(true);
  };
  
  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setCurrentProduct({});
    setFormError({});
  };
  
  const handleOpenDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentProduct({});
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!currentProduct.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!currentProduct.price) {
      errors.price = 'Price is required';
    } else {
      try {
        const priceValue = typeof currentProduct.price === 'string' 
          ? parseFloat(currentProduct.price) 
          : currentProduct.price / 100;
        
        if (isNaN(priceValue) || priceValue <= 0) {
          errors.price = 'Price must be greater than zero';
        }
      } catch (error) {
        errors.price = 'Invalid price format';
      }
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveProduct = async () => {
    if (!validateForm()) return;
    
    setSaveLoading(true);
    try {
      // If price is entered as dollars, convert to cents before saving
      const productToSave = {
        ...currentProduct,
        price: typeof currentProduct.price === 'string' 
          ? parsePrice(currentProduct.price) 
          : currentProduct.price
      };
      
      if (productToSave.id) {
        await productService.updateProduct(productToSave.id, productToSave);
      } else {
        await productService.createProduct(productToSave as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      }
      handleCloseProductDialog();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!currentProduct.id) return;
    
    setDeleteLoading(true);
    try {
      await productService.deleteProduct(currentProduct.id);
      handleCloseDeleteDialog();
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    
    // For price field, store as is (no conversion here)
    setCurrentProduct({
      ...currentProduct,
      [name]: value,
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
  const totalPages = Math.ceil(totalProducts / (filters.take || 25));
  
  return (
    <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" component="h1" className="page-title">
        Products
      </Typography>
      
      {/* Filters */}
      <Box className="filters-container">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <TextField 
            label="Search products" 
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<SearchIcon />}
            size="medium"
          >
            Search
          </Button>
        </form>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={selectedCategory}
            onChange={(e: SelectChangeEvent) => handleCategoryChange(e.target.value as string)}
            label="Category"
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenProductDialog()}
        >
          Add Product
        </Button>
      </Box>
      
      {/* Products Table */}
      <TableContainer component={Paper} className="table-container" sx={{ width: '100%' }}>
        <Table aria-label="products table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${formatPrice(product.price)}</TableCell>
                  <TableCell>
                    {product.category ? (
                      <Chip label={product.category} size="small" />
                    ) : (
                      <em>None</em>
                    )}
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    {product.description ? (
                      product.description.length > 50 ? (
                        `${product.description.substring(0, 50)}...`
                      ) : (
                        product.description
                      )
                    ) : (
                      <em>No description</em>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box className="action-buttons">
                      <IconButton
                        color="primary"
                        aria-label="edit"
                        onClick={() => handleOpenProductDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        aria-label="delete"
                        onClick={() => handleOpenDeleteDialog(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {!loading && products.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          rowsPerPage={filters.take || 25}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={openProductDialog} onClose={handleCloseProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentProduct.id ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={currentProduct.name || ''}
              onChange={handleInputChange}
              error={!!formError.name}
              helperText={formError.name}
              required
            />
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              // Display price in dollars for editing
              value={currentProduct.price !== undefined 
                ? typeof currentProduct.price === 'string' 
                  ? currentProduct.price 
                  : formatPrice(currentProduct.price)
                : ''}
              onChange={handleInputChange}
              error={!!formError.price}
              helperText={formError.price || "Enter price in dollars (e.g. 79.99)"}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              required
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={currentProduct.category || ''}
                onChange={handleInputChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentProduct.description || ''}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog} disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            color="primary"
            variant="contained"
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={20} /> : null}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={openDeleteDialog}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${currentProduct.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteProduct}
        onCancel={handleCloseDeleteDialog}
        loading={deleteLoading}
        confirmText="Delete"
        confirmColor="error"
      />
    </div>
  );
};

export default ProductsPage; 