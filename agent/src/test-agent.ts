import axios from 'axios';
import readline from 'readline';

const API_URL = 'http://localhost:3003/api/query';

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Send a query to the agent
 */
async function queryAgent(query: string) {
  try {
    console.log('\nEnviando consulta para o agente...');
    
    const response = await axios.post(API_URL, {
      query
    });
    
    console.log('\n=== Resposta do Agente ===');
    console.log(response.data.response);
    
    if (response.data.data) {
      console.log('\n=== Dados Detalhados ===');
      console.log(JSON.stringify(response.data.data, null, 2));
    }
    
    console.log('\n=== Ação Executada ===');
    console.log(response.data.action || 'Nenhuma ação específica');
    
    return response.data;
  } catch (error) {
    console.error('Erro ao consultar o agente:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Resposta de erro:', error.response.data);
    }
  }
}

/**
 * Run examples
 */
async function runExamples() {
  const examples = [
    'Mostrar vendas totais do mês atual',
    'Obter vendas totais do produto 1',
    'Registrar entrada de 10 unidades do produto 2',
    'Registrar saída de 5 unidades do produto 3'
  ];
  
  console.log('===== Exemplos de consultas =====');
  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example}`);
  });
  
  rl.question('\nDigite o número do exemplo ou sua própria consulta: ', async (answer) => {
    const exampleIndex = parseInt(answer, 10) - 1;
    
    // If valid example number was entered, use that example
    const query = examples[exampleIndex] || answer;
    
    await queryAgent(query);
    
    rl.question('\nDeseja fazer outra consulta? (s/n): ', (response) => {
      if (response.toLowerCase() === 's') {
        runExamples();
      } else {
        console.log('Encerrando teste do agente. Até mais!');
        rl.close();
      }
    });
  });
}

// Start the test
console.log('===== Teste do Agente de IA =====');
console.log('Este script permite testar o Agente de IA do sistema de gerenciamento de estoque');
console.log('Certifique-se de que o servidor do agente esteja rodando em http://localhost:3003\n');

runExamples(); 