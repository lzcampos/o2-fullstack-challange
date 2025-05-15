import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import CommandVisualizer from './CommandVisualizer';

// Message types that can be displayed in the chat
export enum MessageType {
  User = 'user',
  Agent = 'agent',
}

// Command types that can be recognized
export type CommandType = 'getSales' | 'createStockMovement' | 'UNKNOWN';

// Metadata for messages
export interface MessageMetadata {
  isError?: boolean;
  isGreeting?: boolean;
  commandType?: CommandType | string;
  commandDescription?: string;
  commandColor?: string;
  success?: boolean;
  originalQuery?: string;
  rawData?: any;
}

// Structure of a chat message
export interface Message {
  id: string;
  type: MessageType | string;
  text: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

// Props for the ChatBubble component
interface ChatBubbleProps {
  message: Message;
}

// Styled components for better appearance
const UserBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2, 2, 0, 2),
  maxWidth: '80%',
  marginLeft: 'auto',
  marginBottom: theme.spacing(1),
  wordBreak: 'break-word',
  '& a': {
    color: theme.palette.primary.contrastText,
    textDecoration: 'underline',
  },
}));

const AgentBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2, 2, 2, 0),
  maxWidth: '80%',
  marginRight: 'auto',
  marginBottom: theme.spacing(1),
  wordBreak: 'break-word',
  '& a': {
    color: theme.palette.primary.main,
  },
}));

// Function to format code blocks in messages
const formatMessageText = (text: string): JSX.Element[] => {
  // Split text by triple backticks (code blocks)
  const parts = text.split(/```([^`]+)```/);

  return parts.map((part, index) => {
    // Every odd index will be a code block
    if (index % 2 === 1) {
      return (
        <Box 
          key={index} 
          component="pre" 
          sx={{ 
            bgcolor: 'rgba(0, 0, 0, 0.04)', 
            p: 1, 
            borderRadius: 1, 
            overflowX: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            my: 1,
          }}
        >
          <code>{part}</code>
        </Box>
      );
    }

    // Split the text into lines and preserve line breaks
    const lines = part.split('\n');
    return (
      <React.Fragment key={index}>
        {lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  });
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { type, text, timestamp, metadata } = message;
  const isUser = type === MessageType.User || type === 'user';
  const isAgent = type === MessageType.Agent || type === 'agent';

  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine if we should show command visualizer
  const shouldShowVisualizer = 
    isAgent && 
    metadata?.commandType && 
    metadata?.rawData;

  // Extract the first part of the message for display
  // This will show the command header but not the detailed text that we'll visualize
  const getHeaderText = (text: string): string => {
    // For command responses, we'll just show the first line (command header)
    if (metadata?.commandType && !metadata.isGreeting) {
      const lines = text.split('</think>');
      if (lines.length > 0) {
        return lines[1];
      }
    }
    return text;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
      {isUser ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <UserBubble elevation={1}>
            <Typography variant="body1" component="div">
              {formatMessageText(text)}
            </Typography>
          </UserBubble>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <AgentBubble elevation={1}>
            {metadata?.commandType && !metadata.isGreeting && (
              <Box sx={{ mb: 1.5 }}>
                <Chip 
                  label={metadata.commandDescription || metadata.commandType}
                  size="small"
                  sx={{ 
                    bgcolor: metadata.commandColor || 'primary.main', 
                    color: 'white',
                    fontSize: '0.7rem',
                  }}
                />
                {metadata.success !== undefined && (
                  <Chip 
                    label={metadata.success ? 'Sucesso' : 'Erro'}
                    size="small"
                    color={metadata.success ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ ml: 0.5, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )}
            
            <Typography variant="body1" component="div">
              {metadata?.commandType && !metadata.isGreeting && !metadata.isError
                ? formatMessageText(getHeaderText(text))
                : formatMessageText(text)
              }
            </Typography>
            
            {shouldShowVisualizer && (
              <CommandVisualizer 
                commandType={metadata.commandType!} 
                data={metadata.rawData} 
              />
            )}
          </AgentBubble>
        </Box>
      )}
      
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 0.5, 
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          fontSize: '0.7rem',
        }}
      >
        {formattedTime}
      </Typography>
    </Box>
  );
};

export default ChatBubble; 