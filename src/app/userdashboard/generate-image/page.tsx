"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import toast from "react-hot-toast";
import { Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GeneratedImage {
  _id: string;
  prompt: string;
  image: string;
};

export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAnother, setShowCreateAnother] = useState(false);






  // Fetch previous images
  const getSavedImages = async () => {
    try {
      const response = await axios.get("/api/aiuse/generate-image", {
        withCredentials: true,
      });
      if (response.data.success) {
        setSavedImages(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error fetching images! Please try later");
        console.error("Error fetching images:", error);
      }
    }
  };

  useEffect(() => {
    getSavedImages();
  }, []);

  // Generate new image
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/aiuse/generate-image",
        { prompt },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCurrentImage(response.data.data);
        setShowCreateAnother(true);
        getSavedImages();
        toast.success("Image generated!");
      }
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error generating image! Please try later");
        console.error("Error generating image:", error);
      }
    }
    setLoading(false);
  };

  // Delete image
  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete("/api/aiuse/generate-image", {
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
        toast.error("Error deleting image! Please try later");
        console.error("Error deleting image:", error);
      }
    }
  };

  // Download image in local machine
  const handleDownload = async (url: string, filename: string) => {
  try {
    // Fetch the image as a blob
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();

    // Determine file extension from blob type
    const extension =
      blob.type.split("/")[1] || filename.split(".").pop() || "png";
    const suggestedName = filename.includes(".")
      ? filename
      : `${filename}.${extension}`;

    // Create temporary link and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = suggestedName; // browser manages where to save
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(blobUrl);

    // Optional toast
    toast.success("Image downloaded!");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download image!");
  }
};


  return (
    <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">AI Image Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input form (hidden when showing generated image) */}
        {!showCreateAnother && (
          <div className="space-y-3">
            <Input
              className="w-full rounded-xl border p-3"
              placeholder="Describe the image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateImage}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Image"}
            </Button>
          </div>
        )}

        {/* Generated image display */}
        {currentImage && (
          <div className="border p-4 rounded-lg bg-gray-50 text-center">
            <img
              src={currentImage}
              alt="Generated"
              className="w-full rounded-xl border mb-3"
            />
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDownload(currentImage, "generated-image.png")
                }
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
              setCurrentImage(null);
              setPrompt("");
              setShowCreateAnother(false);
            }}
          >
            Create Another Image
          </Button>
        )}

        {/* Saved images list */}
        {savedImages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Your Previous Generated Images
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedImages.map((item) => (
                <div
                  key={item._id}
                  className="p-2 border rounded-lg bg-white shadow-sm flex flex-col"
                >
                  <img
                    src={item.image}
                    alt={item.prompt}
                    className="w-full rounded-lg"
                  />
                  <p className="truncate text-sm mt-2">{item.prompt}</p>
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(item.image, `ai-image-${item._id}.png`)
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