"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-error/10 text-error">
          <Icon name="error_outline" size={28} />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quelque chose s&apos;est mal passé. Réessayez ou revenez à l&apos;accueil.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset}>Réessayer</Button>
          <Button variant="ghost" render={<Link href="/" />}>
            <Icon name="arrow_back" size={16} />
            Revenir à l&apos;accueil
          </Button>
        </div>
      </Card>
    </main>
  );
}