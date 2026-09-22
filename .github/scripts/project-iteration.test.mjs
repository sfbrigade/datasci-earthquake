import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  classifyStatus,
  decideTransition,
  resolveIterationState,
} from './project-iteration.mjs';

test('classifies SafeHome statuses into Linear-like categories', () => {
  assert.equal(classifyStatus('Backlog'), 'backlog');
  assert.equal(classifyStatus('Todo'), 'unstarted');
  assert.equal(classifyStatus('In Progress'), 'started');
  assert.equal(classifyStatus('In Review'), 'started');
  assert.equal(classifyStatus('Blocked'), 'started');
  assert.equal(classifyStatus('Done'), 'completed');
  assert.equal(classifyStatus('Canceled'), 'canceled');
});

test('needs triage overrides the ordinary status category', () => {
  assert.equal(classifyStatus('Todo', ['needs triage']), 'triage');
});

test('unknown statuses fail closed', () => {
  assert.throws(() => classifyStatus('Mystery'), /Unknown Status option/);
});

test('rolls committed unstarted and started work from a past iteration', () => {
  for (const status of ['Todo', 'In Progress', 'In Review', 'Blocked']) {
    assert.deepEqual(
      decideTransition({ issueState: 'open', status, iterationRelation: 'past' }),
      { action: 'move-current', reason: 'expired-committed-work' },
    );
  }
});

test('does not roll backlog, triage, completed, canceled, or closed issues', () => {
  assert.equal(decideTransition({ issueState: 'open', status: 'Backlog', iterationRelation: 'past' }).action, 'keep');
  assert.equal(decideTransition({ issueState: 'open', status: 'Todo', labels: ['needs triage'], iterationRelation: 'past' }).action, 'keep');
  assert.equal(decideTransition({ issueState: 'open', status: 'Done', iterationRelation: 'past' }).action, 'keep');
  assert.equal(decideTransition({ issueState: 'open', status: 'Canceled', iterationRelation: 'past' }).action, 'keep');
  assert.equal(decideTransition({ issueState: 'closed', status: 'In Progress', iterationRelation: 'past' }).action, 'keep');
});

test('assigns only started blank work to current', () => {
  assert.equal(decideTransition({ issueState: 'open', status: 'In Progress', iterationRelation: 'blank' }).action, 'move-current');
  assert.equal(decideTransition({ issueState: 'open', status: 'In Review', iterationRelation: 'blank' }).action, 'move-current');
  assert.equal(decideTransition({ issueState: 'open', status: 'Blocked', iterationRelation: 'blank' }).action, 'move-current');
  assert.equal(decideTransition({ issueState: 'open', status: 'Todo', iterationRelation: 'blank' }).action, 'keep');
});

test('preserves current and future manual scheduling', () => {
  assert.equal(decideTransition({ issueState: 'open', status: 'In Progress', iterationRelation: 'current' }).action, 'keep');
  assert.equal(decideTransition({ issueState: 'open', status: 'Todo', iterationRelation: 'future' }).action, 'keep');
});

test('resolves current iteration from dates and fails if none exists', () => {
  const iterations = [
    { id: 'a', title: 'Iteration 33', startDate: '2026-08-06', duration: 14 },
    { id: 'b', title: 'Iteration 34', startDate: '2026-08-20', duration: 14 },
    { id: 'c', title: 'Iteration 35', startDate: '2026-09-03', duration: 14 },
  ];
  assert.equal(resolveIterationState(iterations, '2026-09-02').current.id, 'b');
  assert.equal(resolveIterationState(iterations, '2026-09-02').future.length, 1);
  assert.throws(() => resolveIterationState(iterations, '2026-10-01'), /No current Iteration/);
});

test('date math uses half-open iteration boundaries', () => {
  assert.equal(addDays('2026-08-20', 14), '2026-09-03');
});
