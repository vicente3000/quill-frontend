import { z } from 'zod';

export const CONTEST_MODES = ['INDIVIDUAL', 'TEAM'] as const;
export const CONTEST_ACCOUNT_TYPES = ['UNIVERSITY', 'EXTERNAL'] as const;
export const CONTEST_STATUSES = ['UPCOMING', 'ACTIVE', 'FINISHED'] as const;

export const MAX_INITIAL_BALANCE = 1_000_000_000;

export type ContestMode = (typeof CONTEST_MODES)[number];
export type ContestAccountType = (typeof CONTEST_ACCOUNT_TYPES)[number];
export type ContestStatus = (typeof CONTEST_STATUSES)[number];

export const ContestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  initialBalance: z.number(),
  mode: z.enum(CONTEST_MODES),
  allowedAccountTypes: z.array(z.enum(CONTEST_ACCOUNT_TYPES)),
  status: z.enum(CONTEST_STATUSES),
  participantsCount: z.number().default(0),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Contest = z.infer<typeof ContestSchema>;

export const ContestListSchema = z.array(ContestSchema);

/** Contest as seen by a student (`GET /contests`): no audit fields, plus the caller's enrollment. */
export const UserContestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  initialBalance: z.number(),
  mode: z.enum(CONTEST_MODES),
  allowedAccountTypes: z.array(z.enum(CONTEST_ACCOUNT_TYPES)),
  status: z.enum(CONTEST_STATUSES),
  participantsCount: z.number(),
  isEnrolled: z.boolean(),
});

export type UserContest = z.infer<typeof UserContestSchema>;

export const UserContestListSchema = z.array(UserContestSchema);

/** Response of `POST /contests/:id/enrollments`. */
export const ContestEnrollmentSchema = z.object({
  contestId: z.string(),
  userId: z.string(),
  joinedAt: z.string(),
});

export type ContestEnrollment = z.infer<typeof ContestEnrollmentSchema>;

const nameField = z
  .string()
  .trim()
  .min(3, 'El nombre debe tener al menos 3 caracteres.')
  .max(80, 'El nombre no puede superar los 80 caracteres.');

const descriptionField = z
  .string()
  .max(500, 'La descripción no puede superar los 500 caracteres.')
  .optional();

const balanceField = z
  .number({ invalid_type_error: 'Ingresa un saldo inicial válido.' })
  .positive('El saldo inicial debe ser mayor a 0.')
  .max(MAX_INITIAL_BALANCE, 'El saldo inicial no puede superar $1.000.000.000.');

const accountTypesField = z
  .array(z.enum(CONTEST_ACCOUNT_TYPES))
  .min(1, 'Selecciona al menos un tipo de cuenta.');

function toTime(value: string) {
  return new Date(value).getTime();
}

/** Payload sent to `POST /admin/contests` (dates as ISO strings). */
export const CreateContestInputSchema = z
  .object({
    name: nameField,
    description: descriptionField,
    startDate: z.string().datetime({ offset: true, message: 'Ingresa una fecha de inicio válida.' }),
    endDate: z.string().datetime({ offset: true, message: 'Ingresa una fecha de término válida.' }),
    initialBalance: balanceField,
    mode: z.enum(CONTEST_MODES),
    allowedAccountTypes: accountTypesField,
  })
  .refine((data) => toTime(data.endDate) > toTime(data.startDate), {
    path: ['endDate'],
    message: 'La fecha de término debe ser posterior a la de inicio.',
  });

export type CreateContestInput = z.infer<typeof CreateContestInputSchema>;

/** Form values: dates come from `datetime-local` inputs (e.g. `2026-12-01T10:00`). */
export const CreateContestFormSchema = z
  .object({
    name: nameField,
    description: descriptionField,
    startDate: z.string().refine((v) => !Number.isNaN(toTime(v)), 'Ingresa una fecha de inicio válida.'),
    endDate: z.string().refine((v) => !Number.isNaN(toTime(v)), 'Ingresa una fecha de término válida.'),
    initialBalance: balanceField,
    mode: z.enum(CONTEST_MODES),
    allowedAccountTypes: accountTypesField,
  })
  .refine((data) => toTime(data.endDate) > toTime(data.startDate), {
    path: ['endDate'],
    message: 'La fecha de término debe ser posterior a la de inicio.',
  });

export type CreateContestFormValues = z.infer<typeof CreateContestFormSchema>;

/** Converts validated form values to the API payload (local datetime -> ISO, trims, drops empty description). */
export function toCreateContestInput(values: CreateContestFormValues): CreateContestInput {
  const description = values.description?.trim();

  return {
    name: values.name.trim(),
    ...(description ? { description } : {}),
    startDate: new Date(values.startDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
    initialBalance: values.initialBalance,
    mode: values.mode,
    allowedAccountTypes: values.allowedAccountTypes,
  };
}
