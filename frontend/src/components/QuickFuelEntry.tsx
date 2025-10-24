import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Fuel, Calculator } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Member, getMembers, saveTransaction } from './data-service';

interface QuickFuelEntryProps {
  onSuccess?: () => void;
}

export default function QuickFuelEntry({ onSuccess }: QuickFuelEntryProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    liters: '',
    kilometers: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadedMembers = getMembers();
    setMembers(loadedMembers);
    if (loadedMembers.length > 0) {
      setFormData(prev => ({ ...prev, memberId: loadedMembers[0].id }));
    }
  }, []);

  const consumption = formData.liters && formData.kilometers
    ? (parseFloat(formData.kilometers) / parseFloat(formData.liters)).toFixed(2)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memberId) {
      toast.error('Selecione um membro');
      return;
    }

    const amount = parseFloat(formData.amount);
    const liters = parseFloat(formData.liters);
    const kilometers = parseFloat(formData.kilometers);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (isNaN(liters) || liters <= 0) {
      toast.error('Digite a quantidade de litros');
      return;
    }

    if (isNaN(kilometers) || kilometers <= 0) {
      toast.error('Digite os quilômetros percorridos');
      return;
    }

    const transaction = {
      type: 'expense' as const,
      amount,
      category: 'Abastecimento',
      description: formData.description || `Abastecimento - ${liters.toFixed(2)}L`,
      date: formData.date,
      memberId: formData.memberId,
      fuelData: {
        liters,
        kilometers,
        consumption: parseFloat(consumption!),
      },
    };

    saveTransaction(transaction);
    toast.success(`Abastecimento registrado! Consumo: ${consumption} km/l`);
    
    // Reset form
    setFormData({
      memberId: members[0]?.id || '',
      amount: '',
      liters: '',
      kilometers: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Cadastre um membro da família primeiro para registrar abastecimentos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fuel-member">Membro</Label>
              <Select value={formData.memberId} onValueChange={(v) => setFormData({ ...formData, memberId: v })}>
                <SelectTrigger id="fuel-member">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel-date">Data</Label>
              <Input
                id="fuel-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fuel-amount">Valor (R$)</Label>
              <Input
                id="fuel-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel-liters">Litros</Label>
              <Input
                id="fuel-liters"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel-km">Km Percorridos</Label>
              <Input
                id="fuel-km"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.kilometers}
                onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                required
              />
            </div>
          </div>

          {consumption && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm">Consumo calculado</p>
                <p className="text-blue-600">{consumption} km/l</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fuel-description">Descrição (opcional)</Label>
            <Input
              id="fuel-description"
              placeholder="Ex: Posto Shell, BR 101"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            <Fuel className="w-4 h-4 mr-2" />
            Registrar Abastecimento
          </Button>
        </form>
    </div>
  );
}
