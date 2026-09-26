"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/ActionButton";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_INSTITUTION, getAcademicYear } from "@/lib/constants";
import type { Slot } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Constantes de mise en page                                          */
/* ------------------------------------------------------------------ */

const PAGE_W = 842; // A4 paysage en points
const PAGE_H = 595;
const PAD = 16;
const CONTENT_W = PAGE_W - PAD * 2;
const CONTENT_H = PAGE_H - PAD * 2;
const TIME_COL_W = 88;

/** Nombre de cours affichés au maximum dans une case (au-delà : "+N"). */
const MAX_PER_CELL = 4;

/** Tailles de texte de référence : on ne descend en dessous qu'en dernier recours. */
const FS_TITLE = 9.5;
const FS_META = 8.5;

const DAY_LABELS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

/** Les deux bandes fixes de la journée (pas de ligne "Pause"). */
const BANDS = [
  { key: "am", label: "7h – 12h30", start: 7 * 60, end: 12 * 60 + 30 },
  { key: "pm", label: "15h – 18h", start: 15 * 60, end: 18 * 60 },
] as const;

const TYPE_LABELS: Record<Slot["type"], string> = {
  cours: "Cours",
  td: "TD",
  tp: "TP",
  devoir: "Devoir",
};

const RED = "#C0111F";
const INK = "#111827";
const MUTED = "#4B5563";

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const toMin = (t: string) => {
  const [h, m] = (t ?? "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const fmtH = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
};

/** Nombre de lignes estimé pour un texte dans une largeur donnée. */
const linesOf = (text: string, width: number, fontSize: number) =>
  Math.max(1, Math.ceil((text.length * fontSize * 0.5) / Math.max(width, 1)));

type Card = {
  slot: Slot;
  title: string;
  profs: string;
  time: string | null;
  isDevoir: boolean;
};

function bandIndexFor(start: number, end: number) {
  let best = 0;
  let bestScore = -Infinity;
  BANDS.forEach((b, i) => {
    const overlap = Math.min(end, b.end) - Math.max(start, b.start);
    const mid = (start + end) / 2;
    const distance = Math.abs(mid - (b.start + b.end) / 2);
    const score = overlap > 0 ? overlap * 1000 : -distance;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}

function buildCard(slot: Slot): Card {
  const start = toMin(slot.start_time);
  const end = toMin(slot.end_time);
  const band = BANDS[bandIndexFor(start, end)];
  const exact = start === band.start && end === band.end;
  return {
    slot,
    title: `${TYPE_LABELS[slot.type]} : ${slot.subject_name}`,
    profs: (slot.professors ?? []).map((p) => p.name).join(", "),
    time: exact ? null : `${fmtH(start)} – ${fmtH(end)}`,
    isDevoir: slot.type === "devoir",
  };
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export interface ExportPdfButtonProps {
  slots: Slot[];
  className: string;
  weekLabel: string;
  /** Lundi de la semaine au format ISO YYYY-MM-DD, pour afficher "Lundi 15 septembre". */
  weekStart?: string;
  /** Bloc en haut à gauche, ex. "Université Joseph Ki-Zerbo\nCentre universitaire de Kaya (CUK)". */
  institution?: string;
  /** Bloc en haut à droite, ex. "2025-2026". */
  academicYear?: string;
  footerNote?: string;
}

export function ExportPdfButton({
  slots,
  className,
  weekLabel,
  weekStart,
  institution,
  academicYear,
  footerNote = "",
}: ExportPdfButtonProps) {
  const resolvedInstitution =
    institution?.trim() ? institution : DEFAULT_INSTITUTION;
  const resolvedAcademicYear =
    academicYear?.trim() ? academicYear : getAcademicYear();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(footerNote);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchro si footerNote prop change après mount (ex. teacher page)
  // On ne force pas : l'utilisateur édite `note` localement via la modale.

  async function handleExport() {
    setBusy(true);
    setError(null);
    try {
      const { Document, Page, View, Text, pdf } = await import("@react-pdf/renderer");

      const hasSunday = slots.some((s) => s.day_of_week === 6);
      const dayIndexes = hasSunday ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5];
      const colW = (CONTENT_W - TIME_COL_W) / dayIndexes.length;

      // Labels "Lundi 15 septembre" si weekStart fourni
      const weekStartDate = weekStart ? new Date(`${weekStart}T00:00:00`) : null;
      const validWeekStart = weekStartDate && !Number.isNaN(weekStartDate.getTime()) ? weekStartDate : null;
      const dayLabels: string[] = dayIndexes.map((d) => {
        if (!validWeekStart) return DAY_LABELS[d];
        const dt = new Date(validWeekStart);
        dt.setDate(validWeekStart.getDate() + d);
        const month = dt.toLocaleDateString("fr-FR", { month: "long" });
        return `${DAY_LABELS[d]} ${dt.getDate()} ${month}`;
      });

      const cells: Card[][][] = BANDS.map(() => dayIndexes.map(() => []));
      slots.forEach((slot) => {
        const dayPos = dayIndexes.indexOf(slot.day_of_week);
        if (dayPos < 0) return;
        const band = bandIndexFor(toMin(slot.start_time), toMin(slot.end_time));
        cells[band][dayPos].push(buildCard(slot));
      });
      cells.forEach((row) =>
        row.forEach((list) =>
          list.sort(
            (a, b) =>
              toMin(a.slot.start_time) - toMin(b.slot.start_time) ||
              a.title.localeCompare(b.title),
          ),
        ),
      );

      const noteText = (note ?? "").trim();
      const institutionLines = resolvedInstitution
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      // En-tête plus aéré : institution (2 lignes) + titre centré + espace avant grille
      const GAP_TITLE_GRID = 14;
      const headerH =
        8 + Math.max(1, institutionLines.length) * 11 + 10 + 13 + GAP_TITLE_GRID;
      const THEAD_H = 30;

      const measure = (scale: number) => {
        const fsTitle = FS_TITLE * scale;
        const fsMeta = FS_META * scale;
        const innerW = colW - 10;

        const cardH = (c: Card) => {
          const titleLines = Math.min(3, linesOf(c.title, innerW, fsTitle));
          const profLines = c.profs ? Math.min(2, linesOf(c.profs, innerW, fsMeta)) : 0;
          const timeLines = c.time ? 1 : 0;
          return (
            titleLines * fsTitle * 1.25 +
            profLines * fsMeta * 1.25 +
            timeLines * fsMeta * 1.25 +
            5
          );
        };

        const noteFs = FS_META * scale;
        const noteLines = noteText ? Math.min(4, linesOf(noteText, CONTENT_W - 8, noteFs)) : 0;
        const footerH = noteText ? noteLines * noteFs * 1.35 + 12 : 0;

        const baseRowHeights = cells.map((row) => {
          const hasContent = row.some((list) => list.length > 0);
          const tallest = Math.max(
            0,
            ...row.map((list) => {
              const shown = list.slice(0, MAX_PER_CELL);
              const extra = list.length > MAX_PER_CELL ? fsMeta * 1.25 : 0;
              const separators = Math.max(0, shown.length - 1) * 9;
              return shown.reduce((sum, c) => sum + cardH(c), 0) + extra + separators;
            }),
          );
          const contentH = Math.max(fsTitle * 2.6, tallest) + 14;
          if (!hasContent) return 36 * scale;
          return Math.max(contentH, 54 * scale);
        });

        const availableRowsH = Math.max(
          0,
          CONTENT_H - headerH - THEAD_H - footerH - 6,
        );
        const baseRowsH = baseRowHeights.reduce((sum, height) => sum + height, 0);
        const addPerRow = Math.max(
          0,
          (availableRowsH - baseRowsH) / cells.length,
        );
        const rowHeights = baseRowHeights.map((height) => height + addPerRow);
        const total =
          headerH + THEAD_H + rowHeights.reduce((sum, height) => sum + height, 0) + footerH + 6;
        return { total, rowHeights, fsTitle, fsMeta, noteFs };
      };

      let scale = 1;
      let layout = measure(scale);
      while (layout.total > CONTENT_H && scale > 0.6) {
        scale = Math.round((scale - 0.02) * 100) / 100;
        layout = measure(scale);
      }

      const { rowHeights, fsTitle, fsMeta, noteFs } = layout;
      const BORDER = INK;

      const CourseText = ({ c }: { c: Card }) => (
        <View>
          <Text style={{ fontSize: fsTitle, color: c.isDevoir ? RED : INK, lineHeight: 1.25 }}>
            {c.title}
          </Text>
          {c.profs ? (
            <Text
              style={{
                fontSize: fsMeta,
                color: c.isDevoir ? RED : INK,
                fontFamily: "Helvetica-Bold",
                lineHeight: 1.25,
              }}
            >
              {c.profs}
            </Text>
          ) : null}
          {c.time ? (
            <Text
              style={{
                fontSize: fsMeta,
                color: MUTED,
                fontFamily: "Helvetica-Oblique",
                lineHeight: 1.25,
              }}
            >
              ({c.time})
            </Text>
          ) : null}
        </View>
      );

      const doc = (
        <Document title={`Emploi du temps ${className}`}>
          <Page
            size="A4"
            orientation="landscape"
            style={{ padding: PAD, fontFamily: "Helvetica", backgroundColor: "#FFFFFF", color: INK }}
          >
            <View wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View style={{ width: "34%" }}>
                  {institutionLines.map((line, i) => (
                    <Text key={i} style={{ fontSize: 10, fontFamily: "Helvetica-Bold", lineHeight: 1.2 }}>
                      {line}
                    </Text>
                  ))}
                </View>
                <View style={{ width: "32%" }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center" }}>
                    Semaine du {weekLabel}
                  </Text>
                </View>
                <View style={{ width: "34%" }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right" }}>
                    Année académique {resolvedAcademicYear}
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 13, textAlign: "center", marginTop: 8, marginBottom: 14 }}>{className}</Text>

              <View style={{ borderWidth: 1, borderColor: BORDER, borderBottomWidth: 0, borderRightWidth: 0 }}>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: TIME_COL_W,
                      height: THEAD_H,
                      borderRightWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: BORDER,
                      paddingVertical: 5,
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}></Text>
                  </View>
                  {dayIndexes.map((day, dayIndex) => (
                    <View
                      key={day}
                      style={{
                        width: colW,
                        height: THEAD_H,
                        borderRightWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: BORDER,
                        paddingVertical: 4,
                        paddingHorizontal: 3,
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8.5,
                          fontFamily: "Helvetica-Bold",
                          textAlign: "center",
                          lineHeight: 1.1,
                        }}
                      >
                        {dayLabels[dayIndex]}
                      </Text>
                    </View>
                  ))}
                </View>

                {BANDS.map((band, bandIndex) => (
                  <View key={band.key} style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: TIME_COL_W,
                        height: rowHeights[bandIndex],
                        borderRightWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: BORDER,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", textAlign: "center" }}>
                        {band.label}
                      </Text>
                    </View>
                    {dayIndexes.map((day, dayIndex) => {
                      const list = cells[bandIndex][dayIndex];
                      const shown = list.slice(0, MAX_PER_CELL);
                      const extra = list.length - shown.length;
                      return (
                        <View
                          key={day}
                          style={{
                            width: colW,
                            height: rowHeights[bandIndex],
                            borderRightWidth: 1,
                            borderBottomWidth: 1,
                            borderColor: BORDER,
                            paddingVertical: 4,
                            paddingHorizontal: 6,
                            overflow: "hidden",
                            justifyContent: "center",
                          }}
                        >
                          {shown.map((c, courseIndex) => (
                            <Fragment key={c.slot.id}>
                              {courseIndex > 0 ? (
                                <View
                                  style={{
                                    borderTopWidth: 0.5,
                                    borderTopColor: "#D1D5DB",
                                    marginTop: 5,
                                    marginBottom: 4,
                                  }}
                                />
                              ) : null}
                              <CourseText c={c} />
                            </Fragment>
                          ))}
                          {extra > 0 ? (
                            <Text style={{ fontSize: fsMeta, color: MUTED, marginTop: shown.length > 0 ? 4 : 0 }}>
                              +{extra} autre{extra > 1 ? "s" : ""}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>

              {noteText ? (
                <Text style={{ marginTop: 8, fontSize: noteFs, color: MUTED, lineHeight: 1.35 }}>{noteText}</Text>
              ) : null}
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emploi-du-temps-${className}-${weekLabel}`.replace(/[^\w\-]+/g, "-").toLowerCase().concat(".pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      setError("Impossible de générer le PDF.");
    } finally {
      setBusy(false);
    }
  }

  const onConfirm = () => {
    setOpen(false);
    handleExport();
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
      <Button
        variant="secondary"
        onClick={() => {
          setNote(footerNote);
          setOpen(true);
        }}
        disabled={busy}
      >
        <Icon name="download" size={16} />
        {busy ? "Génération…" : "Exporter en PDF"}
      </Button>

      {open && (
        <Modal
          title="Ajouter une note de bas de page"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={onConfirm} disabled={busy}>
                {busy ? "Génération…" : "Exporter"}
              </Button>
            </>
          }
        >
          <p className="font-body-sm text-body-sm text-secondary">
            Elle apparaît sous la grille. Laissez vide pour exporter sans note.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={300}
            className="mt-3 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary min-h-20"
            placeholder="Ex. : les TP du jeudi se déroulent en salle informatique 2."
          />
        </Modal>
      )}
    </div>
  );
}

export default ExportPdfButton;
