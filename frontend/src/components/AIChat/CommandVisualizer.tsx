import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import { styled } from '@mui/material/styles';

// Command type definition (should match what's in ChatBubble)
type CommandType = 'getSales' | 'createStockMovement' | 'UNKNOWN';

interface CommandVisualizerProps {
  commandType: CommandType | string;
  data: any;
}

// Styled bar component for bar charts
const Bar = styled(Box)(({ theme }) => ({
  height: 20,
  minWidth: 20,
  backgroundColor: theme.palette.primary.main,
  borderRadius: 4,
  marginTop: 4,
  marginBottom: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 8px',
  color: theme.palette.primary.contrastText,
  transition: 'width 0.5s ease-in-out',
}));

const CommandVisualizer: React.FC<CommandVisualizerProps> = ({ commandType, data }) => {
  // If no data, don't show anything
  if (!data) return null;
  
  // Handle error data
  if (data.error) {
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {data.error}
      </Alert>
    );
  }
  
  // If the data is empty, show a message
  if (Array.isArray(data) && data.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        Nenhum dado encontrado.
      </Alert>
    );
  }
  
  // Choose visualization based on command type
  switch (commandType) {
    case 'getSales':
      return <SalesVisualizer data={data} />;
    case 'createStockMovement':
      return <MovementVisualizer data={data} />;
    default:
      return <JsonVisualizer data={data} />;
  }
};

// Visualizer for sales data
const SalesVisualizer: React.FC<{ data: any }> = ({ data }) => {
  // Standardize data for consistent handling
  const salesData = Array.isArray(data) ? data : (data.data ? data.data : data);
  
  console.log('Sales data received:', salesData);
  
  // Simple total sales visualization
  const renderTotalSales = () => {
    // Check multiple possible locations where total sales might be stored
    let totalSales = null;
    
    if (typeof salesData.total_sales === 'number') {
      totalSales = salesData.total_sales;
    } else if (salesData.filtered && typeof salesData.filtered.total_sales === 'number') {
      totalSales = salesData.filtered.total_sales;
    } else if (typeof salesData.total === 'number') {
      totalSales = salesData.total;
    } else if (typeof salesData.value === 'number') {
      totalSales = salesData.value;
    } else if (typeof salesData.total_in_value === 'number') {
      totalSales = salesData.total_in_value;
    } else if (typeof salesData.total_out_value === 'number') {
      totalSales = salesData.total_out_value;
    }
    
    // If totalSales is still null or undefined, try to look deeper
    if (totalSales === null && typeof salesData === 'object') {
      // Look for any property that might contain sales data
      for (const key in salesData) {
        if (key.includes('total') || key.includes('sales') || key.includes('value')) {
          if (typeof salesData[key] === 'number') {
            totalSales = salesData[key];
            break;
          } else if (typeof salesData[key] === 'object' && salesData[key] !== null) {
            // Look one level deeper
            for (const subKey in salesData[key]) {
              if (subKey.includes('total') || subKey.includes('sales') || subKey.includes('value')) {
                if (typeof salesData[key][subKey] === 'number') {
                  totalSales = salesData[key][subKey];
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    if (totalSales === null && totalSales !== 0) {
      console.log('Could not find total sales value in data:', salesData);
      return null;
    }
    
    console.log('Found total sales value:', totalSales);
    
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          <AttachMoneyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Total de Vendas
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          R$ {formatCurrency(totalSales)}
        </Typography>
      </Box>
    );
  };
  
  // Optional: Display sales by product if available
  const renderSalesByProduct = () => {
    const products = salesData.products || salesData.items || [];
    
    if (!Array.isArray(products) || products.length === 0) return null;
    
    // Find max value for scaling
    const maxValue = Math.max(...products.map(p => p.total_sales || p.revenue || p.value || 0));
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          <BarChartIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Vendas por Produto
        </Typography>
        
        <Box sx={{ 
          width: '100%', 
          overflowX: 'auto',
          borderRadius: 1,
          '&:hover': {
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
          },
        }}>
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{ 
              minWidth: 450,
              maxWidth: 'none',
              width: '100%',
              mb: 1,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 160 }}>Produto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 90 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 120 }}>Faturamento</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 80 }}>% do Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.slice(0, 10).map((product, index) => {
                  const productName = product.product_name || product.name || `Produto ${product.product_id || product.id}`;
                  const quantity = product.quantity_sold || product.quantity || 0;
                  const revenue = product.total_sales || product.revenue || product.value || 0;
                  const percent = maxValue > 0 ? (revenue / maxValue) * 100 : 0;
                  
                  return (
                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                      <TableCell>{productName}</TableCell>
                      <TableCell align="right">{quantity} un</TableCell>
                      <TableCell align="right">R$ {formatCurrency(revenue)}</TableCell>
                      <TableCell align="right">{Math.round(percent)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        {products.length > 10 && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            ...e mais {products.length - 10} produtos
            <span style={{ marginLeft: 8 }}>
              * Deslize horizontalmente para ver todos os dados
            </span>
          </Typography>
        )}
      </Box>
    );
  };
  
  // If we have product-specific data
  const renderFilteredData = () => {
    if (!salesData.filtered) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>
            Detalhes do Filtro
          </Typography>
          
          {salesData.filtered.product_id && (
            <Typography variant="body2">
              Produto: {salesData.filtered.product_name || `ID ${salesData.filtered.product_id}`}
            </Typography>
          )}
          
          {salesData.filtered.category && (
            <Typography variant="body2">
              Categoria: {salesData.filtered.category}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              <Typography variant="caption">Total Vendido</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {salesData.filtered.total_quantity || 0} unidades
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption">Valor Total</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                R$ {formatCurrency(salesData.filtered.total_sales || 0)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Period information
  const renderPeriod = () => {
    if (!salesData.period) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Chip 
          label={`Período: ${formatDate(salesData.period.start_date)} a ${formatDate(salesData.period.end_date)}`}
          size="small"
          color="default"
          variant="outlined"
        />
      </Box>
    );
  };
  
  // Sales by date if available
  const renderSalesByDate = () => {
    const salesByDate = salesData.sales_by_date || salesData.daily_sales;
    
    if (!salesByDate || !Array.isArray(salesByDate) || salesByDate.length === 0) return null;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          <BarChartIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Vendas por Data
        </Typography>
        
        <Box sx={{ 
          width: '100%', 
          overflowX: 'auto',
          borderRadius: 1,
          '&:hover': {
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
          },
        }}>
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{ 
              minWidth: 400,
              maxWidth: 'none',
              width: '100%',
              mb: 1,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Data</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 90 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 120 }}>Valor Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesByDate.slice(0, 10).map((item, index) => {
                  const date = item.date || item.day || '';
                  const quantity = item.quantity || item.total_quantity || 0;
                  const value = item.total || item.total_sales || 0;
                  
                  return (
                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                      <TableCell>{formatDate(date)}</TableCell>
                      <TableCell align="right">{quantity} un</TableCell>
                      <TableCell align="right">R$ {formatCurrency(value)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        {salesByDate.length > 10 && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            ...e mais {salesByDate.length - 10} datas
            <span style={{ marginLeft: 8 }}>
              * Deslize horizontalmente para ver todos os dados
            </span>
          </Typography>
        )}
      </Box>
    );
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      {renderTotalSales()}
      {renderFilteredData()}
      {renderSalesByProduct()}
      {renderSalesByDate()}
      {renderPeriod()}
    </Box>
  );
};

// Visualizer for popular items
const PopularItemsVisualizer: React.FC<{ data: any }> = ({ data }) => {
  // Handle when the data is wrapped in a "data" property or is directly an array
  const items = Array.isArray(data) ? data : 
               (Array.isArray(data.data) ? data.data : 
               (data.popular_items ? data.popular_items : []));
  
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        Não há dados de produtos populares para exibir.
      </Alert>
    );
  }
  
  // Find max value for scaling
  const maxValue = Math.max(...items.map(item => 
    item.quantity_sold || item.total_movements || item.total_out || 0
  ));
  
  // Option 1: Bar chart visualization for smaller datasets
  const renderBarChart = () => (
    <Box>
      {items.slice(0, 5).map((item, index) => {
        const productName = item.product_name || item.name || `Produto ${item.product_id || item.id}`;
        const quantity = item.quantity_sold || item.total_movements || item.total_out || 0;
        const percent = maxValue > 0 ? (quantity / maxValue) * 100 : 0;
        
        return (
          <Box key={index} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {index + 1}. {productName}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {quantity} un
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Bar sx={{ width: `${Math.max(percent, 5)}%` }}>
                {Math.round(percent)}%
              </Bar>
            </Box>
            
            {item.revenue && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                Faturamento: R$ {formatCurrency(item.revenue)}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
  
  // Option 2: Table visualization for larger datasets or more detailed view
  const renderTable = () => (
    <Box sx={{ 
      width: '100%', 
      overflowX: 'auto',
      borderRadius: 1,
      '&:hover': {
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
      },
    }}>
      <TableContainer 
        component={Paper} 
        variant="outlined"
        sx={{ 
          minWidth: 450,
          maxWidth: 'none',
          width: '100%',
          mb: 1,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40, fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 160 }}>Produto</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 90 }}>Quantidade</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 120 }}>Faturamento</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 80 }}>%</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.slice(0, 10).map((item, index) => {
              const productName = item.product_name || item.name || `Produto ${item.product_id || item.id}`;
              const quantity = item.quantity_sold || item.total_movements || item.total_out || 0;
              const percent = maxValue > 0 ? (quantity / maxValue) * 100 : 0;
              const revenue = item.revenue || 0;
              
              return (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{productName}</TableCell>
                  <TableCell align="right">{quantity} un</TableCell>
                  <TableCell align="right">
                    {revenue ? `R$ ${formatCurrency(revenue)}` : '-'}
                  </TableCell>
                  <TableCell align="right">{Math.round(percent)}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        <StorefrontIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Produtos Mais Populares
      </Typography>
      
      {/* Show table visualization if we have more than 3 items */}
      {items.length > 3 ? renderTable() : renderBarChart()}
      
      {items.length > 10 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          ...e mais {items.length - 10} produtos
          <span style={{ marginLeft: 8 }}>
            * Deslize horizontalmente para ver todos os dados
          </span>
        </Typography>
      )}
    </Box>
  );
};

// Visualizer for stock data
const StockVisualizer: React.FC<{ data: any }> = ({ data }) => {
  // If it's just a single item
  if (!Array.isArray(data)) {
    if (data.total_items || data.total_value) {
      return (
        <Box sx={{ mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              <InventoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Resumo do Estoque
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Box>
                <Typography variant="caption">Total de Itens</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {data.total_items || 0} unidades
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption">Valor Total</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  R$ {formatCurrency(data.total_value || 0)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }
    
    // For single product information
    if (data.id || data.product_id) {
      return (
        <Box sx={{ mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {data.name || data.product_name || `Produto ${data.id || data.product_id}`}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Box>
                <Typography variant="caption">Quantidade</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {data.quantity || 0} unidades
                </Typography>
              </Box>
              
              {data.price && (
                <Box>
                  <Typography variant="caption">Preço Unitário</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    R$ {formatCurrency(data.price)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      );
    }
    
    // Default for unknown structure
    return <JsonVisualizer data={data} />;
  }
  
  // For product list
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        <InventoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Estoque Atual
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        overflowX: 'auto',
        borderRadius: 1,
        '&:hover': {
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
        },
      }}>
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ 
            minWidth: 500,
            maxWidth: 'none',
            width: '100%',
            mb: 1,
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 160 }}>Produto</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 100 }}>Quantidade</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 100 }}>Preço Unit.</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 110 }}>Valor Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, 10).map((item, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                  <TableCell component="th" scope="row">
                    {item.name || item.product_name || `Produto ${item.id || item.product_id}`}
                  </TableCell>
                  <TableCell align="right">{item.quantity} un</TableCell>
                  <TableCell align="right">
                    {item.price ? `R$ ${formatCurrency(item.price)}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {item.price ? 
                      `R$ ${formatCurrency(item.price * item.quantity)}` : 
                      '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
        {data.length > 10 ? `...e mais ${data.length - 10} produtos` : ''}
        {data.length > 3 && (
          <span style={{ marginLeft: 8 }}>
            * Deslize horizontalmente para ver todos os dados
          </span>
        )}
      </Typography>
    </Box>
  );
};

// Visualizer for metrics data
const MetricsVisualizer: React.FC<{ data: any }> = ({ data }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        <BarChartIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Resumo de Métricas
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {data.total_sales !== undefined && (
          <Paper elevation={0} sx={{ p: 2, flex: '1 1 calc(50% - 8px)', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="caption">Valor Total de Vendas</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              R$ {formatCurrency(data.total_sales)}
            </Typography>
          </Paper>
        )}
        
        {data.items_sold !== undefined && (
          <Paper elevation={0} sx={{ p: 2, flex: '1 1 calc(50% - 8px)', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <Typography variant="caption">Itens Vendidos</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.items_sold} unidades
            </Typography>
          </Paper>
        )}
        
        {data.stock_value !== undefined && (
          <Paper elevation={0} sx={{ p: 2, flex: '1 1 calc(50% - 8px)', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="caption">Valor em Estoque</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              R$ {formatCurrency(data.stock_value)}
            </Typography>
          </Paper>
        )}
        
        {data.total_products !== undefined && (
          <Paper elevation={0} sx={{ p: 2, flex: '1 1 calc(50% - 8px)', bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="caption">Produtos em Estoque</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.total_products} produtos
            </Typography>
          </Paper>
        )}
        
        {data.total_items !== undefined && (
          <Paper elevation={0} sx={{ p: 2, flex: '1 1 calc(50% - 8px)', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="caption">Total de Itens em Estoque</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.total_items} unidades
            </Typography>
          </Paper>
        )}
      </Box>
      
      {data.period && (
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Período: ${formatDate(data.period.start_date)} a ${formatDate(data.period.end_date)}`}
            size="small"
            color="default"
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
};

// Visualizer for movement registration
const MovementVisualizer: React.FC<{ data: any }> = ({ data }) => {
  const movementData = data.data || data;
  const success = data.success !== undefined ? data.success : true;
  
  if (!success) {
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {data.error || 'Erro ao registrar movimento.'}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ mt: 2 }}>
      <Alert 
        icon={<CheckCircleOutlineIcon fontSize="inherit" />}
        severity="success" 
        sx={{ mb: 2 }}
      >
        Movimento registrado com sucesso!
      </Alert>
      
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" gutterBottom>
          Detalhes do Movimento
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Tipo:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {movementData.movement_type === 'in' ? 'Entrada' : 'Saída'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Produto:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {movementData.product_name || `ID ${movementData.product_id}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Quantidade:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {movementData.quantity} unidades
            </Typography>
          </Box>
          
          {movementData.date && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Data:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatDate(movementData.date)}
              </Typography>
            </Box>
          )}
        </Box>
        
        {movementData.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption">Observações:</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {movementData.notes}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// Visualizer for JSON data (fallback)
const JsonVisualizer: React.FC<{ data: any }> = ({ data }) => {
  const formattedJSON = formatJSON(data);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <CodeIcon fontSize="small" sx={{ mr: 1 }} />
        Dados Recebidos
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        overflowX: 'auto',
        borderRadius: 1,
        '&:hover': {
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
        },
      }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            minWidth: 300,
            maxHeight: '300px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <pre style={{ margin: 0, overflowX: 'auto' }}>{formattedJSON}</pre>
        </Paper>
      </Box>
    </Box>
  );
};

// Helper function to format JSON for display
const formatJSON = (data: any): string => {
  if (data === null) return 'null';
  if (data === undefined) return 'undefined';
  
  try {
    // For simple arrays of primitives, format them compactly
    if (Array.isArray(data) && data.length > 0 && 
        data.every(item => typeof item !== 'object' || item === null)) {
      return '[' + data.map(item => JSON.stringify(item)).join(', ') + ']';
    }
    
    // Handle circular references
    const seen = new WeakSet();
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (e) {
    return 'Error formatting data: ' + String(e);
  }
};

// Helper for formatting currency
const formatCurrency = (value: number): string => {
  if (value === null || value === undefined) return '0,00';
  
  // Determine if the value is already in reais or in centavos
  // If the value is large (>= 1000) and has 2 or fewer decimal places, it's likely already in reais
  // Otherwise, divide by 100 to convert from centavos to reais
  let realValue = value;
  
  // Log the original value for debugging
  console.log('Formatting currency value:', value);
  

  realValue = value / 100;

  
  // For zero or very small values, just return 0,00
  if (!realValue && realValue !== 0) return '0,00';
  
  // Log the converted value for debugging
  console.log('Converted to reais:', realValue);
  
  return realValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper for formatting dates
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
};

export default CommandVisualizer; 