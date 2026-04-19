"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewContribution } from "./actions";

interface Props {
  id: string;
  targetType: string;
  targetId: string;
  field: string;
  newValue: unknown;
}

export function ReviewButtons({ id, targetType, targetId, field, newValue }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function act(action: "approve" | "reject") {
    startTransition(async () => {
      await reviewContribution(id, action, targetType, targetId, field, newValue);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={pending}
        className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200 disabled:opacity-40"
      >
        Approve & apply
      </button>
      <button
        onClick={() => act("reject")}
        disabled={pending}
        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-40"
      >
        Reject
      </button>
    </div>
  );
}
