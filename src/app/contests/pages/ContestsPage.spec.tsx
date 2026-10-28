import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import type { UserContest } from '../../../shared/api/validators';
import { ContestsPage } from './ContestsPage';

const { listMock, enrollMock, showToastMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  enrollMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock('../../auth/hooks/use-auth', () => ({
  useAuth: () => ({ user: { fullName: 'Ana', email: 'ana@quill.cl', role: 'student' }, logout: vi.fn() }),
}));

vi.mock('../../../shared/api/api-service', () => ({
  contestsService: { list: listMock, enroll: enrollMock },
}));

vi.mock('../../../shared/components/toast-service', () => ({
  showToast: showToastMock,
}));

function buildContest(overrides: Partial<UserContest>): UserContest {
  return {
    id: 'c1',
    name: 'Copa Quill',
    description: 'Concurso de prueba',
    startDate: '2026-12-01T10:00:00.000Z',
    endDate: '2026-12-31T18:00:00.000Z',
    initialBalance: 10_000_000,
    mode: 'INDIVIDUAL',
    allowedAccountTypes: ['UNIVERSITY', 'EXTERNAL'],
    status: 'UPCOMING',
    participantsCount: 4,
    isEnrolled: false,
    ...overrides,
  };
}

function cardOf(name: string) {
  const article = screen.getByRole('heading', { name }).closest('article');
  if (!article) throw new Error(`No se encontró la tarjeta de ${name}`);
  return within(article);
}

describe('ContestsPage', () => {
  beforeEach(() => {
    listMock.mockReset();
    enrollMock.mockReset();
    showToastMock.mockReset();
  });

  it('muestra la información de cada concurso y la acción correcta según su estado', async () => {
    listMock.mockResolvedValue([
      buildContest({ id: 'c1', name: 'Copa Disponible' }),
      buildContest({ id: 'c2', name: 'Copa Inscrita', status: 'ACTIVE', isEnrolled: true, participantsCount: 1 }),
      buildContest({ id: 'c3', name: 'Copa Cerrada', status: 'FINISHED' }),
      buildContest({ id: 'c4', name: 'Copa Equipos', mode: 'TEAM', status: 'ACTIVE' }),
    ]);

    renderWithProviders(<ContestsPage />);

    expect(await screen.findByText('Copa Disponible')).toBeInTheDocument();

    const available = cardOf('Copa Disponible');
    expect(available.getByText('Concurso de prueba')).toBeInTheDocument();
    expect(available.getByText('Próximo')).toBeInTheDocument();
    expect(available.getByText('Individual')).toBeInTheDocument();
    expect(available.getByText('$10.000.000')).toBeInTheDocument();
    expect(available.getByText('4 inscritos')).toBeInTheDocument();
    expect(available.getByRole('button', { name: 'Inscribirme' })).toBeEnabled();

    const enrolled = cardOf('Copa Inscrita');
    expect(enrolled.getByText('Inscrito')).toBeInTheDocument();
    expect(enrolled.getByText('1 inscrito')).toBeInTheDocument();
    expect(enrolled.queryByRole('button')).not.toBeInTheDocument();

    expect(cardOf('Copa Cerrada').getByRole('button', { name: 'Finalizado' })).toBeDisabled();

    const team = cardOf('Copa Equipos');
    expect(team.getByText('Por equipos')).toBeInTheDocument();
    expect(team.getByRole('button', { name: 'Por equipos (próximamente)' })).toBeDisabled();
  });

  it('inscribe con el id del concurso y refleja el nuevo estado y conteo', async () => {
    const user = userEvent.setup();
    listMock
      .mockResolvedValueOnce([buildContest({ id: 'c1', name: 'Copa Quill', participantsCount: 4 })])
      .mockResolvedValue([buildContest({ id: 'c1', name: 'Copa Quill', participantsCount: 5, isEnrolled: true })]);
    enrollMock.mockResolvedValue({ contestId: 'c1', userId: 'u1', joinedAt: '2026-11-01T10:00:00.000Z' });

    renderWithProviders(<ContestsPage />);
    await user.click(await screen.findByRole('button', { name: 'Inscribirme' }));

    expect(enrollMock).toHaveBeenCalledWith('c1');
    expect(await screen.findByText('Inscrito')).toBeInTheDocument();
    expect(screen.getByText('5 inscritos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Inscribirme' })).not.toBeInTheDocument();
    expect(showToastMock).toHaveBeenCalledWith('Te inscribiste en Copa Quill');
  });

  it('deshabilita el botón mientras la inscripción está en curso', async () => {
    const user = userEvent.setup();
    let resolveEnroll: (value: unknown) => void = () => {};
    listMock.mockResolvedValue([buildContest({})]);
    enrollMock.mockReturnValue(new Promise((resolve) => (resolveEnroll = resolve)));

    renderWithProviders(<ContestsPage />);
    await user.click(await screen.findByRole('button', { name: 'Inscribirme' }));

    expect(await screen.findByRole('button', { name: 'Inscribiendo...' })).toBeDisabled();

    resolveEnroll({ contestId: 'c1', userId: 'u1', joinedAt: '2026-11-01T10:00:00.000Z' });
    await waitFor(() => expect(showToastMock).toHaveBeenCalled());
  });

  it('muestra el mensaje del backend en un toast de error si la inscripción falla', async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue([buildContest({})]);
    enrollMock.mockRejectedValue(new Error('Ya estás inscrito en este concurso.'));

    renderWithProviders(<ContestsPage />);
    await user.click(await screen.findByRole('button', { name: 'Inscribirme' }));

    await waitFor(() =>
      expect(showToastMock).toHaveBeenCalledWith('Ya estás inscrito en este concurso.', 'error'),
    );
    expect(screen.getByRole('button', { name: 'Inscribirme' })).toBeEnabled();
  });

  it('muestra el estado vacío', async () => {
    listMock.mockResolvedValue([]);

    renderWithProviders(<ContestsPage />);

    expect(await screen.findByText('No hay concursos disponibles por ahora')).toBeInTheDocument();
  });

  it('muestra un error y permite reintentar', async () => {
    const user = userEvent.setup();
    listMock.mockRejectedValueOnce(new Error('boom')).mockRejectedValueOnce(new Error('boom'));

    renderWithProviders(<ContestsPage />);

    // El hook reintenta una vez (retry: 1, ~1 s de espera) antes de marcar el error.
    expect(
      await screen.findByText('No fue posible cargar los concursos.', {}, { timeout: 4000 }),
    ).toBeInTheDocument();

    listMock.mockResolvedValue([buildContest({ name: 'Copa Quill' })]);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Copa Quill')).toBeInTheDocument();
  });
});
