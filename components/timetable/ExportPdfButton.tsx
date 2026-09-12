"use client";

import { useState } from "react";
import { Button } from "@/components/ui/ActionButton";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { courseTypeLabels, GRID_DAYS } from "@/lib/constants";
import { formatDayOfWeek } from "@/lib/utils";
import type { Slot } from "@/lib/types";

type ExportPdfButtonProps = {
  slots: Slot[];
  className: string;
  weekLabel: string;
};

type Col = { start: string; end: string; label: string };

const COLUMNS: Col[] = [
  { start: "08:00", end: "10:00", label: "8h - 10h" },
  { start: "10:00", end: "12:00", label: "10h - 12h" },
  { start: "14:00", end: "16:00", label: "14h - 16h" },
  { start: "16:00", end: "18:00", label: "16h - 18h" },
];

const DAY_COL_WIDTH = 13;

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function colFor(slot: Slot, cols: Col[]): { index: number; span: number } | null {
  const s = toMin(slot.start_time);
  const e = toMin(slot.end_time);
  let index = -1;
  let span = 0;
  for (let i = 0; i < cols.length; i++) {
    const cs = toMin(cols[i].start);
    const ce = toMin(cols[i].end);
    if (s < ce && e > cs) {
      if (index === -1) index = i;
      span++;
    }
  }
  return index === -1 ? null : { index, span };
}

function assignLanes(intervals: { index: number; span: number }[]): number[] {
  const sorted = intervals
    .map((it, i) => ({ it, i }))
    .sort(
      (a, b) =>
        a.it.index - b.it.index || (a.it.index + a.it.span) - (b.it.index + b.it.span)
    );
  const lanes: number[] = [];
  const result: number[] = [];
  for (const { it, i } of sorted) {
    const endCol = it.index + it.span;
    let lane = lanes.findIndex((l) => l <= it.index);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(0);
    }
    lanes[lane] = endCol;
    result[i] = lane;
  }
  return result;
}

export function ExportPdfButton({ slots, className, weekLabel }: ExportPdfButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [footerNote, setFooterNote] = useState("");

  const handleExport = async () => {
    setPending(true);
    setError(null);
    try {
      const { Document, Page, Text, View, StyleSheet, pdf } = await import(
        "@react-pdf/renderer"
      );

      const colWidth = (100 - DAY_COL_WIDTH) / COLUMNS.length;
      const bodyColWidth = 100 / COLUMNS.length;

      const hasSunday = slots.some((s) => s.day_of_week === 6);
      const days = hasSunday ? [0, 1, 2, 3, 4, 5, 6] : [...GRID_DAYS];

      // Hauteur de ligne adaptative pour tenir sur une seule page A4 paysage.
      const pageHeight = 595;
      const pagePad = 24;
      const headerH = 34;
      const gridHeaderH = 30;
      const footerH = footerNote.trim() !== "" ? 26 : 0;
      const availableHeight =
        pageHeight - pagePad * 2 - headerH - footerH - gridHeaderH;
      const rowHeight = Math.max(50, Math.floor(availableHeight / days.length));

      const styles = StyleSheet.create({
        page: {
          padding: 24,
          fontFamily: "Helvetica",
          fontSize: 10,
        },
        header: { marginBottom: 16 },
        title: { fontSize: 17, fontWeight: "bold", marginBottom: 5 },
        subtitle: { fontSize: 10.5, color: "#555f6f" },
        grid: { borderWidth: 1, borderColor: "#aeb3b8" },
        headerRow: {
          flexDirection: "row",
          backgroundColor: "#eef0f1",
          borderBottomWidth: 1,
          borderBottomColor: "#aeb3b8",
        },
        dayHeaderCell: {
          width: `${DAY_COL_WIDTH}%`,
          alignItems: "center",
          paddingVertical: 8,
        },
        colHeaderCell: {
          width: `${colWidth}%`,
          alignItems: "center",
          paddingVertical: 8,
          borderLeftWidth: 1,
          borderLeftColor: "#aeb3b8",
        },
        colHeaderText: { fontSize: 10, fontWeight: "bold" },
        dayRow: {
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#aeb3b8",
          height: rowHeight,
        },
        dayLabelCell: {
          width: `${DAY_COL_WIDTH}%`,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f8f9",
          paddingHorizontal: 4,
        },
        dayLabel: { fontSize: 10.5, fontWeight: "bold" },
        body: {
          width: `${100 - DAY_COL_WIDTH}%`,
          position: "relative",
          alignSelf: "stretch",
        },
        emptyCell: {
          position: "absolute",
          top: 0,
          bottom: 0,
          borderLeftWidth: 1,
          borderLeftColor: "#aeb3b8",
          padding: 6,
        },
        courseAbs: {
          position: "absolute",
          padding: 7,
          justifyContent: "center",
        },
        courseLine: { fontSize: 9.5, fontWeight: "bold", marginBottom: 2 },
        courseLine2: { fontSize: 9 },
        footer: {
          marginTop: 16,
          color: "#555f6f",
          fontSize: 9.5,
        },
      });

      const dayLayout = days.map((day) => {
        const daySlots = slots.filter((s) => s.day_of_week === day);
        const withCol = daySlots
          .map((s) => ({ slot: s, col: colFor(s, COLUMNS) }))
          .filter((x) => x.col) as { slot: Slot; col: { index: number; span: number } }[];
        const lanes = assignLanes(withCol.map((x) => x.col));
        const laneCount = Math.max(1, new Set(lanes).size);
        return withCol.map((x, i) => ({
          slot: x.slot,
          ...x.col,
          lane: lanes[i],
          laneCount,
        }));
      });

      const doc = (
        <Document>
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>Emploi du temps — {className}</Text>
              <Text style={styles.subtitle}>Semaine du {weekLabel}</Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.headerRow}>
                <View style={styles.dayHeaderCell} />
                {COLUMNS.map((c) => (
                  <View key={c.label} style={styles.colHeaderCell}>
                    <Text style={styles.colHeaderText}>{c.label}</Text>
                  </View>
                ))}
              </View>
              {days.map((day, di) => (
                <View key={day} style={styles.dayRow}>
                  <View style={styles.dayLabelCell}>
                    <Text style={styles.dayLabel}>{formatDayOfWeek(day)}</Text>
                  </View>
                  <View style={styles.body}>
                    {COLUMNS.map((c, ci) => (
                      <View
                        key={c.label}
                        style={[
                          styles.emptyCell,
                          {
                            left: `${ci * bodyColWidth}%`,
                            width: `${bodyColWidth}%`,
                          },
                        ]}
                      />
                    ))}
                    {dayLayout[di].map(({ slot, index, span, lane, laneCount }) => (
                      <View
                        key={slot.id}
                        style={[
                          styles.courseAbs,
                          {
                            left: `${index * bodyColWidth}%`,
                            width: `${span * bodyColWidth}%`,
                            top: `${(lane / laneCount) * 100}%`,
                            height: `${(1 / laneCount) * 100}%`,
                          },
                        ]}
                      >
                        <Text style={styles.courseLine}>
                          {courseTypeLabels[slot.type]} — {slot.subject_name}
                        </Text>
                        <Text style={styles.courseLine2}>
                          {slot.professors.map((p) => p.name).join(", ")}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            {footerNote.trim() !== "" && (
              <View style={styles.footer}>
                <Text>{footerNote}</Text>
              </View>
            )}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emploi-du-temps-${className.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Impossible de générer le PDF.");
    } finally {
      setPending(false);
    }
  };

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
          setFooterNote("");
          setOpen(true);
        }}
        disabled={pending}
      >
        <Icon name="download" size={16} />
        {pending ? "Génération…" : "Exporter en PDF"}
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
              <Button onClick={onConfirm} disabled={pending}>
                {pending ? "Génération…" : "Exporter"}
              </Button>
            </>
          }
        >
          <p className="font-body-sm text-body-sm text-secondary">
            Vous pouvez ajouter une note qui apparaîtra en bas de l&apos;emploi du
            temps (laissez vide pour ne pas l&apos;afficher).
          </p>
          <textarea
            className="mt-3 w-full min-h-20 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"
            placeholder="Les cours se dérouleront..."
            value={footerNote}
            onChange={(e) => setFooterNote(e.target.value)}
          />
        </Modal>
      )}
    </div>
  );
}
