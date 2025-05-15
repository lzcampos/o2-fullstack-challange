import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
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
type CommandType = 'getSales' | 'createStockMovement' | 'UNKNOWN';

interface Command {
  type: CommandType;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const COMMANDS: Record<CommandType | string, Command> = {
  getSales: {
    type: 'getSales',
    description: 'Consulta de Vendas',
    icon: <BarChartIcon fontSize="small" />,
    color: '#1976d2',
  },
  createStockMovement: {
    type: 'createStockMovement',
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
  getSales: ['venda', 'vendas', 'valor total', 'faturamento', 'compra'],
  createStockMovement: ['registrar', 'movimento', 'entrada', 'saída', 'adicionar', 'remover', 'estoque']
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

const ChatPanel: FC = () => {
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
      if (queryLower.includes('venda') || queryLower.includes('valor')) return 'getSales';
    }
    
    return 'UNKNOWN';
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !isAgentAvailable) return;

    // Initial command type guess based on input text
    let commandType: CommandType = identifyCommandType(inputText);

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
      console.log(`Sending query to agent: ${inputText}, initial guess: ${commandType}`);
      const response = await AIAgentService.sendQuery(inputText);
      console.log('Received response:', response);
      
      // Use the actual action from the agent response if available
      if (response.action && COMMANDS[response.action]) {
        commandType = response.action as CommandType;
        console.log(`Updated command type from agent response: ${commandType}`);
      }
      
      const command = COMMANDS[commandType] || COMMANDS.UNKNOWN;
      
      // Process the response from the agent
      const messageText = response.message;
      
      // Determine if the operation was successful
      const isSuccess = !response.data.error;
      
      // Create formatted agent message
      const agentMessage: Message = {
        id: uuidv4(),
        type: 'agent',
        text: messageText,
        timestamp: new Date(),
        metadata: {
          commandType,
          commandDescription: command.description,
          commandColor: command.color,
          success: isSuccess,
          originalQuery: inputText,
          rawData: response.data,
        }
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error communicating with agent:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: 'agent',
        text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
        timestamp: new Date(),
        metadata: {
          isError: true,
          commandType
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
      case 'getSales':
        return '📊 Comando: Consulta de Vendas';
      case 'createStockMovement':
        return '✏️ Comando: Registro de Movimento';
      default:
        return '❓ Comando Desconhecido';
    }
  };

  const formatResponseData = (data: any, commandType: CommandType | string): string => {
    if (!data) return '';
    
    try {
      // Call the appropriate formatter based on command type
      switch (commandType) {
        case 'getSales':
          return formatSalesData(data);
        case 'createStockMovement':
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
    if (!data) return '';
    
    let result = '';
    
    // Check for total_in_value and total_out_value (our new format)
    if (data.total_in_value !== undefined) {
      result += `💰 Total de Entradas: R$ ${formatCurrency(data.total_in_value / 100)}\n`;
    }
    
    if (data.total_out_value !== undefined) {
      result += `💰 Total de Saídas: R$ ${formatCurrency(data.total_out_value / 100)}\n`;
    }
    
    if (data.total_in !== undefined) {
      result += `📊 Quantidade de Entradas: ${data.total_in} unidades\n`;
    }
    
    if (data.total_out !== undefined) {
      result += `📊 Quantidade de Saídas: ${data.total_out} unidades\n`;
    }
    
    // Add period information if available
    if (data.start_date || data.end_date) {
      result += '\n📅 Período: ';
      if (data.start_date) {
        result += formatDate(data.start_date);
      } else {
        result += 'início';
      }
      result += ' a ';
      if (data.end_date) {
        result += formatDate(data.end_date);
      } else {
        result += 'fim';
      }
      result += '\n';
    }
    
    // If the response is empty, add a message
    if (result === '') {
      result = 'Não foram encontrados dados para esta consulta.';
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
    if (!data) return '';
    
    let result = '';
    
    // Check if the movement was registered successfully
    if (data.id) {
      result += '✅ Movimento registrado com sucesso!\n\n';
      
      result += `🔄 Tipo: ${data.movement_type === 'in' ? 'Entrada' : 'Saída'}\n`;
      result += `📋 Produto ID: ${data.product_id}\n`;
      result += `📊 Quantidade: ${data.quantity} unidades\n`;
      
      if (data.created_at) {
        result += `📅 Data: ${formatDate(data.created_at)}\n`;
      }
      
      if (data.notes) {
        result += `📝 Observações: ${data.notes}\n`;
      }
    } else if (data.error) {
      result += `❌ Erro ao registrar movimento: ${data.error}\n`;
    } else {
      result += '❌ Não foi possível registrar o movimento.\n';
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