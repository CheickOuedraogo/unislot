import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-tertiary/10 text-tertiary">
          <Icon name="search_off" size={28} />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Page introuvable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Button render={<Link href="/" />}>
            <Icon name="arrow_back" size={16} />
            Revenir à l&apos;accueil
          </Button>
        </div>
      </Card>
    </main>
  );
}