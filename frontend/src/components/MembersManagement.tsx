import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Member, getMembers, saveMember, deleteMember, updateMember } from './api-helpers';

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '' });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      toast.error('Erro ao carregar membros');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
        toast.success('Membro atualizado com sucesso!');
      } else {
        await saveMember(formData);
        toast.success('Membro adicionado com sucesso!');
      }

      await loadMembers();
      setIsDialogOpen(false);
      setFormData({ name: '', role: '' });
      setEditingMember(null);
    } catch (error) {
      toast.error('Erro ao salvar membro');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ name: member.name, role: member.role });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      try {
        await deleteMember(id);
        toast.success('Membro excluído com sucesso!');
        await loadMembers();
      } catch (error) {
        toast.error('Erro ao excluir membro');
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', role: '' });
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Membros da Família</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMember(null)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Editar Membro' : 'Adicionar Novo Membro'}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? 'Atualize as informações do membro' : 'Adicione um novo membro da família'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Papel/Relação</Label>
                <Input
                  id="role"
                  placeholder="Ex: Pai, Mãe, Filho(a)"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingMember ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button onClick={handleDialogClose} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                Nenhum membro cadastrado. Clique em "Adicionar Membro" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle className="text-lg">{member.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Desde {new Date(member.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
