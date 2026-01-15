import {
  Droplet,
  Zap,
  Flame,
  Wifi,
  Wrench,
  Users,
  Package,
  Megaphone,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import type { ExpenseCategory } from "../types";

const categoryConfig: Record<
  ExpenseCategory,
  { label: string; icon: typeof Droplet; color: string }
> = {
  water: { label: "Água", icon: Droplet, color: "text-blue-500" },
  electricity: { label: "Energia", icon: Zap, color: "text-yellow-500" },
  gas: { label: "Gás", icon: Flame, color: "text-orange-500" },
  internet: { label: "Internet", icon: Wifi, color: "text-purple-500" },
  maintenance: { label: "Manutenção", icon: Wrench, color: "text-gray-500" },
  salaries: { label: "Funcionários", icon: Users, color: "text-green-500" },
  supplies: { label: "Suprimentos", icon: Package, color: "text-indigo-500" },
  marketing: { label: "Marketing", icon: Megaphone, color: "text-pink-500" },
  taxes: { label: "Impostos", icon: FileText, color: "text-red-500" },
  other: { label: "Outros", icon: MoreHorizontal, color: "text-gray-400" },
};

interface ExpenseListProps {
  expensesByCategory: Record<ExpenseCategory, number>;
  totalExpenses: number;
}

export function ExpenseList({
  expensesByCategory,
  totalExpenses,
}: ExpenseListProps) {
  // Sort categories by amount (descending)
  const sortedCategories = (
    Object.keys(expensesByCategory) as ExpenseCategory[]
  )
    .filter((category) => expensesByCategory[category] > 0)
    .sort((a, b) => expensesByCategory[b] - expensesByCategory[a]);

  if (sortedCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma despesa registrada neste período
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedCategories.map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const amount = expensesByCategory[category];
        const percentage =
          totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

        return (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="font-medium">{config.label}</span>
              </div>
              <span className="font-semibold">R$ {amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}

      <div className="pt-3 border-t">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span>R$ {totalExpenses.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
