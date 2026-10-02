#!/usr/bin/env node
/**
 * reindex.cjs
 *
 * Regenera docs/adr/INDEX.md a partir dos arquivos ADR existentes em
 * `docs/adr/NNNN-slug.md`. Sem dependencias externas (Node puro).
 *
 * Vive dentro da skill `agent-spec-adr-reindex` (skill canonica do reindex). Outras
 * skills do dominio ADR (agent-spec-adr-create, agent-spec-adr-deprecate, agent-spec-adr-supersede,
 * agent-spec-adr-bootstrap) referenciam este script via path resolvido pela rule
 * `.claude/rules/agent-spec-adr-workflow-rules.md` (`adr.reindex_script`).
 *
 * Fluxo:
 *   1. Le `.claude/rules/agent-spec-adr-workflow-rules.md` e resolve
 *      `adr.dir` e `adr.index_file` (paths declarados como linhas
 *      `- **adr.dir**: \`/docs/adr\``).
 *   2. Lista `docs/adr/*.md` excluindo TEMPLATE.md / INDEX.md / README.md.
 *   3. Extrai frontmatter YAML (id, title, status, tags) e as primeiras
 *      linhas uteis de `## Context` e `## Decision`.
 *   4. Ordena por id crescente e gera tabela markdown.
 *   5. Substitui a tabela entre os marcadores
 *      `<!-- ADR-INDEX-START -->` e `<!-- ADR-INDEX-END -->` no INDEX.md,
 *      preservando qualquer texto fora dos marcadores.
 *   6. Atualiza a linha `Ultima atualizacao: ...`.
 *
 * Uso:
 *   node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs
 *
 * Saida: exit 0 em sucesso, exit 1 em qualquer erro com mensagem em stderr.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const RULE_PATH = path.join(
  PROJECT_ROOT,
  '.claude/rules/agent-spec-adr-workflow-rules.md'
);

const MARK_START = '<!-- ADR-INDEX-START -->';
const MARK_END = '<!-- ADR-INDEX-END -->';
const EXCLUDED_FILES = new Set(['TEMPLATE.md', 'INDEX.md', 'README.md']);

// ---------------------------------------------------------------------------
// Leitura da rule (sem dependencia externa)
// ---------------------------------------------------------------------------

/**
 * Extrai o valor de uma linha no formato:
 *   - **adr.dir**: `/docs/adr`
 *   - **adr.index_file**: `/docs/adr/INDEX.md`
 * em `agent-spec-adr-workflow-rules.md`.
 */
function ruleBulletValue(content, key) {
  const re = new RegExp(`^- \\*\\*${key}\\*\\*:\\s*\`([^\`]+)\``, 'm');
  const match = content.match(re);
  return match ? match[1] : null;
}

function readAdrConfig() {
  if (!fs.existsSync(RULE_PATH)) {
    throw new Error(`Rule nao encontrada: ${RULE_PATH}`);
  }
  const raw = fs.readFileSync(RULE_PATH, 'utf-8');
  const dir = ruleBulletValue(raw, 'adr\\.dir');
  const indexFile = ruleBulletValue(raw, 'adr\\.index_file');
  if (!dir || !indexFile) {
    throw new Error(
      "Nao foi possivel resolver adr.dir / adr.index_file na rule (esperado formato '- **adr.dir**: `/docs/adr`')"
    );
  }
  return { dir, indexFile };
}

// ---------------------------------------------------------------------------
// Frontmatter das ADRs
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const raw of match[1].split(/\r?\n/)) {
    const kv = raw.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    fm[key] = value;
  }
  return fm;
}

/**
 * Retorna a primeira linha util de uma secao `## Header`:
 * pula linhas vazias, comentarios HTML (`<!--` ate `-->`) e subcabecalhos.
 * Trunca em ~100 chars para manter o INDEX enxuto.
 */
function firstUsefulLine(content, sectionHeader) {
  const idx = content.indexOf(sectionHeader);
  if (idx < 0) return '';
  const rest = content.slice(idx + sectionHeader.length);
  const lines = rest.split(/\r?\n/);
  let inComment = false;
  for (const raw of lines) {
    let line = raw.trim();
    if (!line) continue;
    if (inComment) {
      if (line.includes('-->')) inComment = false;
      continue;
    }
    if (line.startsWith('<!--')) {
      if (!line.includes('-->')) inComment = true;
      continue;
    }
    if (line.startsWith('#')) break; // proxima secao
    if (line.startsWith('**')) continue; // subcabecalho tipo **Pros:**
    // Limpa markdown leve e trunca
    line = line.replace(/^[*\-_>]+\s*/, '').replace(/[*_`]/g, '').trim();
    if (!line) continue;
    return line.length > 100 ? `${line.slice(0, 97)}...` : line;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Geracao da tabela + escrita do INDEX.md
// ---------------------------------------------------------------------------

function escapePipes(value) {
  return String(value).replace(/\|/g, '\\|');
}

function buildTable(entries) {
  const header = '| ID | Titulo | Status | Tags | Problema (1-linha) | Decisao (1-linha) |';
  const sep = '|----|--------|--------|------|---------------------|--------------------|';
  if (entries.length === 0) {
    return `${header}\n${sep}\n| _(vazio)_ | — | — | — | — | — |`;
  }
  const rows = entries.map((e) =>
    `| ${e.id} | ${escapePipes(e.title)} | ${escapePipes(e.status)} | ${escapePipes(e.tags)} | ${escapePipes(e.problem)} | ${escapePipes(e.decision)} |`
  );
  return [header, sep, ...rows].join('\n');
}

function replaceBetweenMarkers(content, table) {
  const startIdx = content.indexOf(MARK_START);
  const endIdx = content.indexOf(MARK_END);
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) {
    throw new Error(
      `Marcadores ADR-INDEX-START/END nao encontrados ou fora de ordem no INDEX.md`
    );
  }
  const before = content.slice(0, startIdx + MARK_START.length);
  const after = content.slice(endIdx);
  return `${before}\n${table}\n${after}`;
}

function updateLastUpdated(content, entriesCount) {
  const today = new Date().toISOString().slice(0, 10);
  const label = `Ultima atualizacao: ${today} (${entriesCount} ADR${entriesCount === 1 ? '' : 's'})`;
  if (content.includes('Ultima atualizacao:')) {
    return content.replace(/Ultima atualizacao: [^\n]+/, label);
  }
  return content;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  let cfg;
  try {
    cfg = readAdrConfig();
  } catch (err) {
    console.error(`[agent-spec-adr-reindex] ${err.message}`);
    process.exit(1);
  }

  const adrDir = path.join(PROJECT_ROOT, cfg.dir.replace(/^\//, ''));
  const indexPath = path.join(PROJECT_ROOT, cfg.indexFile.replace(/^\//, ''));

  if (!fs.existsSync(adrDir)) {
    console.error(`[agent-spec-adr-reindex] Diretorio ADR nao encontrado: ${adrDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(indexPath)) {
    console.error(`[agent-spec-adr-reindex] INDEX.md nao encontrado: ${indexPath}`);
    process.exit(1);
  }

  const entries = [];
  const warnings = [];

  for (const file of fs.readdirSync(adrDir).sort()) {
    if (!file.endsWith('.md') || EXCLUDED_FILES.has(file)) continue;
    const full = path.join(adrDir, file);
    const content = fs.readFileSync(full, 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm || !fm.id) {
      warnings.push(`${file}: frontmatter invalido ou sem id — pulado`);
      continue;
    }
    const tags = Array.isArray(fm.tags) ? fm.tags.join(', ') : (fm.tags || '');
    const dup = entries.find((e) => e.id === String(fm.id));
    if (dup) {
      warnings.push(`${file}: id ${fm.id} duplicado (ja usado por outra ADR) — supersede/deprecate ficam ambiguos; renumere um dos arquivos`);
    }
    entries.push({
      id: String(fm.id),
      title: fm.title || '(sem titulo)',
      status: fm.status || 'accepted',
      tags,
      problem: firstUsefulLine(content, '## Context'),
      decision: firstUsefulLine(content, '## Decision'),
    });
  }

  entries.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));

  const table = buildTable(entries);
  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  indexContent = replaceBetweenMarkers(indexContent, table);
  indexContent = updateLastUpdated(indexContent, entries.length);

  fs.writeFileSync(indexPath, indexContent, 'utf-8');

  const summary = `[agent-spec-adr-reindex] INDEX.md atualizado — ${entries.length} ADR(s) listadas.`;
  console.log(summary);
  for (const w of warnings) console.warn(`[agent-spec-adr-reindex] AVISO: ${w}`);
}

main();
