import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { categoryService } from "../services/category-service";
import { CategoryFormDialog } from "../components/category-form-dialog";
import type { Category, CreateCategoryRequest } from "../types";

export function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso");
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Erro ao criar categoria");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryRequest }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria atualizada com sucesso");
      setDialogOpen(false);
      setSelectedCategory(undefined);
    },
    onError: () => {
      toast.error("Erro ao atualizar categoria");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir categoria");
    },
  });

  const handleSubmit = async (data: CreateCategoryRequest) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({ id: selectedCategory.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleNew = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Categorias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as categorias de acomodações
          </p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>
            Todas as categorias cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-50 sm:w-auto">Nome</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Preço Base</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Descrição
                      </TableHead>
                      <TableHead className="w-25 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>{category.capacity} Pessoas</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(category.basePrice)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma categoria cadastrada
              </p>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira categoria
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        category={selectedCategory}
      />
    </div>
  );
}
