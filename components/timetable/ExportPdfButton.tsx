"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { courseTypeLabels, GRID_DAYS } from "@/lib/constants";
import { formatTime, formatDayOfWeek } from "@/lib/utils";
import type { Slot } from "@/lib/types";

type ExportPdfButtonProps = {
  slots: Slot[];
  className: string;
  weekLabel: string;
};

export function ExportPdfButton({ slots, className, weekLabel }: ExportPdfButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setPending(true);
    setError(null);
    try {
      const { Document, Page, Text, View, StyleSheet, pdf } = await import(
        "@react-pdf/renderer"
      );

      const styles = StyleSheet.create({
        page: {
          padding: 24,
          fontFamily: "Helvetica",
          fontSize: 9,
        },
        header: {
          marginBottom: 16,
        },
        title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
        subtitle: { fontSize: 10, color: "#555f6f" },
        row: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "#e1e3e4",
          paddingVertical: 6,
        },
        headerRow: {
          backgroundColor: "#edeeef",
          fontWeight: "bold",
        },
        dayCol: { width: "14%", paddingHorizontal: 6 },
        timeCol: { width: "16%", paddingHorizontal: 6 },
        subjectCol: { width: "30%", paddingHorizontal: 6 },
        typeCol: { width: "14%", paddingHorizontal: 6 },
        profCol: { width: "26%", paddingHorizontal: 6 },
      });

      const days = slots.some((s) => s.day_of_week === 6)
        ? [0, 1, 2, 3, 4, 5, 6]
        : [...GRID_DAYS];

      const rows = days
        .map((day) => {
          const daySlots = slots
            .filter((s) => s.day_of_week === day)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
          return daySlots.length
            ? daySlots.map((s) => ({ day, slot: s }))
            : [{ day, slot: null as Slot | null }];
        })
        .flat();

      const doc = (
        <Document>
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>Emploi du temps — {className}</Text>
              <Text style={styles.subtitle}>Semaine du {weekLabel}</Text>
            </View>
            <View>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={styles.dayCol}>Jour</Text>
                <Text style={styles.timeCol}>Horaires</Text>
                <Text style={styles.subjectCol}>Matière</Text>
                <Text style={styles.typeCol}>Type</Text>
                <Text style={styles.profCol}>Professeurs</Text>
              </View>
              {rows.map(({ day, slot }, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.dayCol}>
                    {formatDayOfWeek(day)}
                  </Text>
                  <Text style={styles.timeCol}>
                    {slot
                      ? `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
                      : "—"}
                  </Text>
                  <Text style={styles.subjectCol}>{slot?.subject_name ?? ""}</Text>
                  <Text style={styles.typeCol}>
                    {slot ? courseTypeLabels[slot.type] : ""}
                  </Text>
                  <Text style={styles.profCol}>
                    {slot?.professors.map((p) => p.name).join(", ") ?? ""}
                  </Text>
                </View>
              ))}
            </View>
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

  return (
    <div className="flex items-center gap-2">
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
      <Button
        variant="secondary"
        onClick={handleExport}
        disabled={pending}
      >
        <Icon name="download" size={16} />
        {pending ? "Génération…" : "Exporter en PDF"}
      </Button>
    </div>
  );
}
