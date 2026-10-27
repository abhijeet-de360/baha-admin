import { Loader2 } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        </div>
      </div>
  );
}

export { Spinner };
