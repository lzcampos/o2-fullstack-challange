import { NLPService } from './NLPService';
import { StockService } from './StockService';

// Mock the StockService to avoid actual API calls during tests
jest.mock('./StockService');

describe('NLPService', () => {
  let nlpService: NLPService;
  let mockStockService: jest.Mocked<StockService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock StockService
    mockStockService = new StockService() as jest.Mocked<StockService>;
    
    // Setup mock implementations
    mockStockService.getTotalSales.mockResolvedValue({ total_sales: 1000 });
    mockStockService.getPopularItems.mockResolvedValue([{ id: 1, name: 'Test Product', quantity_sold: 50 }]);
    mockStockService.getCurrentStock.mockResolvedValue([{ id: 1, name: 'Test Product', quantity: 100 }]);
    mockStockService.getMetricsSummary.mockResolvedValue({ total_products: 10, total_stock_value: 5000 });
    mockStockService.registerMovement.mockResolvedValue({ success: true });
    
    // Initialize NLPService with mock StockService
    nlpService = new NLPService(mockStockService);
  });

  describe('Command recognition', () => {
    test('should recognize "get total sales" command', async () => {
      await nlpService.processQuery('Mostrar vendas totais');
      expect(mockStockService.getTotalSales).toHaveBeenCalled();
    });

    test('should recognize "get popular items" command', async () => {
      await nlpService.processQuery('Ver produtos mais populares');
      expect(mockStockService.getPopularItems).toHaveBeenCalled();
    });

    test('should recognize "get stock" command', async () => {
      await nlpService.processQuery('Mostrar estoque atual');
      expect(mockStockService.getCurrentStock).toHaveBeenCalled();
    });

    test('should recognize "get metrics" command', async () => {
      await nlpService.processQuery('Ver métricas');
      expect(mockStockService.getMetricsSummary).toHaveBeenCalled();
    });

    test('should recognize "register movement" command', async () => {
      await nlpService.processQuery('Registrar entrada de 10 unidades do produto 5');
      expect(mockStockService.registerMovement).toHaveBeenCalledWith(5, 10, 'in');
    });

    test('should handle unknown commands', async () => {
      const result = await nlpService.processQuery('Comando inexistente');
      expect(result).toHaveProperty('error');
    });
  });

  describe('Parameter extraction', () => {
    test('should extract date period from query', async () => {
      await nlpService.processQuery('Mostrar vendas totais do mês atual');
      
      // Check that the current month's start date was passed to getTotalSales
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const expectedStartDate = startOfMonth.toISOString().split('T')[0];
      
      expect(mockStockService.getTotalSales).toHaveBeenCalledWith(
        expect.stringContaining(expectedStartDate.substring(0, 7)), // Check just year-month part
        expect.any(String),
        undefined,
        undefined
      );
    });

    test('should extract product id from query', async () => {
      await nlpService.processQuery('Mostrar vendas totais do produto 5');
      expect(mockStockService.getTotalSales).toHaveBeenCalledWith(
        undefined,
        undefined,
        5,
        undefined
      );
    });

    test('should extract category from query', async () => {
      await nlpService.processQuery('Mostrar vendas da categoria Eletronicos');
      expect(mockStockService.getTotalSales).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        'Eletronicos'
      );
    });

    test('should extract quantity and movement type for register command', async () => {
      await nlpService.processQuery('Registrar saída de 15 unidades do produto 3');
      expect(mockStockService.registerMovement).toHaveBeenCalledWith(
        3,
        15,
        'out'
      );
    });
  });
}); 