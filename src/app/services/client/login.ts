export const addUser = async (userData: any): Promise<boolean> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      console.error("Failed to add user:", response.statusText);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error adding user:", error);
    return false;
  }
};
