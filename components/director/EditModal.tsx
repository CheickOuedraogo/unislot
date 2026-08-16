"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type EditModalProps = {
  title: string;
  onClose: () => void;
  onSave: () => void;
  pending: boolean;
  error?: string;
  children: React.ReactNode;
};

export function EditModal({
  title,
  onClose,
  onSave,
  pending,
  error,
  children,
}: EditModalProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <Alert state={{ error }} />
      {children}
    </Modal>
  );
}
