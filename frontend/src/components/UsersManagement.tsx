import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserPlus, Trash2, Edit, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi, rolesApi, ApiUser, ApiRole } from './api-service';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { isAdmin } from './auth-service';

export default function UsersManagement() {
  // Verifica se o usuário é admin
  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar o gerenciamento de usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    selectedRoles: [] as number[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersPagedData, rolesData] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
      ]);
      setUsers(usersPagedData.content);
      setRoles(rolesData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error('A senha é obrigatória para novos usuários');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.selectedRoles.length === 0) {
      toast.error('Selecione pelo menos uma role');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    try {
      setIsLoading(true);
      const userData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        roles: formData.selectedRoles.map(id => ({ id })),
      };
      
      // Só inclui password se foi fornecida
      if (formData.password && formData.password.trim() !== '') {
        userData.password = formData.password.trim();
      }

      if (editingUser) {
        await usersApi.update(editingUser.id, userData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // No create, password é obrigatória (já validado acima)
        await usersApi.create(userData);
        toast.success('Usuário criado com sucesso!');
      }

      await loadData();
      handleDialogClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao salvar usuário';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: ApiUser) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      selectedRoles: user.roles.map(r => r.id),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      setIsLoading(true);
      await usersApi.delete(id);
      toast.success('Usuário excluído com sucesso!');
      await loadData();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      selectedRoles: [],
    });
    setEditingUser(null);
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleId)
        ? prev.selectedRoles.filter(id => id !== roleId)
        : [...prev.selectedRoles, roleId],
    }));
  };

  const getRoleName = (roleId: number, roleAuthority?: string) => {
    if (roleAuthority) return roleAuthority;
    const role = roles.find(r => r.id === roleId);
    return role?.authority || `Role ${roleId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2>Gerenciamento de Usuários</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadData}
            disabled={isLoading}
            title="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)} disabled={isLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Atualize as informações do usuário. Deixe a senha em branco para não alterá-la.'
                  : 'Preencha os dados para criar um novo usuário'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    placeholder="Digite o nome"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome *</Label>
                  <Input
                    id="lastName"
                    placeholder="Digite o sobrenome"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite o email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Digite o telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Senha {editingUser ? '(opcional)' : '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={editingUser ? 'Deixe em branco para não alterar' : 'Digite a senha'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar Senha {editingUser ? '(opcional)' : '*'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Roles (Permissões) *
                </Label>
                <div className="border rounded-lg p-4 space-y-3">
                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma role disponível</p>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {role.authority}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleDialogClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && users.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Adicionar Usuário" para começar
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm truncate">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline">Sem roles</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {getRoleName(role.id, role.authority)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
