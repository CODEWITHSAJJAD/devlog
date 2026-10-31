const BASE_URL = 'https://devlog-dh7.pages.dev';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedAccount(name, email, password) {
  console.log(`\n========================================================`);
  console.log(`🚀 Seeding account: ${email} (${name})`);
  console.log(`========================================================`);

  // Try login first or register
  let authRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  let authData = await authRes.json();
  let cookieHeader = authRes.headers.get('set-cookie');

  if (!authData.success) {
    authRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    authData = await authRes.json();
    cookieHeader = authRes.headers.get('set-cookie');
  }

  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  console.log(`Authenticated as ${authData.data?.name || email} (Cookie acquired: ${!!cookie})`);

  const api = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        ...(options.headers || {}),
      },
    });
    return await res.json();
  };

  // 1. Projects
  console.log('1. Creating realistic projects...');
  const p1 = await api('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Cloudflare Edge Engine v2.0',
      description:
        'High-throughput edge computing engine with WebAssembly runtime isolation, D1 database persistence, and distributed cache invalidation.',
      statusId: 'PROJ_STAT_ACTIVE',
    }),
  });

  const p2 = await api('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Zero-Trust Auth & WebCrypto Suite',
      description:
        'Multi-tenant authentication layer with PBKDF2 password derivation, RS256 token rotation, and hardware security key integration.',
      statusId: 'PROJ_STAT_ACTIVE',
    }),
  });

  const p3 = await api('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Real-Time Metrics & Telemetry Aggregator',
      description:
        'Sub-millisecond histogram percentiles and Prometheus metrics exporter running directly at Cloudflare edge POPs.',
      statusId: 'PROJ_STAT_ACTIVE',
    }),
  });

  const p4 = await api('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'DevLog Mobile Web & Offline Sync',
      description:
        'Apple HIG-inspired mobile workspace with optimistic UI state transitions and background synchronization.',
      statusId: 'PROJ_STAT_COMPLETED',
    }),
  });

  const flagshipProjectId = p1.data?.id;
  console.log(`Flagship Project Created: ${p1.data?.title} [ID: ${flagshipProjectId}]`);

  if (!flagshipProjectId) {
    throw new Error('Failed to create flagship project');
  }

  // 2. Sprints & Versions
  console.log('2. Creating sprint versions & milestones...');
  const now = Math.floor(Date.now() / 1000);
  const tenDaysAgo = now - 10 * 86400;
  const inFourDays = now + 4 * 86400;
  const inFiveDays = now + 5 * 86400;
  const inNineteenDays = now + 19 * 86400;

  const s1 = await api('/api/sprints', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      name: 'Sprint 1 — Core Runtime & D1 Database',
      version: 'v1.0.0',
      goal: 'Deploy WebAssembly isolation, implement WebCrypto JWT rotation, and establish typed D1 database schemas with sub-10ms response latency.',
      status: 'ACTIVE',
      startDate: tenDaysAgo,
      endDate: inFourDays,
    }),
  });

  const s2 = await api('/api/sprints', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      name: 'Sprint 2 — Performance & Edge Cache Invalidation',
      version: 'v1.1.0',
      goal: 'Implement Cloudflare KV caching layer, automated cache purge hooks, and Prometheus metrics telemetry.',
      status: 'PLANNED',
      startDate: inFiveDays,
      endDate: inNineteenDays,
    }),
  });

  const s0 = await api('/api/sprints', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      name: 'Sprint 0 — Architecture PoC & Benchmarks',
      version: 'v0.9.0',
      goal: 'Proof-of-concept D1 connection pooling benchmarks and Drizzle ORM migration pipelines.',
      status: 'COMPLETED',
      startDate: now - 35 * 86400,
      endDate: now - 11 * 86400,
    }),
  });

  const sprint1Id = s1.data?.id;
  const sprint2Id = s2.data?.id;
  const sprint0Id = s0.data?.id;

  // 3. Tasks across all 6 Kanban Lanes
  console.log('3. Populating tasks across all 6 Kanban columns...');

  // DONE Column
  const t1 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Set up Cloudflare D1 Migrations & Drizzle ORM Schema',
      description: `### Objective
Deploy production database schema migrations supporting multi-tenant workspaces, sprint iterations, and ticket assignments.

### Acceptance Criteria
- [x] Create Drizzle migration file \`0001_jittery_shaman.sql\`
- [x] Apply migrations to Cloudflare D1 via \`wrangler d1 migrations apply\`
- [x] Establish typed foreign key relationships between \`sprints\` and \`tasks\`
- [x] Verify zero regression across lookup categories`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_DONE',
      priorityId: 'PRIO_HIGH',
      dueDate: now - 2 * 86400,
    }),
  });

  const t2 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Edge WebCrypto Password Hashing with PBKDF2',
      description: `### Objective
Enforce cryptographically secure password derivation compliant with Cloudflare Worker CPU execution limits.

### Acceptance Criteria
- [x] Implement PBKDF2 using SubtleCrypto with SHA-256
- [x] Calibrate iteration count to 100,000 within 50ms CPU envelope
- [x] Generate 16-byte cryptographically secure random salt per user
- [x] Timing-safe string comparison to prevent timing attacks`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_DONE',
      priorityId: 'PRIO_CRITICAL',
      dueDate: now - 1 * 86400,
    }),
  });

  const t3 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint0Id,
      version: 'v0.9.0',
      title: 'D1 Prepared Statement Connection Pooling Benchmark',
      description: `### Scope
Benchmark SQLite query throughput on D1 remote edges under 500 concurrent connections. Verified p95 latency under 8.4ms.`,
      typeId: 'TASK_TYPE_RD',
      statusId: 'TASK_STAT_DONE',
      priorityId: 'PRIO_MEDIUM',
      dueDate: now - 15 * 86400,
    }),
  });

  // TESTING Column
  const t4 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Implement WebCrypto JWT Authentication & Rotation',
      description: `### Architectural Goal
Provide stateless, cryptographically signed authentication tokens across globally distributed edge nodes.

### Acceptance Criteria & Technical Spec
- [x] Implement token verification using \`jose\` library
- [x] Store private keys securely in Cloudflare Environment Secrets
- [x] Cache decoded JWKS public keys in Edge Memory for 1 hour
- [ ] Handle token expiration with automated silent refresh
- [ ] End-to-end integration test with auth cookies (HttpOnly, Secure, SameSite=Lax)`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_TESTING',
      priorityId: 'PRIO_CRITICAL',
      dueDate: now + 2 * 86400,
    }),
  });

  const t5 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Mobile Viewport Swiping & Adaptive Modal Bounds',
      description: `### Specifications
- [x] Add touch-pan-x gesture support for Kanban column horizontal swiping
- [x] Ensure modal maxHeight dynamically respects 100dvh on mobile Safari
- [x] Wrap long descriptions and learnings in dedicated scrollable views`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_TESTING',
      priorityId: 'PRIO_HIGH',
      dueDate: now + 1 * 86400,
    }),
  });

  // IN PROGRESS Column
  const t6 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Jira-Style Backlog & Sprint Version Management',
      description: `### Features
- [x] Apple-style segmented tabs \`[ Board ]\` vs \`[ Backlog ]\`
- [x] Collapsible sprint containers (Active, Planned, Completed)
- [x] Product Backlog container for unassigned tickets
- [x] Drag & drop ticket re-assignment between sprint buckets
- [x] Dedicated modal for sprint milestones, goals, and semantic versions`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_IN_PROGRESS',
      priorityId: 'PRIO_HIGH',
      dueDate: now + 3 * 86400,
    }),
  });

  const t7 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Fix D1 Prepared Statement JSON Serialization in Worker',
      description: `### Repro & Root Cause
D1 driver was intermittently receiving raw stringified JSON arrays instead of parsed objects when querying composite fields.

### Resolution
Add robust deserialization guard in \`getDb()\` utility wrapper.`,
      typeId: 'TASK_TYPE_BUG',
      statusId: 'TASK_STAT_IN_PROGRESS',
      priorityId: 'PRIO_HIGH',
      dueDate: now + 1 * 86400,
    }),
  });

  // BLOCKED Column
  const t8 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint1Id,
      version: 'v1.0.0',
      title: 'Cloudflare Custom Domain SSL Certificate Provisioning',
      description: `### Blocker Summary
Awaiting DNS CAA record verification from corporate nameserver before enabling universal SSL edge certificates.`,
      typeId: 'TASK_TYPE_BUG',
      statusId: 'TASK_STAT_BLOCKED',
      priorityId: 'PRIO_HIGH',
      dueDate: now + 4 * 86400,
    }),
  });

  // TO DO Column
  const t9 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint2Id,
      version: 'v1.1.0',
      title: 'Edge KV Cache Invalidation on Project Mutation',
      description: `### Requirements
- Hook into project PUT/DELETE handlers
- Purge tagged cache entries across Cloudflare CDN edge nodes
- Ensure read-after-write consistency for active browser sessions`,
      typeId: 'TASK_TYPE_RD',
      statusId: 'TASK_STAT_TODO',
      priorityId: 'PRIO_MEDIUM',
      dueDate: now + 7 * 86400,
    }),
  });

  const t10 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint2Id,
      version: 'v1.1.0',
      title: 'Telemetry Metric Aggregator for API Response Times',
      description: `### Scope
Emit p50, p95, and p99 response time metrics to Cloudflare Analytics Engine on every API invocation.`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_TODO',
      priorityId: 'PRIO_MEDIUM',
      dueDate: now + 10 * 86400,
    }),
  });

  const t11 = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      sprintId: sprint2Id,
      version: 'v1.1.0',
      title: 'Rate Limiting Middleware with Leaky Bucket Algorithm',
      description: `Enforce 120 req/min per IP address using Cloudflare KV counter windows with sliding rate limits.`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_TODO',
      priorityId: 'PRIO_HIGH',
      dueDate: now + 12 * 86400,
    }),
  });

  // PRODUCT BACKLOG (Unassigned)
  await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      title: 'Webhook Dispatcher for GitHub Commit & PR Synchronization',
      description: `Automatically link commits matching pattern \`DVL-[0-9]+\` to task activity stream.`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_BACKLOG',
      priorityId: 'PRIO_LOW',
    }),
  });

  await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      title: 'Dark Mode Optical Contrast Enhancements for OLED',
      description: `Refine 1px hairline border luminosity tokens for OLED displays according to DESIGN.md.`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_BACKLOG',
      priorityId: 'PRIO_LOW',
    }),
  });

  await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      title: 'GraphQL Subscriptions for Live Multiplayer Board Updates',
      description: `Evaluate Cloudflare Durable Objects + WebSockets for real-time multiplayer board synchronization.`,
      typeId: 'TASK_TYPE_RD',
      statusId: 'TASK_STAT_BACKLOG',
      priorityId: 'PRIO_LOW',
    }),
  });

  await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      title: 'Automated Weekly Release Notes Generator via Edge LLM',
      description: `Synthesize closed sprint tickets and technical learnings into a customer-facing Markdown changelog.`,
      typeId: 'TASK_TYPE_FEATURE',
      statusId: 'TASK_STAT_BACKLOG',
      priorityId: 'PRIO_LOW',
    }),
  });

  // 4. Complete Knowledge Base (Technical Learnings)
  console.log('4. Seeding complete Knowledge Base with architectural decisions & code snippets...');
  const t4Id = t4.data?.id;
  const t7Id = t7.data?.id;
  const t2Id = t2.data?.id;
  const t3Id = t3.data?.id;
  const t5Id = t5.data?.id;

  await api('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      taskId: t4Id,
      title: 'Edge JWT Signature Verification Overhead & Caching',
      content: `### Problem
Importing RSA CryptoKey on every HTTP request added ~14ms latency on Cloudflare Workers.

### Solution & Architectural Decision
Import the CryptoKey once at module initialization and cache in edge memory:
\`\`\`typescript
const cachedCryptoKey = await crypto.subtle.importKey(
  'jwk',
  publicKeyJwk,
  { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  false,
  ['verify']
);
\`\`\`

### Benchmark & Impact
Reduced per-request auth verification latency from **18.2ms to 1.4ms** (92% latency reduction). Zero dependency on external Node.js crypto modules.`,
      tags: ['edge', 'webcrypto', 'security', 'cloudflare', 'performance'],
    }),
  });

  await api('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      taskId: t7Id,
      title: 'Cloudflare D1 JSON Serialization Handling with Drizzle ORM',
      content: `### Architectural Decision
SQLite D1 does not have native JSON column types; Drizzle ORM stores array objects as serialized text strings.

### Key Takeaway
Always provide a fallback parser guard when deserializing tags and metadata arrays:
\`\`\`typescript
export const safeJsonParse = <T>(val: unknown, fallback: T): T => {
  if (typeof val !== 'string') return (val as T) ?? fallback;
  try { return JSON.parse(val); } catch { return fallback; }
};
\`\`\`
Ensures safe deserialization even if external drivers return pre-parsed objects.`,
      tags: ['d1', 'drizzle', 'sqlite', 'database', 'typescript'],
    }),
  });

  await api('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      taskId: t2Id,
      title: 'PBKDF2 Iteration Tuning for Worker CPU Bounds',
      content: `### Benchmark Context
Cloudflare Workers standard CPU execution time budget is 50ms. Running 200,000 iterations of PBKDF2 exceeded CPU budget on cold isolates.

### Calibration
Calibrated iterations to 100,000 using WebCrypto SubtleCrypto with SHA-256. CPU duration is now stable at **24ms**, providing cryptographic security while comfortably fitting within Worker resource limits.`,
      tags: ['crypto', 'security', 'performance', 'cloudflare'],
    }),
  });

  await api('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      taskId: t3Id,
      title: 'D1 Prepared Statement Latency vs Raw Query Execution',
      content: `### Architecture Strategy
Prepared statements (\`db.prepare(...).bind(...)\`) are pre-compiled and cached on Cloudflare edge nodes, reducing round-trip parsing overhead by **40%** compared to ad-hoc query strings.

Always utilize parameterized statements for both security and query plan reuse.`,
      tags: ['d1', 'database', 'benchmarks', 'sql'],
    }),
  });

  await api('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      taskId: t5Id,
      title: 'Atomic Optimistic UI State Transitions with React 19',
      content: `### Challenge
In high-frequency Kanban boards, waiting for remote server round-trips creates perceptible UI lag during drag-and-drop operations.

### Implementation Pattern
Apply optimistic state updates immediately to local React state:
\`\`\`typescript
setTasks((prev) => prev.map(t => t.id === taskId ? { ...t, statusId } : t));
const res = await apiFetch('/api/tasks/' + taskId, { method: 'PUT', body: ... });
if (!res.success) refetch(); // Rollback on failure
\`\`\`
Provides 0ms instant feedback while maintaining eventual consistency with the server.`,
      tags: ['frontend', 'react', 'ux', 'architecture'],
    }),
  });

  await api('/api/learnings', {
    method: 'POST',
    body: JSON.stringify({
      projectId: flagshipProjectId,
      title: 'Sub-Millisecond Edge Memory Invalidation Protocol',
      content: `### Architecture Overview
Leveraged Cloudflare Cache API for static assets and module-scope memory for fast lookup dictionaries. Global variables persist across requests on warm Worker isolates, achieving **0.4ms** lookup times without hitting remote database round-trips.`,
      tags: ['architecture', 'performance', 'cache', 'edge'],
    }),
  });

  console.log(`✅ Finished seeding account: ${email}`);
}

async function run() {
  // Seed founder account (Primary)
  await seedAccount('Alex Rivera (Staff Eng)', 'founder@devlog.io', 'DevLog2026!');
  
  // Seed demo account (Alternative)
  await seedAccount('Sarah Connor (Tech Lead)', 'demo@devlog.io', 'DevLog2026!');

  console.log('\n🎉 ALL PRODUCTION SHOWCASE ACCOUNTS SEEDED WITH COMPLETE DATA!');
}

run().catch(console.error);
