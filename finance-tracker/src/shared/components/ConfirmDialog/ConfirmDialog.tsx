// src/shared/components/ConfirmDialog/ConfirmDialog.tsx
// Generic confirmation dialog for destructive/irreversible actions — deletes
// across every feature (transactions, budgets, savings goals, accounts)
// should route through this ONE component rather than each feature hand-
// rolling its own "Are you sure?" modal with slightly different button
// order, wording, or (worse) no confirmation at all.

import type { JSX } from 'react';

import { Button, type ButtonVariant } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' for destructive actions (delete), 'primary' for non-destructive
   *  confirmations (e.g. "Mark goal as complete") that still warrant a pause. */
  tone?: Extract<ButtonVariant, 'danger' | 'primary'>;
  isConfirming?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isConfirming = false,
}: ConfirmDialogProps): JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      // Destructive confirmations should never dismiss from an accidental
      // outside click — the whole point is a deliberate, considered choice.
      disableBackdropClose
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isConfirming} disableMagnetic>
            {cancelLabel}
          </Button>
          <Button
            variant={tone}
            onClick={onConfirm}
            isLoading={isConfirming}
            disableMagnetic
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {/* Modal requires children; the description prop above already
          renders the explanatory copy in the header, so the body is
          intentionally empty here rather than duplicating the message. */}
      <span className="sr-only">{description}</span>
    </Modal>
  );
}
