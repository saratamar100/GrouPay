"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types/types";
import { useLoginStore } from "@/app/store/loginStore";
import { fetchAllUsers } from "@/app/services/client/userService";
import { createGroup } from "@/app/services/client/groupService";
import styles from "./CreateGroupForm.module.css";
import { Checkbox } from "@mui/material";

interface CreateGroupFormProps {}

export function CreateGroupForm({}: CreateGroupFormProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [notifications, setNotifications] = useState(false);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useLoginStore((state) => state.loggedUser);
  const currentUserId = currentUser ? currentUser.id : null;

  useEffect(() => {
    async function loadUsers() {
      setIsUsersLoading(true);
      try {
        const users = await fetchAllUsers();
        setAllUsers(users);
        setError(null);
      } catch (e) {
        console.error("Failed to load users for autocomplete:", e);
        setError((e as Error).message || "שגיאה כללית בטעינת משתמשים.");
      } finally {
        setIsUsersLoading(false);
      }
    }
    loadUsers();
  }, []);

  const selectedUsers = useMemo(() => {
    return selectedMemberIds
      .map((id) => allUsers.find((user) => user.id === id))
      .filter(Boolean) as User[];
  }, [selectedMemberIds, allUsers]);

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filteredSuggestions = allUsers.filter(
      (user) =>
        (user.name.toLowerCase().includes(value.toLowerCase()) ||
          user.email.toLowerCase().includes(value.toLowerCase())) &&
        !selectedMemberIds.includes(user.id) &&
        user.id !== currentUserId
    );

    setSuggestions(filteredSuggestions.slice(0, 5));
  };

  const handleSelectUser = (user: User) => {
    setSelectedMemberIds((prev) => [...prev, user.id]);
    setCurrentInput("");
    setSuggestions([]);
  };

  const handleRemoveUser = (userIdToRemove: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== userIdToRemove));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!currentUserId) {
      setError("לא ניתן לזהות משתמש מחובר. אנא התחבר/י שוב.");
      setIsLoading(false);
      return;
    }

    if (groupName.trim() === "") {
      setError("יש להזין שם קבוצה.");
      return;
    }
    const finalMemberIds = Array.from(
      new Set([...selectedMemberIds, currentUserId])
    );

    setIsLoading(true);
    setError(null);

    try {
      const createdGroup = await createGroup({
        name: groupName,
        memberIds: finalMemberIds,
        notifications: notifications ?? true,
        isActive: true,
      });

      router.push(`/groups/${createdGroup.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked: boolean = event.target.checked;
    setNotifications(isChecked);
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>יצירת קבוצה</h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="groupName" className={styles.label}>
            שם הקבוצה
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="הזן שם קבוצה"
            required
            disabled={isLoading}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="membersInput" className={styles.label}>
            משתתפים
          </label>

          {selectedUsers.length > 0 && (
            <div className={styles.pillsContainer}>
              {selectedUsers.map((user) => (
                <span key={user.id} className={styles.pill}>
                  {user.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={isLoading}
                    aria-label={`הסר את ${user.name}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className={styles.suggestionsContainer}>
            <input
              id="membersInput"
              type="text"
              value={currentInput}
              onChange={handleMemberInputChange}
              placeholder="הזן שם או מייל של משתתף..."
              disabled={isLoading}
              autoComplete="off"
              className={styles.input}
            />

            {suggestions.length > 0 && (
              <ul className={styles.suggestionsList}>
                {suggestions.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={styles.suggestionItem}
                  >
                    <strong>{user.name}</strong> ({user.email})
                  </li>
                ))}
              </ul>
            )}

            {currentInput.length > 0 && suggestions.length === 0 && (
              <div className={styles.noSuggestions}>
                לא נמצאו משתמשים או שכבר נוספו.
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              name="notifications"
              value="no"
              checked={notifications}
              onChange={handleCheckboxChange}
              className={styles.styledCheckbox}
            />
            מעוניין לקבל תזכורות חודשיות
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? "יוצר קבוצה..." : "צור קבוצה"}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
