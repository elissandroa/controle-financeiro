/**
 * Tela de Reset de Senha
 * 
 * IMPORTANTE: Este componente NÃO valida o token.
 * A validação do token (validade, expiração, uso único) é responsabilidade do BACKEND.
 * 
 * Responsabilidades deste componente:
 * - Receber token como prop (extraído da URL pelo App.tsx)
 * - Validar formato de senha (UX, não segurança)
 * - Enviar token + senha para o backend
 * - Exibir resposta do backend (sucesso ou erro)
 * 
 * O backend é quem decide se o token é válido ou não.
 */
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { passwordRecoveryApi } from './api-service';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordScreenProps {
  token: string; // Token extraído da URL - será validado pelo backend
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResetPasswordScreen({ token, onSuccess, onCancel }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Log para debug
  console.log('[ResetPasswordScreen] Componente renderizado com token:', token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!password.trim()) {
      toast.error('Digite a nova senha');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setIsLoading(true);
      await passwordRecoveryApi.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Senha alterada com sucesso!');
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast.error(error.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl">Senha Alterada!</h3>
                <p className="text-sm text-muted-foreground">
                  Sua senha foi redefinida com sucesso.
                </p>
                <p className="text-sm text-muted-foreground">
                  Você será redirecionado para o login...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>Digite sua nova senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 pr-9"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Dica:</strong> Escolha uma senha forte com letras, números e caracteres especiais.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
