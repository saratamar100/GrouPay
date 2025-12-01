"use client";

import { useState, useMemo, useEffect } from "react";
import type { User } from "@/app/types/types";
import { updateUserProfile } from "@/app/services/client/profileService";
import { uploadToCloudinary } from "@/app/services/client/uploadService";

type DraftUser = Pick<User, "name">;
type Errors = Partial<Record<keyof DraftUser, string>>;
type Touched = Partial<Record<keyof DraftUser, boolean>>;

export function useProfile(user: User | null) {
  const [canEdit, setCanEdit] = useState(false);

  const [drafts, setDrafts] = useState<DraftUser>({
    name: user?.name ?? "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [focused, setFocused] = useState<keyof DraftUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDrafts({
      name: user?.name ?? "",
    });
    setErrors({});
    setTouched({});
  }, [user?.name]);

  const dirty = useMemo(
    () => !!user && drafts.name !== user.name,
    [drafts, user]
  );

  const validate = (field: keyof DraftUser, value: string) => {
    if (field === "name") {
      return value.trim().length ? "" : "שם הוא שדה חובה";
    }
    return "";
  };

  const validateAll = () => {
    const next: Errors = {};
    (["name"] as (keyof DraftUser)[]).forEach((f) => {
      const msg = validate(f, drafts[f]);
      if (msg) next[f] = msg;
    });
    setErrors(next);
    setTouched({ name: true });
    return Object.keys(next).length === 0;
  };

  const handleChange = (field: keyof DraftUser, value: string) => {
    setDrafts((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const msg = validate(field, value);
      setErrors((prev) => ({ ...prev, [field]: msg || undefined }));
    }
  };

  const handleFocus = (field: keyof DraftUser) => setFocused(field);

  const handleBlur = (field: keyof DraftUser) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const msg = validate(field, drafts[field]);
    setErrors((prev) => ({ ...prev, [field]: msg || undefined }));
    setFocused(null);
  };

  const save = async (avatarFile?: File | null) => {
    if (!user) return { success: false, user: null };

    if (!dirty && !avatarFile) return { success: true, user };

    if (!validateAll()) return { success: false, user: null };

    setSaving(true);

    let uploadedAvatarUrl: string | undefined;

    if (avatarFile) {
      try {
        uploadedAvatarUrl = await uploadToCloudinary(avatarFile);
      } catch {
        setSaving(false);
        return { success: false, user: null };
      }
    }

    const response = await updateUserProfile(
      user.id,
      drafts.name,
      uploadedAvatarUrl ?? undefined
    );

    setSaving(false);

    if (!response.success) {
      return { success: false, user: response.user ?? null };
    }

    setCanEdit(false);
    return response;
  };

  return {
    canEdit,
    setCanEdit,
    drafts,
    setDrafts,
    errors,
    touched,
    focused,
    saving,
    dirty,
    handleChange,
    handleBlur,
    handleFocus,
    save,
  };
}
