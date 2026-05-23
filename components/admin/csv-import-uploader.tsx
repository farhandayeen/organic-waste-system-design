'use client';

import { useState } from 'react';

interface CSVImportUploaderProps {
  uploadUrl: string;
  onSuccess?: (results: { success: number; failed: number; total: number }) => void;
}

export function CSVImportUploader({ uploadUrl, onSuccess }: CSVImportUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload gagal');
      }

      const normalized = {
        success: data.success ?? 0,
        failed: data.failed ?? 0,
        total: data.total ?? (data.success ?? 0) + (data.failed ?? 0),
      };
      setResults(normalized);
      onSuccess?.(normalized);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
          id="csv-upload-input"
        />
        <label htmlFor="csv-upload-input" className="cursor-pointer">
          <p className="font-semibold text-foreground mb-2">Upload file CSV</p>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Memproses...' : 'Klik untuk memilih file'}
          </p>
        </label>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

      {results && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Berhasil</p>
            <p className="text-lg font-bold text-primary">{results.success}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gagal</p>
            <p className="text-lg font-bold text-destructive">{results.failed}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{results.total}</p>
          </div>
        </div>
      )}
    </div>
  );
}
