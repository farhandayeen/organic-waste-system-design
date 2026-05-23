'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ManualDepositFormProps {
  onSubmit: (data: any) => Promise<void>;
  onSuccess: () => void;
}

export function ManualDepositForm({ onSubmit, onSuccess }: ManualDepositFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    memberId: '',
    submittedAt: new Date().toISOString().split('T')[0],
    weight: '',
    category: 'organic',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        weight: parseFloat(formData.weight),
      });
      onSuccess();
      setFormData({
        memberId: '',
        submittedAt: new Date().toISOString().split('T')[0],
        weight: '',
        category: 'organic',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Member ID</Label>
        <Input
          type="text"
          required
          value={formData.memberId}
          onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
          placeholder="e.g., MEM-001"
        />
      </div>

      <div>
        <Label>Tanggal Setor</Label>
        <Input
          type="date"
          required
          value={formData.submittedAt}
          onChange={(e) => setFormData({ ...formData, submittedAt: e.target.value })}
        />
      </div>

      <div>
        <Label>Berat (kg)</Label>
        <Input
          type="number"
          step="0.1"
          required
          min="0"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          placeholder="5.5"
        />
      </div>

      <div>
        <Label>Kategori</Label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-md"
        >
          <option value="organic">Organik Umum</option>
          <option value="leaves">Daun-Daun</option>
          <option value="fruits">Buah & Sayur</option>
          <option value="meat">Daging/Ikan</option>
        </select>
      </div>

      <div>
        <Label>Catatan</Label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-md text-sm"
          rows={3}
          placeholder="Catatan admin..."
        />
      </div>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Menyimpan...' : 'Simpan Setor'}
      </Button>
    </form>
  );
}
