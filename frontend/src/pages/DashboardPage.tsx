import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartData,
  ChartDataset,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import * as metricsService from '../services/metricsService';
import * as stockMovementService from '../services/stockMovementService';
import { StockValue, MovementSummary, StockSummary } from '../types/metrics';
import { PopularProduct } from '../types/stockMovement';

// Helper function to format price from cents to dollars
const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2);
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const DashboardPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Dashboard data
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [stockValues, setStockValues] = useState<StockValue[]>([]);
  const [movementSummary, setMovementSummary] = useState<MovementSummary | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  
  // Loading states
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);
  const [movementLoading, setMovementLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  
  // Load data on initial render and when date range changes
  useEffect(() => {
    const start = startDate ? startDate.format('YYYY-MM-DD') : undefined;
    const end = endDate ? endDate.format('YYYY-MM-DD') : undefined;
    
    loadStockSummary(start, end);
    loadStockValues();
    loadMovementSummary(start, end);
    loadPopularProducts();
  }, [startDate, endDate]);
  
  const loadStockSummary = async (startDate?: string, endDate?: string) => {
    setSummaryLoading(true);
    try {
      const data = await metricsService.getStockSummary(startDate, endDate);
      setStockSummary(data);
    } catch (error) {
      console.error('Failed to load stock summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };
  
  const loadStockValues = async () => {
    setStockLoading(true);
    try {
      const response = await metricsService.getCurrentStockValue();
      setStockValues(response.data);
    } catch (error) {
      console.error('Failed to load stock values:', error);
    } finally {
      setStockLoading(false);
    }
  };
  
  const loadMovementSummary = async (startDate?: string, endDate?: string) => {
    setMovementLoading(true);
    try {
      const response = await metricsService.getStockMovementsSummary(startDate, endDate);
      setMovementSummary(response.data);
    } catch (error) {
      console.error('Failed to load movement summary:', error);
    } finally {
      setMovementLoading(false);
    }
  };
  
  const loadPopularProducts = async () => {
    setPopularLoading(true);
    try {
      const response = await stockMovementService.getPopularProducts(0, 10);
      setPopularProducts(response.data);
    } catch (error) {
      console.error('Failed to load popular products:', error);
    } finally {
      setPopularLoading(false);
    }
  };
  
  // Prepare chart data
  const movementChartData = {
    labels: ['Stock In', 'Stock Out'],
    datasets: [
      {
        label: 'Quantity',
        data: [
          movementSummary?.total_in || 0,
          movementSummary?.total_out || 0,
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
      },
    ],
  };

  const movementValueChartData = {
    labels: ['Value In', 'Value Out'],
    datasets: [
      {
        label: 'Value ($)',
        data: [
          (movementSummary?.total_in_value && (movementSummary?.total_in_value / 100).toFixed(2)) || 0,
          (movementSummary?.total_out_value && (movementSummary?.total_out_value / 100).toFixed(2)) || 0,
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 159, 64, 0.8)'],
      },
    ],
  };

  const popularProductsChartData = {
    labels: popularProducts.map(p => p.product_name),
    datasets: [
      {
        label: 'Total Movements',
        data: popularProducts.map(p => p.total_movements),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };
  
  // New chart data for popular products IN/OUT quantities
  const popularProductsInOutChartData = {
    labels: popularProducts.map(p => p.product_name),
    datasets: [
      {
        label: 'Stock In',
        data: popularProducts.map(p => p.total_in),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        stack: 'Stack 0',
      },
      {
        label: 'Stock Out',
        data: popularProducts.map(p => p.total_out),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        stack: 'Stack 0',
      }
    ],
  };
  
  // Total quantities chart data
  const popularProductsTotalQuantityChartData = {
    labels: popularProducts.map(p => p.product_name),
    datasets: [
      {
        label: 'Total Quantity (In + Out)',
        data: popularProducts.map(p => p.total_in + p.total_out),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Movements',
      },
    },
  };
  
  return (
    <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" component="h1" className="page-title">
        Dashboard
      </Typography>
      
      {/* Date Range Filters */}
      <Box className="filters-container" sx={{ mb: 4 }}>
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
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="period-label">Time Period</InputLabel>
          <Select
            labelId="period-label"
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
            label="Time Period"
          >
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              {summaryLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5" component="div">
                  {stockSummary?.total_products || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Stock Value
              </Typography>
              {summaryLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5" component="div">
                  ${formatPrice(stockSummary?.total_stock_value || 0)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Items In Stock
              </Typography>
              {summaryLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5" component="div">
                  {stockSummary?.total_items_in_stock || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items Sold
              </Typography>
              {movementLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5" component="div">
                  {movementSummary?.total_out || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stock Movement Quantity
            </Typography>
            {movementLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <Bar options={chartOptions} data={movementChartData} />
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stock Movement Value
            </Typography>
            {movementLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <Pie 
                  data={movementValueChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Stock Value Movements',
                      },
                    },
                  }} 
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Popular Products Chart */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Most Popular Products
        </Typography>
        {popularLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <Bar 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Most Moved Products',
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
              }} 
              data={popularProductsChartData} 
            />
          </Box>
        )}
      </Paper>
      
      {/* Popular Products IN/OUT Quantities Chart */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Popular products stock variation
        </Typography>
        {popularLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <Bar 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Products In/Out Quantities',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y || 0;
                        return `${label}: ${value}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Quantity'
                    }
                  }
                },
              }} 
              data={popularProductsInOutChartData} 
            />
          </Box>
        )}
      </Paper>
      
      {/* Current Stock Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Stock Items
        </Typography>
        <TableContainer sx={{ width: '100%' }}>
          <Table aria-label="stock table" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : stockValues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No stock items found
                  </TableCell>
                </TableRow>
              ) : (
                stockValues
                  .filter(item => item.quantity > 0)
                  .slice(0, 10)
                  .map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${formatPrice(item.price)}</TableCell>
                      <TableCell align="right">${formatPrice(item.total_value)}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default DashboardPage; 