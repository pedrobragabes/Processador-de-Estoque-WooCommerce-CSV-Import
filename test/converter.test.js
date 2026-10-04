const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const csv = require('csv-parser');

const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'processador-estoque-v4.1.js');
function fixture(t, overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csv-converter-'));
  const config = JSON.parse(fs.readFileSync(path.join(root, 'config.example.json'), 'utf8'));
  for (const [key, value] of Object.entries(overrides)) config[key] = { ...config[key], ...value };
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(config));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('csv-converter-'));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}
function evaluate(dir, expression) {
  const code = `const P=require(${JSON.stringify(entry)}); const p=new P(); console.log('RESULT:'+JSON.stringify(${expression}));`;
  const result = spawnSync(process.execPath, ['-e', code], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.split('RESULT:').at(-1));
}
function row(sku, title, stock = '2', price = '10,50', cost = '8,00', category = 'Pet') {
  return [`Departamento:${category}`, '', '', '', '', '', 'Valor Custo', sku, title, stock, '0', price, cost, '', ''];
}
function writeInput(dir, rows) {
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  fs.writeFileSync(path.join(dir, 'athos.csv'), '\ufeff' + rows.map((r) => r.map(escape).join(',')).join('\r\n'));
}
function run(dir, args = []) {
  return spawnSync(process.execPath, [entry, ...args], { cwd: dir, encoding: 'utf8' });
}
function files(dir) {
  return fs.readdirSync(dir, { recursive: true }).map((name) => path.join(dir, name)).filter((name) => fs.statSync(name).isFile());
}
async function readCsv(filename) {
  const items = [];
  for await (const row of fs.createReadStream(filename).pipe(csv())) items.push(row);
  return items;
}

test('SKU conserva letras, separadores e zeros iniciais', (t) => {
  const dir = fixture(t);
  assert.equal(evaluate(dir, `p.limparSKU('  AB-001/X  ')`), 'AB-001/X');
});
test('números brasileiros e decimais com ponto não multiplicam o preço', (t) => {
  const dir = fixture(t);
  assert.deepEqual(evaluate(dir, `['1.234,56','10.50','R$ 1.234,50','0','12,5'].map(x=>p.converterNumero(x))`), [1234.56, 10.5, 1234.5, 0, 12.5]);
});
test('valores inválidos não viram zero válido', (t) => {
  const dir = fixture(t);
  assert.deepEqual(evaluate(dir, `['12oops','Infinity','1,2,3','1e6',''].map(x=>Number.isNaN(p.converterNumero(x)))`), [true, true, true, true, true]);
});
test('massa converte g/kg; volume e quilômetros não viram peso', (t) => {
  const dir = fixture(t);
  assert.deepEqual(evaluate(dir, `['Ração 1,5kg','Alimento 500g','Shampoo 750ml','Água 2 litros','Caixa 2L','Cabo 10km'].map(x=>p.extrairPeso(x))`), ['1.500', '0.500', null, null, null, null]);
});
test('nomes preservam os acentos e as correções em português', (t) => {
  const dir = fixture(t);
  assert.equal(evaluate(dir, `p.formatarNomeProduto('RAÇÃO PARA CÃES SALMAO 1,5KG')`), 'Ração Para Cães Salmão 1,5Kg');
  assert.equal(evaluate(dir, `p.detectarMarca('Premier Pet Ração')`), 'Premier Pet');
});
test('conteúdo de origem é escapado na descrição e não inventa condições comerciais', (t) => {
  const dir = fixture(t);
  const html = evaluate(dir, `p.gerarDescricaoCompleta('Produto <script>teste</script>', '<img src=x onerror=alert(1)>', '10.50', null, null)`);
  assert.ok(html.includes('&lt;script&gt;teste&lt;/script&gt;'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('Preço promocional'));
  assert.ok(!html.includes('Entrega Rápida'));
});
test('excluir produtos sem estoque funciona com estoque mínimo zero', (t) => {
  const dir = fixture(t, { processamento: { incluirProdutosSemEstoque: false, estoqueMinimo: 0 } });
  assert.equal(evaluate(dir, `p.validarProduto({skuRaw:'001',descricaoRaw:'Produto sintético',estoqueRaw:'0',minimoRaw:'0',precoRaw:'10,50',custoRaw:'8,00'})`), false);
});
test('conversão completa preserva CSV multilinha, SKU, preço e conteúdo', async (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('AB-001', 'RAÇÃO "ROYAL CANIN"\nPARA CÃES 500G'), row('AB-002', 'SHAMPOO 750ML', '3', '10.50')]);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  const general = files(path.join(dir, 'saida_estoque')).find((p) => path.basename(p).startsWith('woocommerce_import_TODOS'));
  const items = await readCsv(general);
  assert.equal(items.length, 2);
  assert.equal(items[0].SKU, 'AB-001');
  assert.ok(items[0].Name.includes('Cães'));
  assert.equal(items[0]['Weight (kg)'], '0.500');
  assert.equal(items[1]['Weight (kg)'], '');
  assert.equal(items[1]['Attribute 2 name'], 'Conteúdo');
  assert.equal(items[1]['Attribute 2 value(s)'], '750 ml');
  assert.equal(items[1]['Regular price'], '10.50');
  assert.ok(items.every((item) => item.Published === '0'));
});
test('SKU duplicado interrompe conversão sem publicar CSV parcial', (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('AB-001', 'Produto um'), row('ab-001', 'Produto dois')]);
  const result = run(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SKU duplicado/i);
  assert.equal(files(dir).filter((p) => p.endsWith('.csv') && path.basename(p) !== 'athos.csv').length, 0);
});
test('arquivo sem contrato Athos reconhecido não produz exportação vazia', (t) => {
  const dir = fixture(t);
  writeInput(dir, [['SKU', 'Name'], ['001', 'Produto sintético']]);
  const result = run(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /formato|contrato|Athos/i);
});
test('erro de leitura é tratado e retorna código diferente de zero', (t) => {
  const dir = fixture(t);
  fs.mkdirSync(path.join(dir, 'athos.csv'));
  const result = run(dir);
  assert.notEqual(result.status, 0);
  assert.ok(!result.stderr.includes('Unhandled'));
});
test('nova execução preserva todos os CSVs e metadados anteriores', (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('001', 'Produto original')]);
  assert.equal(run(dir).status, 0);
  const snapshots = files(path.join(dir, 'saida_estoque')).filter((p) => p.endsWith('.csv') || path.basename(p) === 'metadata.json').map((p) => [p, fs.readFileSync(p)]);
  writeInput(dir, [row('002', 'Produto novo')]);
  assert.equal(run(dir).status, 0);
  for (const [filename, original] of snapshots) assert.deepEqual(fs.readFileSync(filename), original);
});
test('visualizador abre o log atual e um arquivo específico sem depender de campos ausentes', (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('001', 'Produto para log')]);
  assert.equal(run(dir).status, 0);
  for (const args of [[], ['arquivo', 'ultimo_processamento.json'], ['historico', '7']]) {
    const result = spawnSync(process.execPath, [path.join(root, 'visualizar-logs.js'), ...args], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(!/❌ Erro|TypeError|is not a function/.test(result.stderr + result.stdout));
  }
});

test('importar a biblioteca não exige config nem encerra o processo', (t) => {
  const dir = fixture(t);
  fs.unlinkSync(path.join(dir, 'config.json'));
  const result = spawnSync(process.execPath, ['-e', `const P=require(${JSON.stringify(entry)}); if(typeof P!=='function')process.exit(2);`], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
test('config antiga sem seção validacoes recebe padrões; caminhos seguem o arquivo de config', (t) => {
  const dir = fixture(t);
  const filename = path.join(dir, 'config.json');
  const config = JSON.parse(fs.readFileSync(filename));
  delete config.validacoes;
  fs.writeFileSync(filename, JSON.stringify(config));
  writeInput(dir, [row('001', 'Produto de configuração antiga')]);
  const result = spawnSync(process.execPath, [entry, '--config', filename], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'saida_estoque', 'ultimo_processamento.json')));
});
test('booleanos inválidos na configuração são recusados antes de exportar', (t) => {
  const dir = fixture(t, { woocommerce: { publicarAutomaticamente: 'false' } });
  writeInput(dir, [row('001', 'Produto sintético')]);
  const result = run(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /booleana/);
  assert.ok(!fs.existsSync(path.join(dir, 'saida_estoque')));
});
test('todos os preços inválidos são recusados sem produzir catálogo de preço zero', (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('001', 'Produto inválido', '2', 'indisponível'), row('002', 'Preço inválido', '2', 'Infinity')]);
  const result = run(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Nenhum produto válido/);
  assert.ok(!fs.existsSync(path.join(dir, 'saida_estoque')));
});
test('categorias que produzem o mesmo slug mantêm dois arquivos distintos', async (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('001', 'Produto categoria um', '2', '10,50', '8,00', 'A/B'), row('002', 'Produto categoria dois', '2', '10,50', '8,00', 'A B')]);
  assert.equal(run(dir).status, 0);
  const categoryFiles = files(path.join(dir, 'saida_estoque')).filter((p) => path.basename(p).startsWith('categoria_'));
  assert.equal(categoryFiles.length, 2);
  const items = (await Promise.all(categoryFiles.map(readCsv))).flat();
  assert.deepEqual(items.map((r) => r.SKU).sort(), ['001', '002']);
});
test('npm start aponta para o executável atual e conclui uma conversão isolada', (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('001', 'Produto via npm')]);
  const npmCli = process.env.npm_execpath || path.resolve(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (!fs.existsSync(npmCli)) { t.skip('npm não está junto deste runtime'); return; }
  const result = spawnSync(process.execPath, [npmCli, 'start', '--', '--config', path.join(dir, 'config.json')], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'saida_estoque', 'ultimo_processamento.json')));
});
test('visualizador sem histórico retorna vazio; acesso fora da saída é recusado', (t) => {
  const dir = fixture(t);
  const viewer = path.join(root, 'visualizar-logs.js');
  const empty = spawnSync(process.execPath, [viewer, 'historico', '7'], { cwd: dir, encoding: 'utf8' });
  assert.equal(empty.status, 0, empty.stderr);
  assert.match(empty.stdout, /0 execuções/);
  const outside = spawnSync(process.execPath, [viewer, 'arquivo', '../config.json'], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(outside.status, 0);
  assert.match(outside.stderr, /dentro da pasta de saída/);
});

test('falha no meio da geração não publica pasta parcial nem substitui o último log', (t) => {
  const dir = fixture(t);
  writeInput(dir, [row('001', 'Primeira exportação válida')]);
  assert.equal(run(dir).status, 0);
  const output = path.join(dir, 'saida_estoque');
  const index = path.join(output, 'ultimo_processamento.json');
  const previous = fs.readFileSync(index);
  const completed = fs.readdirSync(output).filter((name) => name.startsWith('execucao_'));
  writeInput(dir, [row('002', 'Nova exportação com falha simulada')]);
  const code = `const P=require(${JSON.stringify(entry)}); const p=new P(); p.gerarArquivosPorCategoria=async()=>{throw new Error('Falha sintética de escrita')};p.processar().catch(e=>{console.error(e.message);process.exitCode=1});`;
  const result = spawnSync(process.execPath, ['-e', code], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Falha sintética/);
  assert.deepEqual(fs.readFileSync(index), previous);
  assert.deepEqual(fs.readdirSync(output).filter((name) => name.startsWith('execucao_')), completed);
  assert.equal(fs.readdirSync(output).filter((name) => name.endsWith('.pendente')).length, 1);
});
