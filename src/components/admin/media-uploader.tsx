'use client';

import { useCallback, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  className?: string;
};

export function MediaUploader({ value, onChange, accept = 'image/*', label, className }: Props) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Не удалось загрузить файл');
        }
        const data = await res.json();
        onChange(data.url);
        toast.success('Файл загружен');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {value ? (
           
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label ?? 'Загрузить медиа'}</p>
        <div className="flex items-center gap-2 mt-1">
          <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary cursor-pointer">
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            <span>{uploading ? 'Загрузка…' : 'Загрузить'}</span>
            <input
              type="file"
              accept={accept}
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.currentTarget.value = '';
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
