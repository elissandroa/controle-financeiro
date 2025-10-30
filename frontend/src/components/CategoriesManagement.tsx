import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Plus, Trash2, Pencil, Tag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { categoriesApi, ApiCategory } from './api-service';

interface CategoriesManagementProps {
  onCategoryChange?: () => void;
}

export default function CategoriesManagement({ onCategoryChange }: CategoriesManagementProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ApiCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      if (editingCategory) {
        // Atualizar categoria existente
        await categoriesApi.update(editingCategory.id, categoryName.trim());
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        await categoriesApi.create(categoryName.trim());
        toast.success('Categoria criada com sucesso!');
      }
      
      await loadCategories();
      resetForm();
      setIsDialogOpen(false);
      
      // Notificar componente pai que houve mudança
      if (onCategoryChange) {
        onCategoryChange();
      }
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast.error(error.message || 'Erro ao salvar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: ApiCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (category: ApiCategory) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setIsLoading(true);
    try {
      await categoriesApi.delete(deletingCategory.id);
      toast.success('Categoria excluída com sucesso!');
      await loadCategories();
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
      
      // Notificar componente pai que houve mudança
      if (onCategoryChange) {
        onCategoryChange();
      }
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast.error(error.message || 'Erro ao excluir categoria. Ela pode estar em uso.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setEditingCategory(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Gerenciar Categorias
            </CardTitle>
            <CardDescription>
              Crie e gerencie categorias para suas transações
            </CardDescription>
          </div>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Atualize o nome da categoria' 
                    : 'Digite o nome da nova categoria'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nome da Categoria</Label>
                  <Input
                    id="categoryName"
                    placeholder="Ex: Vestuário, Alimentação, Transporte..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma categoria cadastrada</p>
            <p className="text-sm mt-1">Clique em "Nova Categoria" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{category.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    disabled={isLoading}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"?
                <br />
                <strong className="text-destructive">
                  Esta ação não pode ser desfeita. Transações usando esta categoria podem ser afetadas.
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isLoading ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
