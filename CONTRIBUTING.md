# Como contribuir

Use Node 22+, instale com npm ci e trabalhe em uma branch própria.
Configuração ativa e exportações reais não devem entrar no repositório.

Execute npm test e npm audit antes da PR. Os testes usam fixtures sintéticas em
pastas temporárias próprias e verificam o arquivo final e o comportamento da CLI.

Ao alterar mapeamento, marcas, números ou unidades, inclua uma regressão e documente
compatibilidade. Preserve SKU e exportações anteriores. A lista de marcas é heurística;
teste correspondências mais específicas antes das mais curtas. O atributo Marca não
equivale à taxonomia Brands.

Atualize README/CHANGELOG quando o contrato ou a execução mudar. Explique o comportamento
corrigido e a validação na descrição da PR. As contribuições seguem a licença MIT existente.
