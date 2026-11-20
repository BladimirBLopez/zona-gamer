'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  X
} from 'lucide-react';
import {
  ACCEPTED,
  MAX_PHOTOS,
  MAX_PICK,
  MAX_UPLOAD,
  prepareImage
} from './photo-tools';

let counter = 0;

const smallBtn =
  'flex h-9 flex-1 items-center justify-center rounded-lg bg-white/10 text-gray-200 transition active:scale-95 disabled:opacity-30';

function Tile({ item, index, total, disabled, onMove, onCover, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.key, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-xl border bg-white/5 ${
        isDragging
          ? 'border-accent shadow-2xl'
          : index === 0
            ? 'border-accent'
            : 'border-white/10'
      }`}
    >
      <div className="relative aspect-square bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.preview}
          alt={`Fotografía ${index + 1}`}
          draggable={false}
          className="h-full w-full object-contain"
        />

        {index === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
            Portada
          </span>
        )}

        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label="Arrastrar para ordenar"
          style={{ touchAction: 'none' }}
          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-black/65 text-white disabled:opacity-40"
        >
          <GripVertical size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 p-1.5">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={disabled || index === 0}
          aria-label="Mover antes"
          className={smallBtn}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={disabled || index === total - 1}
          aria-label="Mover después"
          className={smallBtn}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => onCover(index)}
          disabled={disabled || index === 0}
          aria-label="Hacer portada"
          className={smallBtn}
        >
          <Star size={15} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disabled}
          aria-label="Quitar fotografía"
          className="flex h-9 flex-1 items-center justify-center rounded-lg bg-red-500/15 text-red-300 transition active:scale-95 disabled:opacity-30"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function PhotoManager({
  items,
  onChange,
  onError,
  onPreparing,
  disabled
}) {
  const inputRef = useRef(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [preparing, setPreparing] = useState(0);
  const locked = disabled || preparing > 0;

  useEffect(() => {
    if (onPreparing) onPreparing(preparing > 0);
  }, [preparing, onPreparing]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  async function onPick(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    const problems = [];
    let badFiles = 0;
    const valid = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type) || file.size > MAX_PICK) {
        badFiles += 1;
      } else {
        valid.push(file);
      }
    }

    if (badFiles) {
      problems.push(
        `${badFiles} archivo${badFiles === 1 ? '' : 's'} omitido${
          badFiles === 1 ? '' : 's'
        }: usa JPG, PNG o WebP de hasta 25 MB.`
      );
    }

    const room = MAX_PHOTOS - itemsRef.current.length;
    const accepted = valid.slice(0, Math.max(0, room));

    if (valid.length > accepted.length) {
      problems.push(`Máximo ${MAX_PHOTOS} fotografías por producto.`);
    }

    setPreparing(accepted.length);

    const added = [];

    for (const file of accepted) {
      const ready = await prepareImage(file);

      if (ready.size > MAX_UPLOAD) {
        problems.push('Una fotografía es demasiado pesada y se omitió.');
      } else {
        counter += 1;
        added.push({
          key: `n${counter}`,
          file: ready,
          local: true,
          preview: URL.createObjectURL(ready)
        });
      }

      setPreparing((n) => Math.max(0, n - 1));
    }

    setPreparing(0);

    if (added.length) onChange([...itemsRef.current, ...added]);

    onError(problems.join(' '));
  }

  function onDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;

    const from = items.findIndex((i) => i.key === active.id);
    const to = items.findIndex((i) => i.key === over.id);

    if (from < 0 || to < 0) return;

    onChange(arrayMove(items, from, to));
  }

  const move = (index, delta) => {
    onChange(arrayMove(items, index, index + delta));
  };

  const makeCover = (index) => {
    onChange(arrayMove(items, index, 0));
  };

  const remove = (index) => {
    const item = items[index];

    if (item?.local) URL.revokeObjectURL(item.preview);

    onChange(items.filter((_, i) => i !== index));
    onError('');
  };

  const empty = items.length === 0;

  return (
    <div className="space-y-2">
      <DndContext
        id="zg-photos"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.key)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {items.map((item, index) => (
              <Tile
                key={item.key}
                item={item}
                index={index}
                total={items.length}
                disabled={locked}
                onMove={move}
                onCover={makeCover}
                onRemove={remove}
              />
            ))}

            {items.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={locked}
                aria-label="Agregar fotografías"
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 text-gray-300 transition active:scale-[0.98] disabled:opacity-60 ${
                  empty
                    ? 'col-span-2 aspect-[4/3] sm:col-span-3'
                    : 'aspect-square'
                }`}
              >
                {preparing > 0 ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span className="text-xs font-semibold">
                      Preparando {preparing}...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-neon">
                      <ImagePlus size={22} />
                    </span>
                    <span className="text-xs font-semibold">
                      Agregar fotografías
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {items.length}/{MAX_PHOTOS}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
