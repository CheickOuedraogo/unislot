"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { inputClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createSwapRequest } from "@/lib/actions/swaps";
import type { ActionResult } from "@/lib/actions/auth";
import type { Slot, Subject } from "@/lib/types";
import { formatDayOfWeek, formatTime } from "@/lib/utils";

type SwapModalProps = {
  onClose: () => void;
  slot: Slot;
  subjects: Subject[];
};

export function SwapModal({ onClose, slot, subjects }: SwapModalProps) {
  const [proposedSubjectId, setProposedSubjectId] = useState(
    subjects[0]?.id ?? ""
  );
  const [message, setMessage] = useState("");
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    startTransition(async () => {
      const res = await createSwapRequest({
        slotId: slot.id,
        message,
        proposedSubjectId,
      });
      setState(res);
      if (!res.error) {
        onClose();
        router.refresh();
      }
    });
  };

  return (
    <Modal
      title="Demander un échange"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Envoi…" : "Envoyer la demande"}
          </Button>
        </>
      }
    >
      <Alert state={state} />
      <p className="font-body-sm text-body-sm text-secondary">
        Vous souhaitez récupérer le créneau{" "}
        <strong className="text-on-surface">{slot.subject_name}</strong> du{" "}
        {formatDayOfWeek(slot.day_of_week)} {formatTime(slot.start_time)} -{" "}
        {formatTime(slot.end_time)}.
      </p>
      <label className="font-label-caps text-label-caps text-secondary block">
        Matière que vous proposez
        <select
          className={`${inputClass} mt-1`}
          value={proposedSubjectId}
          onChange={(e) => setProposedSubjectId(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="font-label-caps text-label-caps text-secondary block">
        Message
        <textarea
          className={`${inputClass} mt-1 min-h-24`}
          placeholder="Expliquez votre demande (urgence, échange de matière…)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
    </Modal>
  );
}
