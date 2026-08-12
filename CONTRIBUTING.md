# Como Contribuir# Como Contribuir



Obrigado pelo seu interesse em contribuir para o Processador de Estoque v4.1!Obrigado pelo seu interesse em contribuir para o Processador de Estoque v4.1!



## Começando### Começando



1. Faça um fork do repositório1. Faça um fork do repositório

2. Clone seu fork localmente2. Clone seu fork localmente

3. Crie uma branch para sua funcionalidade ou correção3. Crie uma branch para sua funcionalidade ou correção

4. Faça suas alterações4. Faça suas alterações

5. Teste completamente5. Teste completamente

6. Envie um pull request6. Envie um pull request



## Configuração de Desenvolvimento### Configuração de Desenvolvimento



```bash```bash

# Clone o repositório# Clone o repositório

git clone https://github.com/seuusuario/aquaflora-estoque.gitgit clone https://github.com/seuusuario/athos-to-woocommerce.git



# Navegue para o diretório do projeto# Navegue para o diretório do projeto

cd aquaflora-estoquecd athos-to-woocommerce



# Instale as dependências# Instale as dependências

npm installnpm install



# Copie o arquivo de configuração exemplo# Copie o arquivo de configuração exemplo

copy config.example.json config.jsoncp config.example.json config.json



# Execute o processador# Execute o processador

node processador-estoque-v4.1.jsnpm start

``````



## Estilo de Código### Estilo de Código



- Use nomes de variáveis e funções significativos- Use nomes de variáveis e funções significativos

- Siga a formatação de código existente- Siga a formatação de código existente

- Adicione comentários para lógica complexa- Adicione comentários para lógica complexa

- Mantenha as funções focadas e concisas- Mantenha as funções focadas e concisas

- Use recursos JavaScript ES6+ apropriadamente- Use recursos JavaScript ES6+ apropriadamente



## Adicionando Novas Marcas### Adicionando Novas Marcas



Para adicionar suporte para novas marcas:Para adicionar suporte para novas marcas:



1. Localize o objeto `marcasConhecidas` em `processador-estoque-v4.1.js`1. Localize o objeto `marcasConhecidas` em `processador-estoque-v4.js`

2. Adicione a marca com capitalização adequada:2. Adicione a marca com capitalização adequada:



```javascript```javascript

this.marcasConhecidas = {this.marcasConhecidas = {

  'nome da marca': 'Nome Da Marca',  'nome da marca': 'Nome Da Marca',

  'outra marca': 'Outra Marca',  'outra marca': 'Outra Marca',

  // ... marcas existentes (162 marcas)  // ... marcas existentes

};};

``````



3. Teste com dados de amostra3. Teste com dados de amostra

4. Atualize a documentação se necessário4. Atualize a documentação se necessário



## Estendendo Detecção de Peso### Estendendo Detecção de Peso



Para suportar formatos de peso adicionais:Para suportar formatos de peso adicionais:



1. Localize o método `extrairPeso()`1. Localize o método `extrairPeso()`

2. Adicione novo padrão regex ao array `padroes`2. Adicione novo padrão regex ao array `padroes`

3. Garanta conversão de unidade adequada para kg3. Garanta conversão de unidade adequada

4. Teste com vários nomes de produtos4. Teste com vários nomes de produtos



## Testes### Testes



Antes de enviar um pull request:Antes de enviar um pull request:



1. Teste com dados CSV de amostra1. Teste com dados CSV de amostra

2. Verifique o formato do CSV de saída2. Verifique o formato do CSV de saída

3. Confira a geração de metadados3. Confira a geração de metadados

4. Revise os arquivos de log4. Revise os arquivos de log

5. Garanta que não há degradação de performance5. Garanta que não há degradação de performance



## Documentação### Documentação



Ao adicionar novas funcionalidades:Ao adicionar novas funcionalidades:



1. Atualize README.md com instruções de uso1. Atualize README.md com instruções de uso

2. Adicione entrada no CHANGELOG.md2. Adicione entrada no CHANGELOG.md

3. Atualize comentários no código3. Atualize comentários no código

4. Inclua exemplos se aplicável4. Inclua exemplos se aplicável



## Processo de Pull Request### Processo de Pull Request



1. Atualize documentação para qualquer funcionalidade alterada1. Atualize documentação para qualquer funcionalidade alterada

2. Adicione testes se aplicável2. Adicione testes se aplicável

3. Garanta que todos os testes existentes passam3. Garanta que todos os testes existentes passam

4. Atualize CHANGELOG.md com suas alterações4. Atualize CHANGELOG.md com suas alterações

5. Solicite revisão dos mantenedores5. Solicite revisão dos mantenedores



## Mensagens de Commit### Diretrizes de Mensagem de Commit



Siga o padrão de mensagens de commit convencionais:Use mensagens de commit claras e descritivas:



``````

feat: Adiciona suporte para nova detecção de marcafeat: Adiciona suporte para nova detecção de marca

fix: Corrige extração de peso para unidades mlfix: Corrige extração de peso para unidades ml

docs: Atualiza instruções de instalaçãodocs: Atualiza instruções de instalação

perf: Otimiza performance de parsing CSVperf: Otimiza performance de parsing CSV

refactor: Simplifica lógica de formatação de categoriarefactor: Simplifica lógica de formatação de categoria

``````



## Nomenclatura de Branches### Nomenclatura de Branches



- `feature/` - Novas funcionalidades- `feature/` - Novas funcionalidades

- `fix/` - Correções de bugs- `fix/` - Correções de bugs

- `docs/` - Atualizações de documentação- `docs/` - Atualizações de documentação

- `perf/` - Melhorias de performance- `perf/` - Melhorias de performance

- `refactor/` - Refatoração de código- `refactor/` - Refatoração de código



## Reportando Problemas### Reportando Problemas



Ao reportar problemas, por favor inclua:Ao reportar problemas, por favor inclua:



1. Versão do Node.js (`node --version`)1. Versão do Node.js

2. Sistema operacional2. Sistema operacional

3. Passos para reproduzir3. Passos para reproduzir

4. Comportamento esperado4. Comportamento esperado

5. Comportamento atual5. Comportamento atual

6. Dados de amostra (se aplicável)6. Dados de amostra (se aplicável)

7. Mensagens de erro ou logs7. Mensagens de erro ou logs



## Solicitações de Funcionalidades### Solicitações de Funcionalidades



Aceitamos solicitações de funcionalidades. Por favor forneça:Aceitamos solicitações de funcionalidades. Por favor forneça:



1. Descrição clara da funcionalidade1. Descrição clara da funcionalidade

2. Caso de uso e benefícios2. Caso de uso e benefícios

3. Abordagem potencial de implementação3. Abordagem potencial de implementação

4. Quaisquer exemplos relevantes4. Quaisquer exemplos relevantes



## Revisão de Código### Revisão de Código



Todas as submissões requerem revisão. Procuramos:Todas as submissões requerem revisão. Nós procuramos:



- Responder a pull requests em até 48 horas- Responder a pull requests em até 48 horas

- Fornecer feedback construtivo- Fornecer feedback construtivo

- Manter padrões de qualidade de código- Manter padrões de qualidade de código

- Garantir compatibilidade retroativa- Garantir compatibilidade retroativa



## Perguntas### Perguntas



Para perguntas ou discussões:Para perguntas ou discussões:



- Abra uma issue para perguntas gerais- Abra uma issue para perguntas gerais

- Use comentários em pull requests para perguntas específicas de código- Use comentários em pull requests para perguntas específicas de código

- Entre em contato para assuntos sensíveis- Contate os mantenedores diretamente para assuntos sensíveis



## Licença### Licença



Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT.Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT.



## Reconhecimento### Reconhecimento



Contribuidores serão reconhecidos em:Contribuidores serão reconhecidos em:



- README.md do projeto- README.md do projeto

- Notas de lançamento (CHANGELOG.md)- Notas de lançamento

- Histórico de commits- Histórico de commits



---Obrigado por contribuir para tornar este projeto melhor!



**Obrigado por contribuir para tornar este projeto melhor!** 🎉---
