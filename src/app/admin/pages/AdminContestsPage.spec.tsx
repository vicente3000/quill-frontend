import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import type { Contest } from '../../../shared/api/validators';
import { AdminContestsPage } from './AdminContestsPage';

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock('../../../shared/api/api-service', () => ({
  adminContestService: { list: listMock, create: vi.fn() },
}));

vi.mock('../components/AdminContestCreateModal', () => ({
  AdminContestCreateModal: () => <div role="dialog">Modal de creación</div>,
}));

function buildContest(overrides: Partial<Contest>): Contest {
  return {
    id: 'c1',
    name: 'Copa Quill',
    description: null,
    startDate: '2026-12-01T10:00:00.000Z',
    endDate: '2026-12-31T18:00:00.000Z',
    initialBalance: 10_000_000,
    mode: 'INDIVIDUAL',
    allowedAccountTypes: ['UNIVERSITY', 'EXTERNAL'],
    status: 'UPCOMING',
    createdBy: 'admin-1',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('AdminContestsPage', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('muestra los concursos devueltos por la API', async () => {
    listMock.mockResolvedValue([
      buildContest({}),
      buildContest({
        id: 'c2',
        name: 'Desafío por Equipos',
        mode: 'TEAM',
        allowedAccountTypes: ['UNIVERSITY'],
        initialBalance: 5_000_000,
        status: 'ACTIVE',
      }),
      buildContest({ id: 'c3', name: 'Torneo Cerrado', allowedAccountTypes: ['EXTERNAL'], status: 'FINISHED' }),
    ]);

    renderWithProviders(<AdminContestsPage />);

    expect(await screen.findByText('Copa Quill')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);

    const first = within(rows[1]);
    expect(first.getByText('Individual')).toBeInTheDocument();
    expect(first.getByText('Universidad · Externa')).toBeInTheDocument();
    expect(first.getByText('$10.000.000')).toBeInTheDocument();
    expect(first.getByText('Próximo')).toBeInTheDocument();

    const team = within(rows[2]);
    expect(team.getByText('Desafío por Equipos')).toBeInTheDocument();
    expect(team.getByText('Por equipos')).toBeInTheDocument();
    expect(team.getByText('Universidad')).toBeInTheDocument();
    expect(team.getByText('$5.000.000')).toBeInTheDocument();
    expect(team.getByText('Activo')).toBeInTheDocument();

    expect(within(rows[3]).getByText('Finalizado')).toBeInTheDocument();
  });

  it('muestra el estado vacío', async () => {
    listMock.mockResolvedValue([]);

    renderWithProviders(<AdminContestsPage />);

    expect(await screen.findByText('Aún no hay concursos')).toBeInTheDocument();
  });

  it('muestra un error y permite reintentar', async () => {
    const user = userEvent.setup();
    listMock.mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminContestsPage />);

    // El hook reintenta una vez (retry: 1, ~1 s de espera) antes de marcar el error.
    expect(
      await screen.findByText('No fue posible cargar los concursos.', {}, { timeout: 4000 }),
    ).toBeInTheDocument();

    listMock.mockResolvedValue([buildContest({})]);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Copa Quill')).toBeInTheDocument();
  });

  it('abre el modal al presionar el botón de crear', async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue([]);

    renderWithProviders(<AdminContestsPage />);
    await user.click(await screen.findByRole('button', { name: 'Crear concurso' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
