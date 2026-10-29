import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { admin } from '../../../shared/content/strings';
import { button, surface } from '../../../shared/design-system/surfaces';
import { fieldError, fieldLabel } from '../../../shared/design-system/typography';
import { fieldGroup } from '../../../shared/design-system/layout';
import { errorMessage, inputBase } from '../../../shared/design-system/forms';
import { getApiErrorMessage } from '../../../shared/api/get-api-error-message';
import { useCreateAdminContest } from '../../../shared/api/hooks';
import {
  CONTEST_ACCOUNT_TYPES,
  CONTEST_MODES,
  CreateContestFormSchema,
  toCreateContestInput,
  type CreateContestFormValues,
} from '../../../shared/api/validators';

interface AdminContestCreateModalProps {
  onClose: () => void;
}

const OPTION =
  'flex cursor-pointer items-center gap-2 rounded-[var(--main-page-radius-md)] border border-[var(--main-page-border)] px-3 py-2 text-[0.9rem] text-text';

export function AdminContestCreateModal({ onClose }: AdminContestCreateModalProps) {
  const createMutation = useCreateAdminContest();
  const { fields, modes, accountTypes } = admin.contests;
  const { register, handleSubmit, formState } = useForm<CreateContestFormValues>({
    resolver: zodResolver(CreateContestFormSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      initialBalance: 1_000_000,
      mode: 'INDIVIDUAL',
      allowedAccountTypes: [...CONTEST_ACCOUNT_TYPES],
    },
  });
  const { errors } = formState;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(toCreateContestInput(values));
      onClose();
    } catch {
      // El error se muestra en el formulario (createMutation.error) y ya fue registrado por el hook.
    }
  });

  return (
    <div className={surface.modalOverlay} onClick={onClose}>
      <div
        className={`${surface.modalContent} max-h-full overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contest-create-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="contest-create-title" className="m-0 mb-4 text-text">{admin.contests.createTitle}</h3>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          {createMutation.error ? (
            <p className={`m-0 text-sm ${errorMessage}`} role="alert">
              {getApiErrorMessage(createMutation.error, admin.contests.createError)}
            </p>
          ) : null}

          <label className={fieldGroup}>
            <span className={fieldLabel}>{fields.name}</span>
            <input
              className={inputBase}
              type="text"
              placeholder={admin.contests.placeholders.name}
              {...register('name')}
            />
            <span className={fieldError}>{errors.name?.message}</span>
          </label>

          <label className={fieldGroup}>
            <span className={fieldLabel}>{fields.description}</span>
            <textarea
              className={inputBase}
              rows={3}
              placeholder={admin.contests.placeholders.description}
              {...register('description')}
            />
            <span className={fieldError}>{errors.description?.message}</span>
          </label>

          <fieldset className="m-0 grid gap-2 border-0 p-0">
            <legend className={`${fieldLabel} mb-2 p-0`}>{fields.mode}</legend>
            <div className="flex flex-wrap gap-2">
              {CONTEST_MODES.map((mode) => (
                <label key={mode} className={OPTION}>
                  <input type="radio" value={mode} {...register('mode')} />
                  {modes[mode]}
                </label>
              ))}
            </div>
            <span className={fieldError}>{errors.mode?.message}</span>
          </fieldset>

          <fieldset className="m-0 grid gap-2 border-0 p-0">
            <legend className={`${fieldLabel} mb-2 p-0`}>{fields.accountTypes}</legend>
            <div className="flex flex-wrap gap-2">
              {CONTEST_ACCOUNT_TYPES.map((type) => (
                <label key={type} className={OPTION}>
                  <input type="checkbox" value={type} {...register('allowedAccountTypes')} />
                  {accountTypes[type]}
                </label>
              ))}
            </div>
            <span className={fieldError}>{errors.allowedAccountTypes?.message}</span>
          </fieldset>

          <label className={fieldGroup}>
            <span className={fieldLabel}>{fields.initialBalance}</span>
            <input
              className={inputBase}
              type="number"
              step="any"
              min={0}
              {...register('initialBalance', { valueAsNumber: true })}
            />
            <span className={fieldError}>{errors.initialBalance?.message}</span>
          </label>

          <div className="grid gap-4">
            <label className={fieldGroup}>
              <span className={fieldLabel}>{fields.startDate}</span>
              <input className={inputBase} type="datetime-local" {...register('startDate')} />
              <span className={fieldError}>{errors.startDate?.message}</span>
            </label>

            <label className={fieldGroup}>
              <span className={fieldLabel}>{fields.endDate}</span>
              <input className={inputBase} type="datetime-local" {...register('endDate')} />
              <span className={fieldError}>{errors.endDate?.message}</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className={`${button.base} ${button.secondary}`} onClick={onClose}>
              {admin.actions.cancel}
            </button>
            <button
              type="submit"
              className={`${button.base} ${button.primary}`}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? admin.actions.creating : admin.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
