import { pathToFileURL } from 'node:url';

const DEFAULT_ORG = 'sfbrigade';
const DEFAULT_PROJECT_NUMBER = 13;
const DEFAULT_TIME_ZONE = 'America/Los_Angeles';
const API_VERSION = '2026-03-10';
const SPECIAL_TRIAGE_LABEL = 'needs triage';

export const STATUS_CATEGORIES = Object.freeze({
  Backlog: 'backlog',
  Todo: 'unstarted',
  Ready: 'unstarted',
  'In Progress': 'started',
  'In Review': 'started',
  Blocked: 'started',
  Done: 'completed',
  Canceled: 'canceled',
  Cancelled: 'canceled',
});

const ROLLOVER_CATEGORIES = new Set(['unstarted', 'started']);
const AUTO_ASSIGN_CATEGORIES = new Set(['started']);

export function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${date}`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function localDate(timeZone = DEFAULT_TIME_ZONE, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function classifyStatus(status, labels = []) {
  const normalized = new Set(labels.map((label) => String(label).toLowerCase()));
  if (normalized.has(SPECIAL_TRIAGE_LABEL)) return 'triage';
  const category = STATUS_CATEGORIES[status];
  if (!category) throw new Error(`Unknown Status option: ${JSON.stringify(status)}`);
  return category;
}

export function decideTransition({ issueState, status, labels = [], iterationRelation }) {
  if (issueState === 'closed') return { action: 'keep', reason: 'underlying-issue-closed' };

  const category = classifyStatus(status, labels);
  if (category === 'triage') return { action: 'keep', reason: 'triage' };
  if (category === 'completed') return { action: 'keep', reason: 'completed-history' };
  if (category === 'canceled') return { action: 'keep', reason: 'canceled' };
  if (category === 'backlog') return { action: 'keep', reason: 'backlog-does-not-roll' };
  if (iterationRelation === 'current') return { action: 'keep', reason: 'already-current' };
  if (iterationRelation === 'future') return { action: 'keep', reason: 'future-scheduling-preserved' };

  if (iterationRelation === 'past' && ROLLOVER_CATEGORIES.has(category)) {
    return { action: 'move-current', reason: 'expired-committed-work' };
  }
  if (iterationRelation === 'blank' && AUTO_ASSIGN_CATEGORIES.has(category)) {
    return { action: 'move-current', reason: 'started-work-must-be-current' };
  }
  return { action: 'keep', reason: 'no-rule' };
}

function parseArgs(argv) {
  const args = {
    org: process.env.PROJECT_ORG || DEFAULT_ORG,
    projectNumber: Number(process.env.PROJECT_NUMBER || DEFAULT_PROJECT_NUMBER),
    timeZone: process.env.PROJECT_TIME_ZONE || DEFAULT_TIME_ZONE,
    sourceIteration: process.env.SOURCE_ITERATION || null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--org') args.org = argv[++i];
    else if (arg === '--project-number') args.projectNumber = Number(argv[++i]);
    else if (arg === '--time-zone') args.timeZone = argv[++i];
    else if (arg === '--from-iteration') args.sourceIteration = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.org) throw new Error('Organization is required');
  if (!Number.isInteger(args.projectNumber) || args.projectNumber < 1) {
    throw new Error(`Invalid project number: ${args.projectNumber}`);
  }
  return args;
}

function headers() {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    'User-Agent': 'safehome-project-iteration-dry-run',
  };
}

async function githubGetJson(url) {
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub GET ${url} failed: ${response.status} ${body.slice(0, 1000)}`);
  }
  return { data: await response.json(), response };
}

function nextLink(link) {
  if (!link) return null;
  for (const part of link.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2] === 'next') return match[1];
  }
  return null;
}

async function getAllPages(initialUrl) {
  const rows = [];
  let url = initialUrl;
  while (url) {
    const { data, response } = await githubGetJson(url);
    if (!Array.isArray(data)) throw new Error(`Expected array from ${url}`);
    rows.push(...data);
    url = nextLink(response.headers.get('link'));
  }
  return rows;
}

function rawText(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  for (const candidate of [value.raw, value.name, value.title, value.text, value.html]) {
    const result = rawText(candidate);
    if (result != null) return result;
  }
  return null;
}

function scalarId(value, kind) {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value !== 'object') return null;
  const candidates = kind === 'iteration'
    ? [value.iteration_id, value.iterationId, value.iteration?.id, value.value?.id]
    : [value.option_id, value.optionId, value.option?.id, value.single_select_option?.id,
      value.singleSelectOption?.id, value.value?.id];
  for (const candidate of candidates) {
    const id = scalarId(candidate, kind);
    if (id != null) return id;
  }
  return null;
}

function findField(fields, name, dataType) {
  const matches = fields.filter((field) => field.name === name && (!dataType || field.data_type === dataType));
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${name} field (${dataType}); found ${matches.length}`);
  }
  return matches[0];
}

function normalizeIterations(iterationField) {
  const configuration = iterationField.configuration;
  if (!configuration) throw new Error('Iteration field has no configuration');
  if (configuration.duration !== 14) {
    throw new Error(`Expected 14-day Iterations; field duration is ${configuration.duration}`);
  }
  return (configuration.iterations ?? []).map((iteration) => ({
    id: String(iteration.id),
    title: rawText(iteration.title) ?? String(iteration.id),
    startDate: iteration.start_date ?? iteration.startDate,
    duration: iteration.duration ?? configuration.duration,
  })).filter((iteration) => iteration.id && iteration.startDate);
}

export function resolveIterationState(iterations, today) {
  const current = iterations.find(
    (iteration) => iteration.startDate <= today && today < addDays(iteration.startDate, iteration.duration),
  );
  if (!current) throw new Error(`No current Iteration contains ${today}; refusing to guess`);
  const future = iterations.filter((iteration) => iteration.startDate > current.startDate);
  return { current, future };
}

function fieldValue(item, fieldId) {
  for (const container of [item.field_values, item.fieldValues, item.fields]) {
    if (!container) continue;
    if (Array.isArray(container)) {
      const found = container.find((value) => String(value.field_id ?? value.fieldId ?? value.field?.id ?? value.id) === String(fieldId));
      if (found) return found;
    } else if (typeof container === 'object') {
      const direct = container[fieldId] ?? container[String(fieldId)];
      if (direct !== undefined) return direct;
      const found = Object.values(container).find((value) =>
        value && typeof value === 'object'
        && String(value.field_id ?? value.fieldId ?? value.field?.id) === String(fieldId));
      if (found) return found;
    }
  }
  return null;
}

function statusName(item, statusField) {
  const field = fieldValue(item, statusField.id);
  const selected = field?.value ?? field?.option ?? field?.single_select_option ?? field?.singleSelectOption;
  const direct = rawText(selected?.name ?? selected?.title ?? selected?.text ?? selected);
  if (direct && direct !== statusField.name) return direct;
  const optionId = scalarId(field, 'option');
  const option = (statusField.options ?? []).find((entry) => String(entry.id) === String(optionId));
  return option ? rawText(option.name) : null;
}

function contentType(item) {
  return item.content_type ?? item.contentType ?? item.type ?? null;
}

function issueApiUrl(item) {
  const content = item.content ?? {};
  if (typeof content.url === 'string' && /\/repos\/[^/]+\/[^/]+\/issues\/\d+$/.test(content.url)) return content.url;
  const repositoryUrl = content.repository_url ?? content.repositoryUrl;
  if (repositoryUrl && content.number) return `${repositoryUrl}/issues/${content.number}`;
  if (typeof content.html_url === 'string') {
    const match = content.html_url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/);
    if (match) return `https://api.github.com/repos/${match[1]}/${match[2]}/issues/${match[3]}`;
  }
  return null;
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return labels.map((label) => typeof label === 'string' ? label : label?.name).filter(Boolean).map((label) => label.toLowerCase());
}

async function issueMetadata(item) {
  const content = item.content ?? {};
  if (content.state && Array.isArray(content.labels)) {
    return { state: content.state, labels: normalizeLabels(content.labels), number: content.number, title: content.title };
  }
  const url = issueApiUrl(item);
  if (!url) return { state: content.state ?? 'unknown', labels: [], number: content.number, title: content.title };
  const { data } = await githubGetJson(url);
  return { state: data.state, labels: normalizeLabels(data.labels), number: data.number, title: data.title };
}

function sourceTitle(selector) {
  if (!selector) return null;
  const text = String(selector).trim();
  return /^\d+$/.test(text) ? `Iteration ${text}` : text;
}

function itemQueryUrl(base, fieldIds, query) {
  const params = new URLSearchParams({ fields: fieldIds, per_page: '100', q: query });
  return `${base}/items?${params.toString()}`;
}

function printResult({ current, future, source, moves, keeps, warnings }) {
  console.log(`CURRENT: ${current.title} (${current.startDate} → ${addDays(current.startDate, current.duration)})`);
  console.log(`FUTURE ITERATIONS: ${future.length}`);
  if (source) console.log(`SOURCE: ${source}`);
  console.log('');
  if (warnings.length) {
    console.log('WARNINGS');
    warnings.forEach((warning) => console.log(`- ${warning}`));
    console.log('');
  }
  console.log('WOULD MOVE');
  if (!moves.length) console.log('(none)');
  moves.forEach((row) => console.log(`#${row.number ?? '?'}  ${row.status}  ${row.from} → ${current.title}  [${row.reason}]  ${row.title}`));
  console.log('');
  console.log('WOULD KEEP');
  if (!keeps.length) console.log('(none)');
  keeps.forEach((row) => console.log(`#${row.number ?? '?'}  ${row.status ?? '(no status)'}  ${row.from}  [${row.reason}]  ${row.title}`));
  console.log('');
  console.log(`SUMMARY move=${moves.length} keep=${keeps.length} warnings=${warnings.length}`);
}

async function classifyItems(items, { statusField, relation, from }) {
  const moves = [];
  const keeps = [];
  for (const item of items) {
    const type = contentType(item);
    if (type && String(type).toLowerCase() !== 'issue') continue;

    const status = statusName(item, statusField);
    const metadata = await issueMetadata(item);
    if (!status) {
      keeps.push({ number: metadata.number, title: metadata.title ?? '(untitled)', status: null, from, reason: 'missing-status' });
      continue;
    }

    const decision = decideTransition({
      issueState: metadata.state,
      status,
      labels: metadata.labels,
      iterationRelation: relation,
    });
    const row = {
      itemId: item.id,
      number: metadata.number,
      title: metadata.title ?? item.content?.title ?? '(untitled)',
      status,
      from,
      reason: decision.reason,
    };
    (decision.action === 'move-current' ? moves : keeps).push(row);
  }
  return { moves, keeps };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const today = localDate(args.timeZone);
  const base = `https://api.github.com/orgs/${encodeURIComponent(args.org)}/projectsV2/${args.projectNumber}`;

  const { data: fields } = await githubGetJson(`${base}/fields?per_page=100`);
  if (!Array.isArray(fields)) throw new Error('Project fields response was not an array');
  const statusField = findField(fields, 'Status', 'single_select');
  const iterationField = findField(fields, 'Iteration', 'iteration');
  const iterations = normalizeIterations(iterationField);
  const { current, future } = resolveIterationState(iterations, today);

  const warnings = [];
  if (future.length < 3) warnings.push(`Only ${future.length} future Iteration(s) configured; manually keep at least 3 available.`);

  const fieldIds = `${statusField.id},${iterationField.id}`;
  let moves = [];
  let keeps = [];
  let source = null;

  if (args.sourceIteration) {
    source = sourceTitle(args.sourceIteration);
    const items = await getAllPages(itemQueryUrl(base, fieldIds, `iteration:"${source}"`));
    ({ moves, keeps } = await classifyItems(items, { statusField, relation: 'past', from: source }));
  } else {
    const pastItems = await getAllPages(itemQueryUrl(base, fieldIds, 'iteration:<@current'));
    const blankItems = await getAllPages(itemQueryUrl(base, fieldIds, 'no:iteration'));
    const past = await classifyItems(pastItems, { statusField, relation: 'past', from: 'past Iteration' });
    const blank = await classifyItems(blankItems, { statusField, relation: 'blank', from: 'none' });
    moves = [...past.moves, ...blank.moves];
    keeps = [...past.keeps, ...blank.keeps];
  }

  printResult({ current, future, source, moves, keeps, warnings });
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error.stack ?? error.message ?? String(error));
    process.exitCode = 1;
  });
}
