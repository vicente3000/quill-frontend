import { describe, expect, it } from 'vitest';
import {
  CreateContestFormSchema,
  CreateContestInputSchema,
  toCreateContestInput,
} from './contests';

const validForm = {
  name: 'Copa Quill 2026',
  description: 'Concurso de prueba',
  startDate: '2026-12-01T10:00',
  endDate: '2026-12-31T18:00',
  initialBalance: 10_000_000,
  mode: 'INDIVIDUAL' as const,
  allowedAccountTypes: ['UNIVERSITY' as const, 'EXTERNAL' as const],
};

describe('CreateContestFormSchema', () => {
  it('acepta un formulario válido', () => {
    expect(CreateContestFormSchema.safeParse(validForm).success).toBe(true);
  });

  it('rechaza una fecha de término igual o anterior al inicio', () => {
    const same = CreateContestFormSchema.safeParse({ ...validForm, endDate: validForm.startDate });
    const before = CreateContestFormSchema.safeParse({ ...validForm, endDate: '2026-11-01T10:00' });

    for (const result of [same, before]) {
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['endDate']);
        expect(result.error.issues[0].message).toMatch(/posterior/);
      }
    }
  });

  it('rechaza si no hay tipos de cuenta', () => {
    const result = CreateContestFormSchema.safeParse({ ...validForm, allowedAccountTypes: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['allowedAccountTypes']);
    }
  });

  it.each([0, -1, 1_000_000_001, Number.NaN])('rechaza un saldo inicial inválido (%s)', (initialBalance) => {
    const result = CreateContestFormSchema.safeParse({ ...validForm, initialBalance });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['initialBalance']);
    }
  });

  it('valida largo del nombre (3-80, con trim) y de la descripción (500)', () => {
    expect(CreateContestFormSchema.safeParse({ ...validForm, name: '  ab  ' }).success).toBe(false);
    expect(CreateContestFormSchema.safeParse({ ...validForm, name: 'a'.repeat(81) }).success).toBe(false);
    expect(CreateContestFormSchema.safeParse({ ...validForm, description: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('toCreateContestInput', () => {
  it('convierte fechas locales a ISO, recorta el nombre y omite descripción vacía', () => {
    const input = toCreateContestInput({ ...validForm, name: '  Copa  ', description: '  ' });

    expect(input).toEqual({
      name: 'Copa',
      startDate: new Date('2026-12-01T10:00').toISOString(),
      endDate: new Date('2026-12-31T18:00').toISOString(),
      initialBalance: 10_000_000,
      mode: 'INDIVIDUAL',
      allowedAccountTypes: ['UNIVERSITY', 'EXTERNAL'],
    });
    expect(CreateContestInputSchema.safeParse(input).success).toBe(true);
  });
});
