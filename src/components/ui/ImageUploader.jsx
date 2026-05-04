"use client";
import { useRef } from "react";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

export default function ImageUploader({ images = [], onChange, maxImages = 5 }) {
  const { upload, uploading, error } = useCloudinaryUpload();
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    const urls = [];
    for (const file of toUpload) {
      const url = await upload(file);
      if (url) urls.push(url);
    }
    if (urls.length) onChange([...images, ...urls]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files)} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-indigo-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-500 font-medium">Click or drag to upload</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP · Max {maxImages} images</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">⚠️ {error}</p>}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-video bg-gray-50">
              <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                ×
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-1.5 py-0.5">
                <p className="text-white text-xs truncate">{i + 1}/{images.length}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
