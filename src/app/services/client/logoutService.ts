export async function fetchLogout(){
 const res = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });  
    if (!res.ok) {
        throw new Error("Failed to logout");
  }
  return res.json();
}
