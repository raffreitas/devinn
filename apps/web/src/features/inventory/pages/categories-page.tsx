import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { Modal } from "@/shared/components/modal";
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
import { CategoryForm } from "../components/category-form";
import {
  useCreateRoomCategory,
  useRoomCategories,
  useUpdateRoomCategory,
} from "../hooks";
import type { Category, CategoryFormData } from "../types";

export function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const { data, isLoading } = useRoomCategories();
  const { createCategory, isLoading: isCreating } = useCreateRoomCategory();
  const { updateCategory, isLoading: isUpdating } = useUpdateRoomCategory();

  const handleCreateOrUpdate = (data: CategoryFormData) => {
    if (selectedCategory) {
      updateCategory({ id: selectedCategory.id, ...data });
    } else {
      createCategory(data);
    }
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      <LoadingOverlay isFetching={isLoading} position="top-bar" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Categorias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as categorias de acomodações
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
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
          ) : data && data.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-25 sm:w-auto">Nome</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Preço Base</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Descrição
                      </TableHead>
                      <TableHead className="w-25 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium truncate">
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
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nova Categoria"
        description={
          selectedCategory
            ? "Edite os detalhes da categoria."
            : "Preencha os detalhes para criar uma nova categoria."
        }
      >
        <CategoryForm
          initialData={selectedCategory}
          onCancel={handleCloseModal}
          onSubmit={handleCreateOrUpdate}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
}
