'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateCatalog } from '@/actions/content';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin/media-uploader';

type Catalog = { fileUrl: string; fileName: string | null } | null;

export function CatalogEditor({
  catalog,
  projectId,
}: {
  catalog: Catalog;
  projectId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [fileUrl, setFileUrl] = useState(catalog?.fileUrl ?? '');
  const [fileName, setFileName] = useState(catalog?.fileName ?? '');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fileUrl) {
      toast.error('Загрузите PDF-каталог');
      return;
    }
    startTransition(async () => {
      const res = await updateCatalog(projectId, { fileUrl, fileName });
      if (res.ok) toast.success('Каталог сохранён');
      else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Каталог планировок (PDF)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <MediaUploader value={fileUrl} onChange={setFileUrl} accept="application/pdf,.pdf" label="Загрузить PDF-каталог" />
          {fileUrl && (
            <div>
              <Label htmlFor="cat-name" className="text-xs">Имя файла</Label>
              <Input
                id="cat-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="mt-1"
                placeholder="vela-tower-catalog-2025.pdf"
              />
            </div>
          )}
          <Button type="submit" size="sm" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Сохранить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
