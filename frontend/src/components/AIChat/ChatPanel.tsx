import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Collapse,
  Fab,
  Tooltip,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MinimizeIcon from '@mui/icons-material/Minimize';
import ChatIcon from '@mui/icons-material/Chat';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BarChartIcon from '@mui/icons-material/BarChart';
import AIAgentService, { AgentExample } from '../../services/AIAgentService';
import ChatBubble, { Message } from './ChatBubble';
import { v4 as uuidv4 } from 'uuid';

// Command types that can be recognized
type CommandType = 'SALES' | 'POPULAR' | 'STOCK' | 'METRICS' | 'MOVEMENT' | 'UNKNOWN';

interface Command {
  type: CommandType;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const COMMANDS: Record<CommandType, Command> = {
  SALES: {
    type: 'SALES',
    description: 'Consulta de Vendas',
    icon: <BarChartIcon fontSize="small" />,
    color: '#1976d2',
  },
  POPULAR: {
    type: 'POPULAR',
    description: 'Produtos Populares',
    icon: <SearchIcon fontSize="small" />,
    color: '#9c27b0',
  },
  STOCK: {
    type: 'STOCK',
    description: 'Consulta de Estoque',
    icon: <SearchIcon fontSize="small" />,
    color: '#2e7d32',
  },
  METRICS: {
    type: 'METRICS',
    description: 'Resumo de Métricas',
    icon: <BarChartIcon fontSize="small" />,
    color: '#ed6c02',
  },
  MOVEMENT: {
    type: 'MOVEMENT',
    description: 'Registro de Movimento',
    icon: <PostAddIcon fontSize="small" />,
    color: '#0288d1',
  },
  UNKNOWN: {
    type: 'UNKNOWN',
    description: 'Comando Desconhecido',
    icon: <ErrorOutlineIcon fontSize="small" />,
    color: '#d32f2f',
  },
};

// Keywords for matching different command types
const COMMAND_KEYWORDS = {
  SALES: ['venda', 'vendas', 'valor total', 'faturamento'],
  POPULAR: ['popular', 'mais vendido', 'top produto'],
  STOCK: ['estoque', 'quantidade', 'inventário', 'produto'],
  METRICS: ['métrica', 'resumo', 'estatística', 'dados'],
  MOVEMENT: ['registrar', 'movimento', 'entrada', 'saída', 'adicionar', 'remover'],
};

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAgentAvailable, setIsAgentAvailable] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
  const [examples, setExamples] = useState<AgentExample[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting message
  useEffect(() => {
    const initialMessage: Message = {
      id: uuidv4(),
      type: 'agent',
      text: 'Olá! Sou o assistente de estoque. Como posso ajudar você hoje?',
      timestamp: new Date(),
      metadata: {
        isGreeting: true,
      }
    };

    setMessages([initialMessage]);
    checkAgentStatus();
    loadExamples();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAgentStatus = async () => {
    try {
      const isAvailable = await AIAgentService.checkHealth();
      setIsAgentAvailable(isAvailable);
      
      if (!isAvailable) {
        const errorMessage: Message = {
          id: uuidv4(),
          type: 'agent',
          text: 'Serviço do agente não está disponível no momento. Tente novamente mais tarde.',
          timestamp: new Date(),
          metadata: {
            isError: true,
          }
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      setIsAgentAvailable(false);
    }
  };

  const loadExamples = async () => {
    try {
      const examples = await AIAgentService.getExamples();
      setExamples(examples);
    } catch (error) {
      console.error('Error loading examples:', error);
    }
  };

  const identifyCommandType = (query: string): CommandType => {
    const queryLower = query.toLowerCase();
    
    // Check each command type's keywords
    for (const [type, keywords] of Object.entries(COMMAND_KEYWORDS)) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          return type as CommandType;
        }
      }
    }
    
    // If no specific command was identified, try to guess from context
    if (queryLower.includes('mostrar') || queryLower.includes('exibir') || queryLower.includes('consultar')) {
      if (queryLower.includes('produto')) return 'STOCK';
      if (queryLower.includes('vend')) return 'SALES';
    }
    
    return 'UNKNOWN';
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !isAgentAvailable) return;

    const commandType = identifyCommandType(inputText);
    const command = COMMANDS[commandType];

    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      console.log(`Sending query to agent: ${inputText}, detected command: ${commandType}`);
      const response = await AIAgentService.sendQuery(inputText);
      console.log('Received response:', response);
      
      let messageText = '';
      
      // Create the formatted text with a header showing the command executed
      messageText = `${getCommandHeader(commandType, !response.data.error)}`;
      
      // Add status message
      if (response.data.error) {
        messageText += `\n\n❌ ${response.data.error}`;
      } else {
        messageText += `\n\n✅ ${response.message || 'Comando processado com sucesso'}`;
      }
      
      // Prepare raw data for visualization
      let rawData = response.data;
      
      // For some API responses, the actual data might be nested inside a data property
      if (response.data && response.data.data && !response.data.error) {
        if (Array.isArray(response.data.data) || typeof response.data.data === 'object') {
          rawData = response.data.data;
        }
      }
      
      // For "Mostrar vendas" command, do additional data extraction if needed
      if (commandType === 'SALES') {
        console.log('Sales command response:', response);
        
        // If the response has sales-related properties at the top level, pass them directly
        if (response.data.total_sales !== undefined || 
            response.data.total !== undefined || 
            response.data.value !== undefined) {
          // Data is already correctly structured, no changes needed
        }
        // If the data is nested in a 'sales' property, extract it
        else if (response.data.sales) {
          rawData = response.data.sales;
        }
        // If the data is in a different format, try to extract what we need
        else {
          // Look for any property that might contain sales data
          for (const key in response.data) {
            if (key.includes('venda') || key.includes('sale') || key.includes('total')) {
              if (typeof response.data[key] === 'object' && response.data[key] !== null) {
                rawData = response.data[key];
                break;
              }
            }
          }
        }
      }
      
      // Add command metadata for intelligent formatting
      const metadata = {
        commandType,
        commandDescription: command.description,
        commandColor: command.color,
        success: !response.data.error,
        originalQuery: inputText,
        rawData: rawData,
      };
      
      // If there's specific data, add it to the message
      if (response.data && !response.data.error) {
        // For pure JSON responses, limit text output
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          messageText += '\n\n⚙️ Dados processados com sucesso.';
        } else {
          const formattedData = formatResponseData(response.data, commandType);
          if (formattedData) {
            messageText += '\n\n' + formattedData;
          }
        }
      }
      
      const agentMessage: Message = {
        id: uuidv4(),
        type: 'agent',
        text: messageText,
        timestamp: new Date(),
        metadata,
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending query:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'agent',
        text: 'Ocorreu um erro ao processar sua consulta. Tente novamente mais tarde.',
        timestamp: new Date(),
        metadata: {
          isError: true,
          commandType: 'UNKNOWN',
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCommandHeader = (commandType: CommandType, success: boolean): string => {
    const command = COMMANDS[commandType];
    
    switch (commandType) {
      case 'SALES':
        return '📊 Comando: Consulta de Vendas';
      case 'POPULAR':
        return '🔝 Comando: Produtos Populares';
      case 'STOCK':
        return '📦 Comando: Consulta de Estoque';
      case 'METRICS':
        return '📈 Comando: Resumo de Métricas';
      case 'MOVEMENT':
        return '✏️ Comando: Registro de Movimento';
      default:
        return '❓ Comando Desconhecido';
    }
  };

  const formatResponseData = (data: any, commandType: CommandType): string => {
    if (!data) return '';
    
    try {
      switch (commandType) {
        case 'SALES':
          return formatSalesData(data);
        case 'POPULAR':
          return formatPopularItemsData(data);
        case 'STOCK':
          return formatStockData(data);
        case 'METRICS':
          return formatMetricsData(data);
        case 'MOVEMENT':
          return formatMovementRegistrationData(data);
        default:
          // For unknown commands or raw JSON, return a simplified result
          return '⚙️ Dados recebidos. Visualize detalhes abaixo.';
      }
    } catch (e) {
      console.error('Error formatting response data:', e);
      return 'Os dados recebidos estão em formato não suportado.';
    }
  };
  
  const formatSalesData = (data: any): string => {
    let result = '';
    
    // If there's a filtered property (for specific product or category)
    if (data.filtered) {
      if (data.filtered.product_id) {
        result += `📋 Produto ID: ${data.filtered.product_id}\n`;
      }
      if (data.filtered.category) {
        result += `🏷️ Categoria: ${data.filtered.category}\n`;
      }
      result += `💰 Total de Vendas: R$ ${formatCurrency(data.filtered.total_sales)}\n`;
      result += `📊 Quantidade Vendida: ${data.filtered.total_quantity} unidades\n`;
    } else {
      // General sales data
      if (data.total_sales) {
        result += `💰 Total de Vendas: R$ ${formatCurrency(data.total_sales)}\n`;
      }
      if (data.total_quantity) {
        result += `📊 Quantidade Total Vendida: ${data.total_quantity} unidades\n`;
      }
    }
    
    // Add period information if available
    if (data.period) {
      result += `\n📅 Período: ${formatDate(data.period.start_date)} a ${formatDate(data.period.end_date)}\n`;
    }
    
    return result;
  };
  
  const formatPopularItemsData = (data: any): string => {
    // Handle when the data is wrapped in a "data" property
    const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : data);
    
    if (!Array.isArray(items)) {
      return '⚙️ Dados de produtos populares recebidos.';
    }
    
    let result = '🔝 Top Produtos:\n\n';
    
    items.slice(0, 5).forEach((item, index) => {
      const productName = item.product_name || item.name || `Produto ${item.product_id || item.id}`;
      const quantity = item.quantity_sold || item.total_movements || item.total_out || 0;
      
      result += `${index + 1}. ${productName}\n`;
      result += `   📊 Vendas: ${quantity} unidades\n`;
      
      if (item.revenue) {
        result += `   💰 Faturamento: R$ ${formatCurrency(item.revenue)}\n`;
      }
      
      if (index < Math.min(items.length, 5) - 1) {
        result += '\n';
      }
    });
    
    return result;
  };
  
  const formatStockData = (data: any): string => {
    if (!Array.isArray(data)) {
      if (data.total_items) {
        return `📦 Total de Itens em Estoque: ${data.total_items}\n💰 Valor Total: R$ ${formatCurrency(data.total_value)}`;
      }
      
      if (typeof data === 'object') {
        return '⚙️ Dados de estoque recebidos.';
      }
      
      return String(data);
    }
    
    let result = '📦 Estoque Atual:\n\n';
    
    // Limit to first 5 items for the message
    data.slice(0, 5).forEach((item, index) => {
      result += `${index + 1}. ${item.name || 'Produto ' + item.id}\n`;
      result += `   📊 Quantidade: ${item.quantity} unidades\n`;
      
      if (item.price) {
        result += `   🏷️ Preço Unitário: R$ ${formatCurrency(item.price)}\n`;
        result += `   💰 Valor em Estoque: R$ ${formatCurrency(item.price * item.quantity)}\n`;
      }
      
      if (index < Math.min(data.length, 5) - 1) {
        result += '\n';
      }
    });
    
    if (data.length > 5) {
      result += `\n... e mais ${data.length - 5} produtos`;
    }
    
    return result;
  };
  
  const formatMetricsData = (data: any): string => {
    let result = '';
    
    // Stock value summary
    if (data.stock_value) {
      result += `🏷️ Valor Total em Estoque: R$ ${formatCurrency(data.stock_value)}\n`;
    }
    
    // Sales summary
    if (data.total_sales) {
      result += `💰 Valor Total de Vendas: R$ ${formatCurrency(data.total_sales)}\n`;
    }
    
    // Total items sold
    if (data.items_sold) {
      result += `📊 Itens Vendidos: ${data.items_sold} unidades\n`;
    }
    
    // Total products in stock
    if (data.total_products) {
      result += `📦 Produtos Únicos em Estoque: ${data.total_products}\n`;
    }
    
    // Total items in stock
    if (data.total_items) {
      result += `🧮 Total de Itens em Estoque: ${data.total_items} unidades\n`;
    }
    
    // Add period information if available
    if (data.period) {
      result += `\n📅 Período: ${formatDate(data.period.start_date)} a ${formatDate(data.period.end_date)}\n`;
    }
    
    return result;
  };
  
  const formatMovementRegistrationData = (data: any): string => {
    let result = '';
    
    if (data.success) {
      result += '✅ Movimento registrado com sucesso!\n\n';
      
      if (data.data) {
        const movement = data.data;
        
        result += `🔄 Tipo: ${movement.movement_type === 'in' ? 'Entrada' : 'Saída'}\n`;
        result += `📋 Produto: ${movement.product_name || 'ID ' + movement.product_id}\n`;
        result += `📊 Quantidade: ${movement.quantity} unidades\n`;
        
        if (movement.date) {
          result += `📅 Data: ${formatDate(movement.date)}\n`;
        }
        
        if (movement.notes) {
          result += `📝 Observações: ${movement.notes}\n`;
        }
      }
    } else {
      result += '❌ Erro ao registrar movimento.\n';
      
      if (data.error) {
        result += `Mensagem: ${data.error}\n`;
      }
    }
    
    return result;
  };
  
  const formatGenericData = (data: any): string => {
    if (typeof data === 'string') return data;
    
    if (Array.isArray(data)) {
      if (data.length === 0) return 'Nenhum dado encontrado.';
      
      return '⚙️ Dados recebidos. Visualize detalhes abaixo.';
    }
    
    if (typeof data === 'object') {
      return '⚙️ Dados recebidos. Visualize detalhes abaixo.';
    }
    
    return String(data);
  };
  
  // Helper functions for formatting
  const formatCurrency = (value: number): string => {
    if (!value && value !== 0) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleExamples = () => {
    setShowExamples(!showExamples);
  };

  const applyExample = (example: string) => {
    setInputText(example);
    setShowExamples(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Chat panel when minimized
  if (!isExpanded) {
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title="Abrir Assistente de Estoque">
          <Fab 
            color="primary" 
            onClick={toggleExpand}
            aria-label="Chat com assistente"
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Paper
        elevation={3}
        sx={{
          width: 350,
          height: 450,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Assistente de Estoque</Typography>
          <Box>
            <IconButton color="inherit" size="small" onClick={toggleExamples}>
              <HelpOutlineIcon />
            </IconButton>
            <IconButton color="inherit" size="small" onClick={toggleExpand}>
              <MinimizeIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Examples Panel */}
        <Collapse in={showExamples}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Exemplos de comandos</Typography>
              <IconButton size="small" onClick={toggleExamples}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                sx={{ mb: 1, mr: 1, textTransform: 'none' }}
                onClick={() => applyExample(example.command)}
              >
                {example.command}
              </Button>
            ))}
          </Box>
        </Collapse>

        {/* Messages Area */}
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!isAgentAvailable && (
            <Paper
              sx={{
                p: 2,
                mt: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
              }}
            >
              <Typography variant="body2">
                O serviço do agente não está disponível. Por favor, tente novamente mais tarde.
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Digite sua pergunta..."
              size="small"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !isAgentAvailable}
              inputRef={inputRef}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading || !isAgentAvailable}
              sx={{ ml: 1 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatPanel; 