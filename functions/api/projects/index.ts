import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { projects } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { env, data } = context;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const userProjects = await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .orderBy(desc(projects.createdAt))
      .all();

    return new Response(JSON.stringify({ success: true, data: userProjects }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch projects' }), {
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
      title?: string;
      description?: string;
      statusId?: string;
      priorityId?: string;
      dueDate?: number;
    };

    if (!body.title || !body.title.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Project title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(env.DB);
    const projectId = crypto.randomUUID();
    const newProject = {
      id: projectId,
      userId: data.userId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      statusId: body.statusId || 'PROJ_STAT_NOT_STARTED',
      priorityId: body.priorityId || 'PRIO_MEDIUM',
      dueDate: normalizeToDate(body.dueDate),
      createdBy: data.userId,
      updatedBy: data.userId,
      isActive: true,
    };

    await db.insert(projects).values(newProject);

    return new Response(JSON.stringify({ success: true, data: newProject }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to create project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
