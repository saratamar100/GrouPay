"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types/types";

import styles from "./CreateGroupForm.module.css";

interface CreateGroupFormProps {
  allUsers: User[];
  // currentUserId: string; //  להוסיף בעתיד
}

export function CreateGroupForm({ allUsers }: CreateGroupFormProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        !selectedMemberIds.includes(user.id)
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

    if (groupName.trim() === "") {
      setError("יש להזין שם קבוצה.");
      return;
    }
    if (selectedMemberIds.length === 0) {
      setError("יש לבחור לפחות משתתף אחד.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          memberIds: selectedMemberIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create group");
      }

      const createdGroup = await response.json();
      router.push(`/group/${createdGroup.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
