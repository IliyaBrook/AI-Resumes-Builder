import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TS_FILE_RE = /\.(ts|tsx|mts|cts)$/i;
const ESLINT_FILE_RE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/i;

function normalizeForOutput(value) {
  return value.replace(/\\/g, '/');
}

function samePath(a, b) {
  const left = path.resolve(a);
  const right = path.resolve(b);

  return process.platform === 'win32' ? left.toLowerCase() === right.toLowerCase() : left === right;
}

function getRepoRoot(input) {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    shell: false,
  });

  if (result.status === 0 && result.stdout.trim()) {
    return path.resolve(result.stdout.trim());
  }

  return path.resolve(input?.cwd ?? process.cwd());
}

function readCodexInput() {
  if (process.stdin.isTTY) {
    return null;
  }

  let raw = '';

  try {
    raw = readFileSync(0, 'utf8').trim();
  } catch {
    return null;
  }

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getCliFiles() {
  const index = process.argv.indexOf('--file');

  if (index === -1) {
    return [];
  }

  const files = [];

  for (let i = index + 1; i < process.argv.length; i += 1) {
    const value = process.argv[i];

    if (!value || value.startsWith('--')) {
      break;
    }

    files.push(value);
  }

  return files;
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, '');
}

function extractFilesFromCodexInput(input) {
  const files = new Set();
  const toolInput = input?.tool_input ?? {};

  for (const key of ['file_path', 'filePath', 'path']) {
    if (typeof toolInput[key] === 'string') {
      files.add(toolInput[key]);
    }
  }

  if (Array.isArray(toolInput.files)) {
    for (const file of toolInput.files) {
      if (typeof file === 'string') {
        files.add(file);
      }
    }
  }

  const command = typeof toolInput.command === 'string' ? toolInput.command : '';

  for (const line of command.split(/\r?\n/)) {
    let match = line.match(/^\*\*\* (?:Update|Add) File:\s+(.+)$/);

    if (match) {
      files.add(match[1].trim());
      continue;
    }

    match = line.match(/^\+\+\+ b\/(.+)$/);

    if (match && match[1] !== '/dev/null') {
      files.add(match[1].trim());
    }
  }

  return [...files];
}

function resolveFiles(root, rawFiles) {
  return [
    ...new Set(
      rawFiles
        .map(file => unquote(file.trim()))
        .filter(Boolean)
        .map(file => (path.isAbsolute(file) ? file : path.resolve(root, file)))
        .filter(file => existsSync(file))
        .filter(file => ESLINT_FILE_RE.test(file))
        .map(file => path.resolve(file))
    ),
  ];
}

function block(reason, additionalContext, hookEventName = 'PostToolUse') {
  console.log(
    JSON.stringify({
      decision: 'block',
      continue: false,
      stopReason: reason,
      reason,
      hookSpecificOutput: {
        hookEventName,
        additionalContext: additionalContext.slice(-20000),
      },
    })
  );
}

async function loadTypeScript() {
  try {
    const importedModule = await import('typescript');
    return importedModule.default ?? importedModule;
  } catch {
    return null;
  }
}

function findNearestTsconfig(startDir) {
  let dir = startDir;

  while (true) {
    const candidate = path.join(dir, 'tsconfig.json');

    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      return null;
    }

    dir = parent;
  }
}

function formatTsDiagnostic(ts, diagnostic, fallbackFile, root) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');

  if (diagnostic.file && diagnostic.start !== undefined) {
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const rel = normalizeForOutput(path.relative(root, diagnostic.file.fileName));

    return `${rel}:${position.line + 1}:${position.character + 1} - TS${diagnostic.code}: ${message}`;
  }

  const rel = normalizeForOutput(path.relative(root, fallbackFile));

  return `${rel} - TS${diagnostic.code}: ${message}`;
}

async function getTypeScriptDiagnostics(file, root) {
  if (!TS_FILE_RE.test(file)) {
    return [];
  }

  const ts = await loadTypeScript();

  if (!ts) {
    return ['TypeScript package was not found. Install it with: pnpm add -D typescript'];
  }

  const tsconfigPath = findNearestTsconfig(path.dirname(file));

  if (!tsconfigPath) {
    return [];
  }

  const projectRoot = path.dirname(tsconfigPath);
  const configFile = ts.readConfigFile(tsconfigPath, fileName => ts.sys.readFile(fileName));

  if (configFile.error) {
    return [formatTsDiagnostic(ts, configFile.error, file, root)];
  }

  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectRoot);

  if (parsedConfig.errors.length > 0) {
    return parsedConfig.errors.map(diagnostic => formatTsDiagnostic(ts, diagnostic, file, root));
  }

  const parsedFileNames = parsedConfig.fileNames.map(fileName => path.resolve(fileName));
  const fileInProject = parsedFileNames.some(fileName => samePath(fileName, file));

  const rootNames = fileInProject ? parsedFileNames : [...parsedFileNames, file];

  const program = ts.createProgram({
    rootNames,
    options: {
      ...parsedConfig.options,
      noEmit: true,
      skipLibCheck: true,
    },
  });

  const sourceFile = program.getSourceFiles().find(source => samePath(source.fileName, file));

  if (!sourceFile) {
    return [];
  }

  const diagnostics = [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)];

  return diagnostics.map(diagnostic => formatTsDiagnostic(ts, diagnostic, file, root));
}

async function getEslintDiagnostics(file, root) {
  if (!ESLINT_FILE_RE.test(file)) {
    return [];
  }

  let ESLint;

  try {
    const importedModule = await import('eslint');
    ESLint = importedModule.ESLint;
  } catch {
    return ['ESLint package was not found. Install it with: pnpm add -D eslint'];
  }

  try {
    const eslint = new ESLint({
      cwd: root,
    });

    const results = await eslint.lintFiles([file]);
    const diagnostics = [];

    for (const result of results) {
      const rel = normalizeForOutput(path.relative(root, result.filePath || file));

      for (const message of result.messages) {
        const severity = message.severity === 2 ? 'error' : 'warning';
        const rule = message.ruleId ? ` ${message.ruleId}` : '';
        const line = message.line ?? 1;
        const column = message.column ?? 1;

        diagnostics.push(`${rel}:${line}:${column} - ESLint ${severity}${rule}: ${message.message}`);
      }
    }

    return diagnostics;
  } catch (error) {
    const rel = normalizeForOutput(path.relative(root, file));

    return [`${rel} - ESLint failed: ${error instanceof Error ? error.message : String(error)}`];
  }
}

const cliFiles = getCliFiles();
const input = cliFiles.length > 0 ? null : readCodexInput();
const root = getRepoRoot(input);

process.chdir(root);

const rawFiles = cliFiles.length > 0 ? cliFiles : extractFilesFromCodexInput(input);

const files = resolveFiles(root, rawFiles);

if (files.length === 0) {
  process.exit(0);
}

const sections = [];

for (const file of files) {
  const rel = normalizeForOutput(path.relative(root, file));

  const tsDiagnostics = await getTypeScriptDiagnostics(file, root);
  const eslintDiagnostics = await getEslintDiagnostics(file, root);

  const diagnostics = [
    ...tsDiagnostics.map(message => `  ${message}`),
    ...eslintDiagnostics.map(message => `  ${message}`),
  ];

  if (diagnostics.length > 0) {
    sections.push([`File: ${rel}`, ...diagnostics].join('\n'));
  }
}

if (sections.length > 0) {
  const checkedFiles = files.map(file => `- ${normalizeForOutput(path.relative(root, file))}`).join('\n');

  block(
    'Edited file has TypeScript or ESLint diagnostics. Fix them before continuing.',
    [
      'Codex edited one or more files with TypeScript/ESLint diagnostics.',
      '',
      'Checked files:',
      checkedFiles,
      '',
      sections.join('\n\n'),
    ].join('\n'),
    input?.hook_event_name ?? 'PostToolUse'
  );
}
