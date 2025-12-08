"use client";

import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Container } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoginStore } from "@/app/store/loginStore";
import { Review } from "@/app/types/types";
import Header from "@/app/components/Header/Header";
import { fetchReviews, postReview, deleteReview } from "@/app/services/client/reviewsClient";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import styles from "./reviews.module.css";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // למודל
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const loggedUser = useLoginStore((state) => state.loggedUser);
  const MAIL_USER = process.env.NEXT_PUBLIC_MAIL_USER; 

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const data = await fetchReviews();
    setReviews(data);
  };

  const submitReview = async () => {
    if (!content) return;

    await postReview(isAnonymous ? "" : loggedUser?.name || "", content);
    setContent("");
    setShowInput(false);
    await loadReviews();
  };

  // פותח את המודאל עם ה-id של הביקורת למחיקה
  const confirmDelete = (id: string) => {
    setReviewToDelete(id);
    setModalOpen(true);
  };

  // מאשר מחיקה
  const handleDelete = async () => {
    if (reviewToDelete) {
      await deleteReview(reviewToDelete);
      await loadReviews();
    }
    setModalOpen(false);
    setReviewToDelete(null);
  };

  // מבטל מחיקה
  const handleCancel = () => {
    setModalOpen(false);
    setReviewToDelete(null);
  };

  return (
    <>
      <Header />

      <Container maxWidth="md" className={styles.reviewsContainer}>
        <Typography variant="h4" className={styles.reviewsTitle}>
          ביקורות
        </Typography>

        {!loggedUser && (
          <Typography className={styles.notLoggedText}>
            כדי להוסיף ביקורת צריך להתחבר.
          </Typography>
        )}

        <Box>
          {reviews.map((rev) => (
            <Box
              key={rev._id}
              className={styles.reviewCard}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography className={styles.reviewUserName}>
                  {rev.userName || "Anonymous"}
                </Typography>
                <Typography className={styles.reviewContent}>
                  {rev.content}
                </Typography>
              </Box>

              {loggedUser?.email === MAIL_USER && (
                <Button
                  onClick={() => confirmDelete(rev._id)}
                  size="small"
                  style={{ marginLeft: "8px" }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              )}
            </Box>
          ))}
        </Box>

        {loggedUser && !showInput && (
          <Box className={styles.addButtonBox}>
            <Button
              variant="contained"
              onClick={() => setShowInput(true)}
              className={styles.addButton}
            >
              +
            </Button>
          </Box>
        )}

        {loggedUser && showInput && (
          <Box className={styles.reviewInputBox}>
            <TextField
              label="הביקורת שלך"
              fullWidth
              multiline
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.reviewTextField}
            />

            <label className={styles.anonymousCheckbox}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="mr-2"
              />
              פרסום אנונימי
            </label>

            <Button
              variant="contained"
              onClick={submitReview}
              className={styles.submitButton}
            >
              פרסם
            </Button>
          </Box>
        )}
      </Container>

      {/* מודאל מחיקה */}
      <CustomModal open={modalOpen} onClose={handleCancel}>
        <Typography variant="h6" style={{ marginBottom: "16px" }}>
          האם אתה בטוח שברצונך למחוק את הביקורת הזו?
        </Typography>
        <Box style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="contained" onClick={handleCancel}>
            ביטול
          </Button>
          <Button variant="contained" onClick={handleDelete}>
            מחק
          </Button>
        </Box>
      </CustomModal>
    </>
  );
}
