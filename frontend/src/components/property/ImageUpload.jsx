import { useState } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';
import { api } from '../../lib/api';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

export default function ImageUpload({ propertyId, images = [], onUpdate }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.upload(`/properties/${propertyId}/images`, formData);
      }
      onUpdate?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await api.delete(`/properties/${propertyId}/images/${imageId}`);
      onUpdate?.();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5 text-error" />
            </button>
            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
              <GripVertical className="h-3 w-3" />
              {img.position + 1}
            </span>
          </div>
        ))}
      </div>

      <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:border-primary/40 transition-colors">
        {uploading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <Upload className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-muted">Upload images</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}
