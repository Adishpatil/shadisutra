"use client";

import { Suspense, useState } from "react";
import { ContactForm } from "@/components/sections/ContactForm";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Dialog";

interface PlanEventSheetProps {
  initialService: string;
}

export function PlanEventSheet({ initialService }: PlanEventSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        Plan this event
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Plan this event"
        className="sm:max-w-2xl"
      >
        <Suspense fallback={<p className="text-base text-ink-muted">Loading enquiry form</p>}>
          <ContactForm initialService={initialService} />
        </Suspense>
      </Sheet>
    </>
  );
}
