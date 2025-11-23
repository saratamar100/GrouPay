"use client";
import { useEffect, useState } from "react";

export function useFilePreview(initialUrl?: string | null) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialUrl ?? null
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl(initialUrl ?? null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file, initialUrl]);

  return { file, previewUrl, setFile };
}
