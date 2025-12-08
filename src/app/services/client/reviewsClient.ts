import { Review } from "@/app/types/types";

export async function fetchReviews(): Promise<Review[]> {
  const res = await fetch("/api/reviews");
  const data = await res.json();
  return data.reviews;
}

export async function postReview(userName: string, content: string) {
  await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, content }),
  });
}


export async function deleteReview(reviewId: string) {

  console.log("Deleting review with ID:", reviewId);
  await fetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
