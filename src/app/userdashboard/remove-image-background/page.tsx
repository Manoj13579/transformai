"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { Download, Trash2 } from "lucide-react";

type RemovedImage = {
  _id: string;
  content: string;
  prompt: string;
};

export default function RemoveImageBackground() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<RemovedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAnother, setShowCreateAnother] = useState(false);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

  // Fetch saved images
  const getSavedImages = async () => {
    try {
      const response = await axios.get("/api/aiuse/remove-image-background", {
        withCredentials: true,
      });
      if (response.data.success) {
        setSavedImages(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error fetching previous images!");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getSavedImages();
  }, []);

  // Upload and remove background
  const handleRemoveImageBackground = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 1 MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/aiuse/remove-image-background",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setResultUrl(response.data.data);
        setShowCreateAnother(true);
        getSavedImages();
        toast.success("Background removed!");
      }
    } catch (error: any) {
      if ([400, 403].includes(error.response?.status)) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error removing background! Try again later.");
        console.error(error);
      }
    }
    setLoading(false);
  };

  // Delete saved image
  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete("/api/aiuse/remove-image-background", {
        data: { _id },
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success("Image deleted");
        getSavedImages();
      }
    } catch (error: any) {
      if ([400, 403, 404].includes(error.response?.status)) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting image!");
        console.error(error);
      }
    }
  };

  // Download image
  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const extension = blob.type.split("/")[1] || "png";
      const suggestedName = `${filename}.${extension}`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = suggestedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image!");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Remove Image Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p>image size should be less than 1MB</p>
        {/* Upload form (hidden after processing) */}
        {!showCreateAnother && !resultUrl && (
          <div className="space-y-3">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] ?? null;
                setFile(selectedFile);
                setPreviewUrl(
                  selectedFile ? URL.createObjectURL(selectedFile) : null
                );
              }}
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-xl border mt-2"
              />
            )}
            <Button
              onClick={handleRemoveImageBackground}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Processing..." : "Remove Background"}
            </Button>
          </div>
        )}

        {/* Processed image */}
        {resultUrl && (
          <div className="border p-4 rounded-lg bg-gray-50 text-center">
            <img
              src={resultUrl}
              alt="Result"
              className="w-full rounded-xl border mb-3"
            />
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(resultUrl, "removed-bg-image")}
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          </div>
        )}

        {/* Create another button */}
        {showCreateAnother && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
              setResultUrl(null);
              setShowCreateAnother(false);
            }}
          >
            Create Another
          </Button>
        )}

        {/* Saved images */}
        {savedImages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Your Previous Background Removed Images
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedImages.map((item) => (
                <div
                  key={item._id}
                  className="p-2 border rounded-lg bg-white shadow-sm flex flex-col"
                >
                  <img
                    src={item.content}
                    alt={item.prompt}
                    className="w-full rounded-lg"
                  />
                  <p className="truncate text-sm mt-2">{item.prompt}</p>
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(item.content, `removed-bg-${item._id}`)
                      }
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}