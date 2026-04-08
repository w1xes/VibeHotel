import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../../services/propertyService';
import ImageUpload from '../../components/property/ImageUpload';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';

const typeOptions = [
  { value: 'house', label: 'House' },
  { value: 'suite', label: 'Suite' },
  { value: 'room', label: 'Room' },
];

const emptyForm = {
  title: '',
  type: 'house',
  description: '',
  price: '',
  capacity: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  amenities: '',
  featured: false,
};

export default function AdminProperties() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', {}],
    queryFn: () => getProperties(),
  });

  const createMut = useMutation({
    mutationFn: createProperty,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateProperty(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      title: p.title,
      type: p.type,
      description: p.description,
      price: String(p.price),
      capacity: String(p.capacity),
      bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms),
      area: String(p.area),
      amenities: p.amenities.join(', '),
      featured: p.featured,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };

    if (editing) {
      updateMut.mutate({ id: editing, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target?.value ?? e.target?.checked ?? e }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border bg-surface/50">
              <tr>
                {['Image', 'Title', 'Type', 'Price', 'Capacity', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {properties?.map((p) => (
                <tr key={p.id} className="hover:bg-surface/30">
                  <td className="px-4 py-3">
                    <img src={p.images[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 capitalize">{p.type}</td>
                  <td className="px-4 py-3">${p.price}</td>
                  <td className="px-4 py-3">{p.capacity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-surface transition-colors cursor-pointer"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this property?')) deleteMut.mutate(p.id); }}
                        className="rounded-lg p-1.5 text-text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Property' : 'New Property'} className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <Input label="Title" value={form.title} onChange={set('title')} required />
          <Select label="Type" options={typeOptions} value={form.type} onChange={set('type')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price ($/night)" type="number" value={form.price} onChange={set('price')} required />
            <Input label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={set('bedrooms')} />
            <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={set('bathrooms')} />
            <Input label="Area (m²)" type="number" value={form.area} onChange={set('area')} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-muted">Description</label>
            <textarea
              rows="3"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              value={form.description}
              onChange={set('description')}
              required
            />
          </div>
          <Input label="Amenities (comma-separated)" value={form.amenities} onChange={set('amenities')} />
          {editing && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-muted">Images</label>
              <ImageUpload
                propertyId={editing}
                images={properties?.find((p) => p.id === editing)?.imageObjects || []}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['properties'] })}
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="rounded border-border"
            />
            Featured property
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {editing ? 'Save Changes' : 'Create Property'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
