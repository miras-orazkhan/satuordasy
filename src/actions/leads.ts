'use server';

import { db } from '@/lib/db';
import { leadSchema } from '@/lib/lead-validation';
import { revalidatePath } from 'next/cache';

export type SubmitLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitLead(input: unknown): Promise<SubmitLeadResult> {
  // Server-side Zod validation
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Проверьте введённые данные',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Verify the project exists and is published
  const project = await db.project.findFirst({
    where: { id: parsed.data.projectId, status: 'published' },
    select: { id: true },
  });
  if (!project) {
    return { ok: false, error: 'Проект не найден или снят с публикации' };
  }

  const lead = await db.lead.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      comment: parsed.data.comment || null,
      status: 'new',
    },
  });

  // Refresh the admin leads list (in case someone is on that page)
  revalidatePath('/admin/leads');

  return { ok: true, leadId: lead.id };
}

export async function updateLeadStatus(leadId: string, status: string): Promise<{ ok: boolean; error?: string }> {
  const allowed = ['new', 'in_progress', 'done', 'rejected'];
  if (!allowed.includes(status)) return { ok: false, error: 'Недопустимый статус' };
  try {
    await db.lead.update({ where: { id: leadId }, data: { status } });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'Не удалось обновить статус' };
  }
}

export async function deleteLead(leadId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await db.lead.delete({ where: { id: leadId } });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось удалить заявку' };
  }
}
