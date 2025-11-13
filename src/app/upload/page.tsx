"use client";
import React from "react";
import { uploadToCloudinary } from "../services/client/uploadService";

const UploadPage = () => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const url = await uploadToCloudinary(file);
        console.log("Uploaded image URL:", url);
        setImageUrl(url);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload Image to Cloudinary</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {loading && <p>Uploading...</p>}

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>Uploaded image:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            style={{ maxWidth: "300px", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadPage;
