# 🚀 Simulador Visual do Algoritmo de Tomasulo com Especulação

Um sistema interativo de aprendizado que demonstra visualmente como funciona o algoritmo de Tomasulo com predição de desvios e execução especulativa em processadores superescalares.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Execução](#instalação-e-execução)
- [Como Usar](#como-usar)
- [Conceitos Demonstrados](#conceitos-demonstrados)
- [Exemplos de Programas](#exemplos-de-programas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

Este simulador foi desenvolvido para facilitar o entendimento do algoritmo de Tomasulo, um dos conceitos fundamentais em arquitetura de computadores. O algoritmo resolve hazards de dados através de renomeação de registradores e permite execução fora de ordem, sendo essencial para o funcionamento de processadores modernos.

### Características Principais

- **Visualização em Tempo Real**: Acompanhe cada etapa do pipeline passo a passo
- **Predição de Desvios**: Demonstra diferentes estratégias de predição (always-taken, always-not-taken, 2-bit counter)
- **Execução Especulativa**: Mostra como instruções são executadas antes da resolução de branches
- **Recuperação de Mispredições**: Visualiza o processo de flush e recuperação quando predições falham
- **Interface Intuitiva**: Interface moderna e responsiva com controles interativos

## ✨ Funcionalidades

### 🎮 Controles de Simulação
- **Play/Pause**: Execução automática da simulação
- **Step**: Execução passo a passo
- **Back**: Voltar um passo na simulação
- **Reset**: Reiniciar a simulação
- **Controle de Velocidade**: Ajustar a velocidade de execução

### 📊 Componentes Visualizados
- **Fila de Instruções**: Status de cada instrução no pipeline
- **Estações de Reserva**: Renomeação de registradores e dependências
- **Unidades Funcionais**: Execução das operações
- **Status dos Registradores**: Valores e dependências atuais
- **Reorder Buffer**: Buffer de reordenação para commit
- **Preditor de Branches**: Estratégias e precisão de predição
- **Métricas de Performance**: IPC, ciclos, especulações, etc.

### ⚙️ Configurações do Processador
- **Issue Width**: Largura de emissão de instruções
- **Commit Width**: Largura de commit
- **Dispatch Width**: Largura de despacho
- **Tipo de Preditor**: Always-taken, Always-not-taken, 2-bit counter
- **Profundidade de Especulação**: Número máximo de branches não resolvidos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Linting**: ESLint
- **Package Manager**: npm

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd project-bolt-sb1-8pt67kfw
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto em modo de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**
   Abra seu navegador e acesse `http://localhost:5173`

### Scripts Disponíveis

```bash
npm run dev      # Executa em modo de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza o build de produção
npm run lint     # Executa o linter
```

## 📖 Como Usar

### 1. Iniciando uma Simulação
- O simulador carrega automaticamente com um programa de exemplo
- Use os controles na parte superior para controlar a execução
- A velocidade pode ser ajustada com o slider

### 2. Entendendo a Interface
- **Fila de Instruções**: Mostra todas as instruções e seus status
- **Estações de Reserva**: Visualiza a renomeação de registradores
- **Unidades Funcionais**: Acompanha a execução das operações
- **Status dos Registradores**: Mostra valores e dependências
- **Reorder Buffer**: Buffer para commit das instruções

### 3. Programas de Exemplo
O simulador inclui vários programas de exemplo:
- **Básico**: Demonstra operações simples
- **Hazards**: Mostra dependências de dados
- **Complexo**: Programa com múltiplas operações
- **Branches**: Demonstra predição de desvios
- **Especulação**: Mostra execução especulativa
- **Renomeação e Predição**: Demonstra renomeação com predição

### 4. Análise de Performance
Ao final da simulação, você pode ver:
- Número total de instruções
- Instruções especulativas
- Mispredições de branches
- Precisão do preditor
- IPC (Instructions Per Cycle)

## 🧠 Conceitos Demonstrados

### Pipeline Especulativo
```
Issue → Predição → Reservation Stations → Dispatch → 
Unidades Funcionais → Write Results → Resolução de Desvios → Commit/Flush
```

### Renomeação de Registradores
- Elimina hazards de dados (WAW, WAR)
- Permite execução fora de ordem
- Usa estações de reserva para renomeação

### Predição de Desvios
- **Always-taken**: Sempre prediz que o branch será tomado
- **Always-not-taken**: Sempre prediz que o branch não será tomado
- **2-bit counter**: Preditor baseado em histórico local

### Execução Especulativa
- Instruções são executadas antes da resolução do branch
- Buffer de reordenação mantém estado especulativo
- Recuperação automática em caso de mispredição

## 📝 Exemplos de Programas

### Programa Básico
```assembly
LD R1, 100    # Carrega valor da memória
LD R2, 104    # Carrega valor da memória
ADD R3, R1, R2 # Soma os valores
MUL R4, R3, R1 # Multiplica
ST R4, 108    # Armazena resultado
```

### Programa com Branches
```assembly
LD R1, 100
LD R2, 104
ADD R3, R1, R2
BEQ R1, R2, 7  # Branch se R1 == R2
MUL R4, R3, R1
SUB R5, R4, R2
ST R5, 108
ADD R6, R1, R3 # Alvo do branch
```

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── TomasuloSimulator.tsx    # Componente principal
│   ├── Controls.tsx             # Controles de simulação
│   ├── InstructionQueue.tsx     # Fila de instruções
│   ├── ReservationStations.tsx  # Estações de reserva
│   ├── FunctionalUnits.tsx      # Unidades funcionais
│   ├── RegisterStatus.tsx       # Status dos registradores
│   ├── ReorderBuffer.tsx        # Buffer de reordenação
│   ├── BranchPredictor.tsx      # Preditor de branches
│   ├── CodeEditor.tsx           # Editor de código
│   ├── PerformanceMetrics.tsx   # Métricas de performance
│   └── StickyControlsBar.tsx    # Barra de controles fixa
├── types/
│   └── tomasulo.ts              # Definições de tipos TypeScript
├── utils/
│   └── tomasuloEngine.ts        # Motor de simulação
├── data/
│   └── examples.ts              # Programas de exemplo
├── App.tsx                      # Componente raiz
└── main.tsx                     # Ponto de entrada
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Áreas para Melhoria
- Adicionar mais tipos de preditores de branches
- Implementar cache de instruções
- Adicionar visualização de pipeline mais detalhada
- Suporte a mais tipos de instruções
- Exportação de resultados da simulação

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Professor Henrique Cota
- Gabriel Rajão, Lucas Gualtieri, Luiza Dias, Pedro Alves 

---

**Desenvolvido com ❤️ para facilitar o aprendizado de arquitetura de computadores** 