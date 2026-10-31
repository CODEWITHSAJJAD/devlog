import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

const auditFields = {
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  createdBy: text('created_by'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedBy: text('_updated_by'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
};

export const lookups = sqliteTable('lookups', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  code: text('code').notNull(),
  label: text('label').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...auditFields,
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  ...auditFields,
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  statusId: text('status_id').notNull().references(() => lookups.id),
  priorityId: text('priority_id').notNull().references(() => lookups.id),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  ...auditFields,
});

export const sprints = sqliteTable('sprints', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  version: text('version'),
  goal: text('goal'),
  status: text('status').default('PLANNED').notNull(), // 'ACTIVE' | 'PLANNED' | 'COMPLETED'
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  ...auditFields,
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sprintId: text('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
  version: text('version'),
  title: text('title').notNull(),
  description: text('description'),
  typeId: text('type_id').notNull().references(() => lookups.id),
  statusId: text('status_id').notNull().references(() => lookups.id),
  priorityId: text('priority_id').notNull().references(() => lookups.id),
  position: integer('position').default(0).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  ...auditFields,
});

export const learnings = sqliteTable('learnings', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  ...auditFields,
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  sprints: many(sprints),
  tasks: many(tasks),
  learnings: many(learnings),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  status: one(lookups, { fields: [projects.statusId], references: [lookups.id] }),
  priority: one(lookups, { fields: [projects.priorityId], references: [lookups.id] }),
  tasks: many(tasks),
  sprints: many(sprints),
}));

export const sprintsRelations = relations(sprints, ({ one, many }) => ({
  project: one(projects, { fields: [sprints.projectId], references: [projects.id] }),
  user: one(users, { fields: [sprints.userId], references: [users.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  sprint: one(sprints, { fields: [tasks.sprintId], references: [sprints.id] }),
  type: one(lookups, { fields: [tasks.typeId], references: [lookups.id] }),
  status: one(lookups, { fields: [tasks.statusId], references: [lookups.id] }),
  priority: one(lookups, { fields: [tasks.priorityId], references: [lookups.id] }),
  learnings: many(learnings),
}));

export const learningsRelations = relations(learnings, ({ one }) => ({
  task: one(tasks, { fields: [learnings.taskId], references: [tasks.id] }),
  user: one(users, { fields: [learnings.userId], references: [users.id] }),
}));
