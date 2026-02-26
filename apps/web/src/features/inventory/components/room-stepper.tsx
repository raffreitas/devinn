import { cn } from "@/shared/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface RoomStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function RoomStepper({
  steps,
  currentStep,
  onStepClick,
}: RoomStepperProps) {
  return (
    <nav aria-label="Progresso" className="flex items-center gap-2 w-full">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && (isCompleted || isActive);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepClick?.(index)}
            disabled={!isClickable}
            className={cn(
              "flex items-center gap-2 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive && "bg-primary/10 text-primary border border-primary/20",
              isCompleted &&
                "bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer",
              !isActive &&
                !isCompleted &&
                "text-muted-foreground/50 cursor-default",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-muted-foreground/20 text-muted-foreground",
                !isActive &&
                  !isCompleted &&
                  "bg-muted-foreground/10 text-muted-foreground/50",
              )}
            >
              {isCompleted ? "✓" : index + 1}
            </span>
            <span className="hidden sm:inline truncate">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
