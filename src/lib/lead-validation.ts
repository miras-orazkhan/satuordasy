import { z } from 'zod';

export const leadSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2, 'Имя слишком короткое').max(100),
  phone: z
    .string()
    .min(6, 'Введите корректный телефон')
    .max(30, 'Слишком длинный номер')
    .regex(/^[+\d\s()-]+$/, 'Допускаются только цифры и символы +() -'),
  comment: z.string().max(1000).optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'Требуется согласие на обработку ПД' }) }),
});

export type LeadInput = z.infer<typeof leadSchema>;
