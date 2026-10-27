import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { AdminContestCreateModal } from './AdminContestCreateModal';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('../../../shared/api/api-service', () => ({
  adminContestService: { list: vi.fn(), create: createMock },
}));

function fillDates(start: string, end: string) {
  fireEvent.change(screen.getByLabelText('Inicio'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('Término'), { target: { value: end } });
}

describe('AdminContestCreateModal', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('envía el payload esperado y se cierra al crear', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    createMock.mockResolvedValue({});

    renderWithProviders(<AdminContestCreateModal onClose={onClose} />);

    await user.type(screen.getByLabelText('Nombre'), '  Copa Quill 2026  ');
    await user.type(screen.getByLabelText('Descripción (opcional)'), 'Concurso de prueba');
    await user.click(screen.getByLabelText('Por equipos'));
    await user.click(screen.getByLabelText('Externa'));
    await user.clear(screen.getByLabelText('Saldo inicial (CLP)'));
    await user.type(screen.getByLabelText('Saldo inicial (CLP)'), '5000000');
    fillDates('2026-12-01T10:00', '2026-12-31T18:00');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(createMock).toHaveBeenCalledWith({
      name: 'Copa Quill 2026',
      description: 'Concurso de prueba',
      startDate: new Date('2026-12-01T10:00').toISOString(),
      endDate: new Date('2026-12-31T18:00').toISOString(),
      initialBalance: 5_000_000,
      mode: 'TEAM',
      allowedAccountTypes: ['UNIVERSITY'],
    });
  });

  it('valida en el cliente y no llama a la API', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<AdminContestCreateModal onClose={onClose} />);

    await user.type(screen.getByLabelText('Nombre'), 'Copa');
    await user.click(screen.getByLabelText('Universidad'));
    await user.click(screen.getByLabelText('Externa'));
    fillDates('2026-12-31T10:00', '2026-12-01T10:00');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Selecciona al menos un tipo de cuenta.')).toBeInTheDocument();
    expect(screen.getByText('La fecha de término debe ser posterior a la de inicio.')).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('muestra el mensaje de error del backend y mantiene el modal abierto', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    createMock.mockRejectedValue(new Error('Ya existe un concurso con ese nombre.'));

    renderWithProviders(<AdminContestCreateModal onClose={onClose} />);

    await user.type(screen.getByLabelText('Nombre'), 'Copa Quill');
    fillDates('2026-12-01T10:00', '2026-12-31T18:00');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un concurso con ese nombre.');
    expect(onClose).not.toHaveBeenCalled();
  });
});
