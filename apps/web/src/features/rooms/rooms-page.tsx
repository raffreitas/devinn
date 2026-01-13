import { useState } from 'react';
import { useRoomCategories, useRooms } from '@/features/rooms/api/rooms-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Hotel } from 'lucide-react';
import { RoomCategoryDialog } from './components/room-category-dialog';
import { RoomDialog } from './components/room-dialog';
import type { Room, RoomCategory } from '@/types';

export function RoomsPage() {
  const { data: categories = [], isLoading: loadingCategories } = useRoomCategories();
  const { data: rooms = [], isLoading: loadingRooms } = useRooms();
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | undefined>();
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();

  const handleEditCategory = (category: RoomCategory) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(undefined);
  };

  const handleCloseRoomDialog = () => {
    setRoomDialogOpen(false);
    setEditingRoom(undefined);
  };

  const getRoomsByCategory = (categoryId: string) => {
    return rooms.filter(room => room.category_id === categoryId);
  };

  const getStatusBadgeVariant = (status: Room['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Room['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'maintenance':
        return 'Manutenção';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  };

  if (loadingCategories || loadingRooms) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quartos e Categorias</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as categorias e unidades da sua pousada
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
          <Button onClick={() => setRoomDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Novo Quarto
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Hotel className="mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg font-medium">Nenhuma categoria cadastrada</p>
              <p className="mb-4 text-sm text-gray-500">
                Comece criando uma categoria de quartos
              </p>
              <Button onClick={() => setCategoryDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => {
            const categoryRooms = getRoomsByCategory(category.id);
            
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {category.name}
                        <Badge variant="secondary">
                          Até {category.max_capacity} pessoas
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {category.description || 'Sem descrição'}
                      </CardDescription>
                      <div className="mt-3 flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Preço base: </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(category.base_price)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pessoa extra: </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(category.extra_person_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Quartos ({categoryRooms.length})
                      </h4>
                    </div>
                    
                    {categoryRooms.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center">
                        <p className="text-sm text-gray-500">
                          Nenhum quarto cadastrado nesta categoria
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {categoryRooms.map((room) => (
                          <div
                            key={room.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {room.name || `Quarto ${room.number}`}
                              </div>
                              <Badge
                                variant={getStatusBadgeVariant(room.status)}
                                className="mt-1 text-xs"
                              >
                                {getStatusLabel(room.status)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <RoomCategoryDialog
        open={categoryDialogOpen}
        onClose={handleCloseCategoryDialog}
        category={editingCategory}
      />

      <RoomDialog
        open={roomDialogOpen}
        onClose={handleCloseRoomDialog}
        room={editingRoom}
        categories={categories}
      />
    </div>
  );
}
