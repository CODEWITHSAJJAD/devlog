import { eq, and, desc, like, or } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { learnings, tasks } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { request, env, data } = context;
  const url = new URL(request.url);
  const taskId = url.searchParams.get('taskId');
  const search = url.searchParams.get('search');
  const tag = url.searchParams.get('tag');

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const conditions = [eq(learnings.userId, data.userId), eq(learnings.isActive, true)];

    if (taskId) {
      conditions.push(eq(learnings.taskId, taskId));
    }

    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(learnings.title, searchPattern),
          like(learnings.content, searchPattern),
          like(learnings.tags, searchPattern)
        )!
      );
    }

    if (tag) {
      const tagPattern = `%"${tag.toLowerCase()}"%`;
      conditions.push(like(learnings.tags, tagPattern));
    }

    const items = await db
      .select({
        id: learnings.id,
        taskId: learnings.taskId,
        userId: learnings.userId,
        title: learnings.title,
        content: learnings.content,
        tags: learnings.tags,
        createdAt: learnings.createdAt,
        createdBy: learnings.createdBy,
        updatedAt: learnings.updatedAt,
        isActive: learnings.isActive,
        taskKey: tasks.taskKey,
        taskTitle: tasks.title,
      })
      .from(learnings)
      .leftJoin(tasks, eq(learnings.taskId, tasks.id))
      .where(and(...conditions))
      .orderBy(desc(learnings.createdAt))
      .all();

    return new Response(JSON.stringify({ success: true, data: items }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch learnings' }), {
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
      taskId?: string;
      title?: string;
      content?: string;
      tags?: string[];
    };

    if (!body.taskId || !body.title || !body.title.trim() || !body.content || !body.content.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Task ID, title, and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(env.DB);

    // Verify task exists, belongs to user, and is active
    const task = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, body.taskId), eq(tasks.userId, data.userId), eq(tasks.isActive, true)))
      .get();

    if (!task) {
      return new Response(JSON.stringify({ success: false, error: 'Task not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const learningId = crypto.randomUUID();
    const tagsArray = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const newLearning = {
      id: learningId,
      taskId: body.taskId,
      userId: data.userId,
      title: body.title.trim(),
      content: body.content.trim(),
      tags: tagsArray,
      createdBy: data.userId,
      updatedBy: data.userId,
      isActive: true,
    };

    await db.insert(learnings).values(newLearning);

    return new Response(JSON.stringify({ success: true, data: newLearning }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to record learning' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
