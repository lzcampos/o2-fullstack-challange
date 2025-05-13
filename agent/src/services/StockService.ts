import axios from 'axios';

/**
 * Service to interact with the stock API
 */
export class StockService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get total sales with optional filters
   */
  public async getTotalSales(
    startDate?: string, 
    endDate?: string, 
    productId?: number, 
    category?: string
  ): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (productId) params.productId = productId;
      if (category) params.category = category;

      const response = await axios.get(`${this.baseUrl}/sales`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting sales data:', error);
      return { error: 'Erro ao obter dados de vendas.' };
    }
  }

  /**
   * Get list of popular items (most sold)
   */
  public async getPopularItems(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/products/popular`);
      return response.data;
    } catch (error) {
      console.error('Error getting popular items:', error);
      return { error: 'Erro ao obter produtos populares.' };
    }
  }

  /**
   * Get current stock levels of all products
   */
  public async getCurrentStock(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/stock`);
      return response.data;
    } catch (error) {
      console.error('Error getting current stock:', error);
      return { error: 'Erro ao obter dados de estoque.' };
    }
  }

  /**
   * Get stock information for a specific product
   */
  public async getProductStock(productId: number): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/stock/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting stock for product ${productId}:`, error);
      return { error: `Erro ao obter dados de estoque para o produto ${productId}.` };
    }
  }

  /**
   * Get summary of system metrics
   */
  public async getMetricsSummary(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${this.baseUrl}/metrics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      return { error: 'Erro ao obter resumo de métricas.' };
    }
  }

  /**
   * Register a stock movement (in or out)
   */
  public async registerMovement(
    productId: number, 
    quantity: number, 
    movementType: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/stock/movement`, {
        productId,
        quantity,
        movementType
      });
      return response.data;
    } catch (error) {
      console.error('Error registering movement:', error);
      return { error: 'Erro ao registrar movimentação de estoque.' };
    }
  }
} 