import { CheckIcon, ChevronsUpDown, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { useCreateExpenseCategory } from "../hooks/use-expense-categories";
import type { ExpenseCategory } from "../types";

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  categories: ExpenseCategory[];
}

export function CategorySelect({
  value,
  onChange,
  categories,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { createCategory, isLoading: isCreating } = useCreateExpenseCategory();

  const selectedCategory = categories.find((c) => c.id === value);

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hasExactMatch = filteredCategories.some(
    (opt) => opt.name.toLowerCase() === search.toLowerCase(),
  );
  const showCreateOption =
    search.trim() && !hasExactMatch && search.trim().length > 0;

  const handleCreate = async (name: string) => {
    if (!name.trim()) return;
    try {
      const newCategory = await createCategory(name.trim());
      onChange(newCategory.id);
      setOpen(false);
      setSearch("");
    } catch (error) {
      console.error("Failed to create category", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] truncate"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {selectedCategory ? (
              selectedCategory.name
            ) : (
              <span className="text-muted-foreground">
                Selecione uma categoria...
              </span>
            )}
          </span>
          <ChevronsUpDown
            className="text-muted-foreground/80 shrink-0"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-full min-w-(--radix-popper-anchor-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Selecione uma categoria..."
            onValueChange={setSearch}
            value={search}
          />

          <CommandList>
            <CommandEmpty className="p-1">
              {search.trim() ? (
                <Button
                  type="button"
                  className="w-full justify-start p-1.5! px-2! font-normal text-accent-foreground h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreate(search.trim());
                  }}
                  variant="ghost"
                  disabled={isCreating}
                >
                  <PlusIcon className="mr-2 size-4 text-muted-foreground" />
                  {isCreating
                    ? "Criando..."
                    : `Criar categoria "${search.trim()}"`}
                </Button>
              ) : (
                <p className="text-muted-foreground text-center text-sm py-2">
                  Nenhuma categoria encontrada.
                </p>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {option.name}
                  {value === option.id && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleCreate(search.trim())}
                    disabled={isCreating}
                  >
                    <PlusIcon className="mr-2 size-4" />
                    {isCreating
                      ? "Criando..."
                      : `Criar categoria "${search.trim()}"`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
