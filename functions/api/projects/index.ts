import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { projects, tasks } from '../../../db/schema';
import { getProjectCode } from '../../../shared/projectCode';
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

    // Fetch active tasks for user to calculate realistic progress metrics per project
    const userTasks = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        statusId: tasks.statusId,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, data.userId), eq(tasks.isActive, true)))
      .all();

    const projectsWithMetrics = userProjects.map((p) => {
      const pTasks = userTasks.filter((t) => t.projectId === p.id);
      const totalTasks = pTasks.length;
      const doneTasks = pTasks.filter((t) => t.statusId === 'TASK_STAT_DONE').length;

      let progress = 0;
      if (totalTasks > 0) {
        const sum = pTasks.reduce((acc, t) => {
          const s = t.statusId.toUpperCase();
          if (s.includes('DONE')) return acc + 100;
          if (s.includes('TESTING') || s.includes('REVIEW')) return 80;
          if (s.includes('PROGRESS')) return 50;
          if (s.includes('TODO')) return 20;
          if (s.includes('BLOCKED')) return 20;
          return acc;
        }, 0);
        progress = Math.round(sum / totalTasks);
      } else if (p.statusId === 'PROJ_STAT_COMPLETED') {
        progress = 100;
      } else if (p.statusId === 'PROJ_STAT_ACTIVE') {
        progress = 15;
      }

      return {
        ...p,
        totalTasks,
        doneTasks,
        progress,
      };
    });

    return new Response(JSON.stringify({ success: true, data: projectsWithMetrics }), {
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
    const code = getProjectCode(body.title.trim());
    const newProject = {
      id: projectId,
      userId: data.userId,
      title: body.title.trim(),
      code,
      description: body.description?.trim() || null,
      statusId: body.statusId || 'PROJ_STAT_NOT_STARTED',
      priorityId: body.priorityId || 'PRIO_MEDIUM',
      dueDate: normalizeToDate(body.dueDate),
      createdBy: data.userId,
      updatedBy: data.userId,
      isActive: true,
    };

    await db.insert(projects).values(newProject);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...newProject,
          totalTasks: 0,
          doneTasks: 0,
          progress: newProject.statusId === 'PROJ_STAT_COMPLETED' ? 100 : 0,
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to create project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
