import { pathToFileURL } from 'node:url';

const DEFAULT_ORG = 'sfbrigade';
const DEFAULT_PROJECT_NUMBER = 13;
const DEFAULT_TIME_ZONE = 'America/Los_Angeles';
const API_VERSION = '2026-03-10';

export const STATUS_CATEGORIES = Object.freeze({
  Backlog: 'backlog',
  Todo: 'unstarted',
  Ready: 'unstarted',
  'In Progress': 'started',
  'In Review': 'started',
  Done: 'completed',
  Canceled: 'canceled',
  Cancelled: 'canceled',
});

const ROLLOVER_CATEGORIES = new Set(['unstarted', 'started']);
const AUTO_ASSIGN_CATEGORIES = new Set(['started']);
const SPECIAL_TRIAGE_LABEL = 'needs triage';

function rawText(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  for (const candidate of [value.raw, value.name, value.title, value.text, value.html]) {
    const text = rawText(candidate);
    if (text != null) return text;
  }
  return null;
}

function scalarId(value, kind) {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value !== 'object') return null;
  const candidates = kind === 'iteration'
    ? [value.iteration_id, value.iterationId, value.iteration?.id, value.id, value.value]
    : [value.option_id, value.optionId, value.option?.id, value.single_select_option?.id, value.singleSelectOption?.id, value.id, value.value];
  for (const candidate of candidates) {
    const id = scalarId(candidate, kind);
    if (id != null) return id;
  }
  return null;
}

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
  const normalizedLabels = new Set(labels.map((label) => label.toLowerCase()));
  if (normalizedLabels.has(SPECIAL_TRIAGE_LABEL)) return 'triage';
  const category = STATUS_CATEGORIES[status];
  if (!category) throw new Error(`Unknown Status option: ${JSON.stringify(status)}`);
  return category;
}

export function decideTransition({
  issueState,
  status,
  labels = [],
  iterationRelation,
  sourceMatches = true,
}) {
  if (issueState === 'closed') return { action: 'keep', reason: 'underlying-issue-closed' };

  const category = classifyStatus(status, labels);
  if (category === 'triage') return { action: 'keep', reason: 'triage' };
  if (category === 'completed') return { action: 'keep', reason: 'completed-history' };
  if (category === 'canceled') return { action: 'keep', reason: 'canceled' };
  if (category === 'backlog') return { action: 'keep', reason: 'backlog-does-not-roll' };

  if (iterationRelation === 'future') return { action: 'keep', reason: 'future-scheduling-preserved' };
  if (iterationRelation === 'current') return { action: 'keep', reason: 'already-current' };

  if (iterationRelation === 'past' && sourceMatches && ROLLOVER_CATEGORIES.has(category)) {
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
    debug: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--org') args.org = argv[++i];
    else if (arg === '--project-number') args.projectNumber = Number(argv[++i]);
    else if (arg === '--time-zone') args.timeZone = argv[++i];
    else if (arg === '--from-iteration') args.sourceIteration = argv[++i];
    else if (arg === '--debug') args.debug = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.org) throw new Error('Organization is required');
  if (!Number.isInteger(args.projectNumber) || args.projectNumber < 1) {
    throw new Error(`Invalid project number: ${args.projectNumber}`);
  }
  return args;
}

function apiHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    'User-Agent': 'safehome-project-iteration-dry-run',
  };
}

async function githubGet(url) {
  const response = await fetch(url, { headers: apiHeaders() });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub GET ${url} failed: ${response.status} ${body.slice(0, 1000)}`);
  }
  return response;
}

async function githubGetJson(url) {
  const response = await githubGet(url);
  return { data: await response.json(), response };
}

function parseNextLink(link) {
  if (!link) return null;
  for (const part of link.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2] === 'next') return match[1];
  }
  return null;
}

async function getAllPages(initialUrl) {
  const all = [];
  let url = initialUrl;
  while (url) {
    const { data, response } = await githubGetJson(url);
    if (!Array.isArray(data)) {
      throw new Error(`Expected array from ${url}; got ${JSON.stringify(data).slice(0, 1500)}`);
    }
    all.push(...data);
    url = parseNextLink(response.headers.get('link'));
  }
  return all;
}

function findField(fields, name, dataType) {
  const matches = fields.filter(
    (field) => field.name === name && (!dataType || field.data_type === dataType),
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one ${name} field${dataType ? ` (${dataType})` : ''}; found ${matches.length}`,
    );
  }
  return matches[0];
}

function normalizeIterations(iterationField) {
  const configuration = iterationField.configuration;
  if (!configuration) throw new Error('Iteration field has no configuration');
  if (configuration.duration !== 14) {
    throw new Error(`Expected 14-day Iterations; field duration is ${configuration.duration}`);
  }

  const candidates = [
    ...(configuration.completed_iterations ?? []),
    ...(configuration.completedIterations ?? []),
    ...(configuration.iterations ?? []),
  ];
  const byId = new Map();
  for (const iteration of candidates) {
    const normalized = {
      id: String(iteration.id),
      title: rawText(iteration.title) ?? String(iteration.id),
      startDate: iteration.start_date ?? iteration.startDate,
      duration: iteration.duration ?? configuration.duration,
    };
    if (!normalized.id || !normalized.startDate || !normalized.title) continue;
    byId.set(normalized.id, normalized);
  }
  return [...byId.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function resolveIterationState(iterations, today) {
  const current = iterations.find(
    (iteration) => iteration.startDate <= today && today < addDays(iteration.startDate, iteration.duration),
  );
  if (!current) throw new Error(`No current Iteration contains ${today}; refusing to guess`);

  const future = iterations.filter((iteration) => iteration.startDate > current.startDate);
  return { current, future };
}

function matchesIterationSelector(iteration, selector) {
  if (!selector) return true;
  if (!iteration) return false;
  const wanted = String(selector).trim().toLowerCase();
  const title = String(iteration.title).toLowerCase();
  if (title === wanted) return true;
  if (title === `iteration ${wanted}`) return true;
  if (String(iteration.id).toLowerCase() === wanted) return true;
  return false;
}

function lookupFieldContainer(item, fieldId) {
  const containers = [item.field_values, item.fieldValues, item.fields];
  for (const container of containers) {
    if (!container) continue;
    if (Array.isArray(container)) {
      const match = container.find((value) => {
        const candidate = value.field_id ?? value.fieldId ?? value.field?.id ?? value.id;
        return String(candidate) === String(fieldId);
      });
      if (match) return match;
    } else if (typeof container === 'object') {
      const direct = container[fieldId] ?? container[String(fieldId)];
      if (direct !== undefined) return direct;
      const match = Object.values(container).find((value) => {
        if (!value || typeof value !== 'object') return false;
        const candidate = value.field_id ?? value.fieldId ?? value.field?.id;
        return String(candidate) === String(fieldId);
      });
      if (match) return match;
    }
  }
  return null;
}

function iterationIdFromValue(value) {
  return scalarId(value, 'iteration');
}

function optionIdFromValue(value) {
  return scalarId(value, 'option');
}

function statusNameForItem(item, statusField) {
  const value = lookupFieldContainer(item, statusField.id);
  const directName = rawText(value?.name ?? value?.option?.name ?? value?.single_select_option?.name ?? value?.singleSelectOption?.name);
  if (directName) return directName;
  const optionId = optionIdFromValue(value);
  if (!optionId) return null;
  const option = (statusField.options ?? []).find((entry) => String(entry.id) === String(optionId));
  return option ? rawText(option.name) : null;
}

function iterationForItem(item, iterationField, iterationById) {
  const value = lookupFieldContainer(item, iterationField.id);
  const iterationId = iterationIdFromValue(value);
  if (!iterationId) return null;
  const configured = iterationById.get(String(iterationId));
  if (configured) return configured;
  return {
    id: String(iterationId),
    title: rawText(value?.title ?? value?.iteration?.title) ?? String(iterationId),
    startDate: value?.start_date ?? value?.startDate ?? value?.iteration?.start_date ?? value?.iteration?.startDate,
    duration: value?.duration ?? value?.iteration?.duration ?? 14,
  };
}

function itemIssueApiUrl(item) {
  const content = item.content ?? {};
  if (typeof content.url === 'string' && /\/repos\/[^/]+\/[^/]+\/issues\/\d+$/.test(content.url)) {
    return content.url;
  }
  const repositoryUrl = content.repository_url ?? content.repositoryUrl;
  const number = content.number;
  if (repositoryUrl && number) return `${repositoryUrl}/issues/${number}`;
  if (typeof content.html_url === 'string') {
    const match = content.html_url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/);
    if (match) return `https://api.github.com/repos/${match[1]}/${match[2]}/issues/${match[3]}`;
  }
  return null;
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => (typeof label === 'string' ? label : label?.name))
    .filter(Boolean)
    .map((label) => label.toLowerCase());
}

async function issueMetadata(item) {
  const content = item.content ?? {};
  if (content.state && Array.isArray(content.labels)) {
    return { state: content.state, labels: normalizeLabels(content.labels), number: content.number, title: content.title };
  }
  const url = itemIssueApiUrl(item);
  if (!url) {
    return { state: content.state ?? 'unknown', labels: [], number: content.number, title: content.title };
  }
  const { data } = await githubGetJson(url);
  return { state: data.state, labels: normalizeLabels(data.labels), number: data.number, title: data.title };
}

function contentType(item) {
  return item.content_type ?? item.contentType ?? item.type ?? null;
}

function relationFor(iteration, current, today) {
  if (!iteration) return 'blank';
  if (iteration.id === current.id) return 'current';
  if (iteration.startDate && iteration.startDate > today) return 'future';
  if (iteration.startDate && addDays(iteration.startDate, iteration.duration ?? 14) <= today) return 'past';
  return 'unknown';
}

function titleForItem(item, metadata) {
  return metadata.title ?? item.content?.title ?? item.title ?? '(untitled)';
}

function printResult({ current, future, sourceIteration, moves, keeps, warnings }) {
  console.log(`CURRENT: ${current.title} (${current.startDate} → ${addDays(current.startDate, current.duration)})`);
  console.log(`FUTURE ITERATIONS: ${future.length}`);
  if (sourceIteration) console.log(`SOURCE FILTER: ${sourceIteration}`);
  console.log('');

  if (warnings.length) {
    console.log('WARNINGS');
    for (const warning of warnings) console.log(`- ${warning}`);
    console.log('');
  }

  console.log('WOULD MOVE');
  if (!moves.length) console.log('(none)');
  for (const row of moves) {
    console.log(`#${row.number ?? '?'}  ${row.status}  ${row.from} → ${current.title}  [${row.reason}]  ${row.title}`);
  }
  console.log('');

  console.log('WOULD KEEP');
  if (!keeps.length) console.log('(none)');
  for (const row of keeps) {
    console.log(`#${row.number ?? '?'}  ${row.status ?? '(no status)'}  ${row.from}  [${row.reason}]  ${row.title}`);
  }
  console.log('');
  console.log(`SUMMARY move=${moves.length} keep=${keeps.length} warnings=${warnings.length}`);
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
  const iterationById = new Map(iterations.map((iteration) => [iteration.id, iteration]));
  const { current, future } = resolveIterationState(iterations, today);

  const warnings = [];
  if (future.length < 3) {
    warnings.push(`Only ${future.length} future Iteration(s) configured; manually keep at least 3 available.`);
  }

  const fieldIds = `${statusField.id},${iterationField.id}`;
  const items = await getAllPages(`${base}/items?fields=${encodeURIComponent(fieldIds)}&per_page=100`);

  const moves = [];
  const keeps = [];
  let recognizedFieldShape = false;

  for (const item of items) {
    const type = contentType(item);
    if (type && String(type).toLowerCase() !== 'issue') continue;

    const status = statusNameForItem(item, statusField);
    const iteration = iterationForItem(item, iterationField, iterationById);
    if (lookupFieldContainer(item, statusField.id) || lookupFieldContainer(item, iterationField.id)) {
      recognizedFieldShape = true;
    }

    if (args.sourceIteration && !matchesIterationSelector(iteration, args.sourceIteration)) continue;
    if (!args.sourceIteration && !iteration && status && classifyStatus(status, []) !== 'started') continue;

    const metadata = await issueMetadata(item);
    const relation = relationFor(iteration, current, today);
    if (relation === 'unknown') {
      throw new Error(`Cannot classify Iteration relation for item ${item.id ?? item.node_id}`);
    }

    if (!status) {
      keeps.push({
        number: metadata.number,
        title: titleForItem(item, metadata),
        status: null,
        from: iteration?.title ?? 'none',
        reason: 'missing-status',
      });
      continue;
    }

    const decision = decideTransition({
      issueState: metadata.state,
      status,
      labels: metadata.labels,
      iterationRelation: relation,
      sourceMatches: true,
    });

    const row = {
      itemId: item.id,
      number: metadata.number,
      title: titleForItem(item, metadata),
      status,
      from: iteration?.title ?? 'none',
      reason: decision.reason,
    };
    if (decision.action === 'move-current') moves.push(row);
    else keeps.push(row);
  }

  if (!recognizedFieldShape && items.length) {
    const sample = JSON.stringify(items[0], null, 2).slice(0, 8000);
    throw new Error(`Unrecognized Project item field-value shape. Bounded sample:\n${sample}`);
  }

  printResult({ current, future, sourceIteration: args.sourceIteration, moves, keeps, warnings });
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error.stack ?? error.message ?? String(error));
    process.exitCode = 1;
  });
}
