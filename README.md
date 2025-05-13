# O2 Fullstack Challenge

Bem-vindo ao desafio de Fullstack da O2 Inc.! Estamos felizes por você estar interessado em se juntar à nossa equipe. Este repositório contém todas as instruções e requisitos necessários para a conclusão do desafio. 

## Sobre a O2 Inc.

Estamos construindo uma nova área de tecnologia e engenharia na O2 Inc., focada em criar uma cultura de desenvolvimento colaborativo. Nosso objetivo é formar um time de engenharia onde cada membro esteja dedicado a se desenvolver, trazer ideias inovadoras e ter a oportunidade de crescer profissionalmente. Valorizamos a criatividade, a inovação e o aprendizado contínuo.

## Sobre o Desafio

O objetivo deste desafio é desenvolver um sistema de gestão de estoque que permita o cadastro de produtos, registro de movimentações de estoque e geração de relatórios. Queremos avaliar suas habilidades em design de aplicação, qualidade do código, arquitetura e documentação.

## Tecnologias Requeridas

- **Front-end:** React
- **Back-end:** TypeScript, Python, Java ou a linguagem de sua preferência, desde que acompanhada de um README detalhado explicando o funcionamento da aplicação.
- **Banco de Dados:** Banco de dados relacional (MySQL, PostgreSQL, etc.)
- **Agente IA:** Um agente simples capaz de:
  - Consultar o total de vendas em um determinado período
  - Realizar cadastro de novas movimentações de estoque através de comandos em linguagem natural

## Visualização de Dados

O sistema deve incluir visualizações básicas dos dados de estoque, como:
- Gráfico de barras mostrando o valor total de vendas por período
- Resumo do valor total em estoque (R$)
- Quantidade total de itens vendidos
- Dashboard simples com os produtos mais movimentados

## Componentes da Solução

### Backend

O backend foi implementado em TypeScript usando Express e Knex para interagir com o banco de dados PostgreSQL. Para mais detalhes, consulte o [README do backend](./backend/README.md).

### Frontend

O frontend foi desenvolvido em React utilizando componentes modernos e responsivos. Para mais detalhes, consulte o [README do frontend](./frontend/README.md).

### Agente de IA

O Agente de IA foi implementado como um serviço separado que entende comandos em linguagem natural em português brasileiro. Ele permite:

- Consultar vendas totais com filtros por período, produto ou categoria
- Visualizar produtos mais populares
- Verificar o estoque atual
- Obter resumo de métricas
- Registrar movimentações de estoque

Para mais detalhes, consulte o [README do agente](./agent/README.md).

#### Exemplos de Comandos:

- "Mostrar vendas totais do mês atual"
- "Obter vendas totais do produto 5"
- "Ver produtos mais populares"
- "Mostrar estoque atual"
- "Registrar entrada de 10 unidades do produto 2"

## Processo de Submissão

1. Faça um fork deste repositório.
2. Implemente a solução conforme descrito no arquivo [DESAFIO.md](https://github.com/O2-Tech/o2-fullstack-challange/blob/main/DESAFIO.md).
3. Garanta que todas as dependências e instruções de configuração estejam claramente documentadas.
4. Envie o link do seu repositório forkado para avaliação.

## Dúvidas?

Se você tiver qualquer dúvida durante o processo de implementação, sinta-se à vontade para entrar em contato comigo através do [LinkedIn](https://www.linkedin.com/in/jgabrielfreitas/).

## Boa sorte!

Estamos ansiosos para ver seu trabalho e discutir seu potencial para se juntar à nossa equipe. 
Boa sorte!
