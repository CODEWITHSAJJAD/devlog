import { eq, and, asc } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { sprints, projects, tasks } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { request, env, data } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!projectId) {
    return new Response(JSON.stringify({ success: false, error: 'Project ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);

    // Validate project ownership
    const validProject = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .get();

    if (!validProject) {
      return new Response(JSON.stringify({ success: false, error: 'Project not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sprintList = await db
      .select()
      .from(sprints)
      .where(and(eq(sprints.projectId, projectId), eq(sprints.userId, data.userId), eq(sprints.isActive, true)))
      .orderBy(asc(sprints.createdAt))
      .all();

    return new Response(JSON.stringify({ success: true, data: sprintList }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch sprints' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { request, env, data } = context;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      projectId?: string;
      name?: string;
      version?: string;
      goal?: string;
      status?: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
      startDate?: number;
      endDate?: number;
    };

    if (!body.projectId || !body.name || !body.name.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Project ID and sprint name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(env.DB);

    // Verify project belongs to user and is active
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, body.projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .get();

    if (!project) {
      return new Response(JSON.stringify({ success: false, error: 'Project not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sprintId = crypto.randomUUID();
    const newSprint = {
      id: sprintId,
      projectId: body.projectId,
      userId: data.userId,
      name: body.name.trim(),
      version: body.version?.trim() || null,
      goal: body.goal?.trim() || null,
      status: body.status || 'PLANNED',
      startDate: normalizeToDate(body.startDate),
      endDate: normalizeToDate(body.endDate),
      createdBy: data.userId,
      updatedBy: data.userId,
      isActive: true,
    };

    await db.insert(sprints).values(newSprint);

    return new Response(JSON.stringify({ success: true, data: newSprint }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to create sprint' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
