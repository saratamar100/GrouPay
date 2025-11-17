export function getUserFromLocal() {
  try {
    const raw = localStorage.getItem("login-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const user = parsed?.state?.loggedUser;

    if (!user?._id || !user?.name) return null;

    return {
      id: user._id,
      name: user.name,
    };
  } catch {
    return null;
  }
}
