import { useState } from "react";

const CLOUD_NAME    = "dsrmkwxbm";
const UPLOAD_PRESET = "ticket_uploads";
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
      return data.secure_url;
    } catch (err) {
      setError(err.message || "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
