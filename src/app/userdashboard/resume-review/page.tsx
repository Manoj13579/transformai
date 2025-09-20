"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResumeReview() {
  const [file, setFile] = useState<File | null>(null);
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [savedReviews, setSavedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAnother, setShowCreateAnother] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB PDF limit

  // Fetch saved reviews
  const getSavedReviews = async () => {
    try {
      const response = await axios.get("/api/aiuse/resume-review", {
        withCredentials: true,
      });
      if (response.data.success) {
        setSavedReviews(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error fetching reviews! Please try later");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getSavedReviews();
  }, []);

  // Upload resume and get review
  const handleResumeReview = async () => {
    if (!file) {
      toast.error("Please select a PDF resume");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 5 MB");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/aiuse/resume-review",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setReviewText(response.data.data);
        setShowCreateAnother(true);
        getSavedReviews();
        toast.success("Resume reviewed successfully!");
      }
    } catch (error: any) {
      if ([400, 403].includes(error.response?.status)) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error reviewing resume! Try again later.");
        console.error(error);
      }
    }
    setLoading(false);
  };

  
  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete("/api/aiuse/resume-review", {
        data: { _id },
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success("Review deleted");
        getSavedReviews();
      }
    } catch (error: any) {
      if ([400, 403, 404].includes(error.response?.status)) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting review! Please try later");
        console.error(error);
      }
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Resume Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p>Upload your resume (PDF only, max 5MB) to get instant AI feedback.</p>

        {/* Upload form (hidden after showing review) */}
        {!showCreateAnother && (
          <div className="space-y-3">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] ?? null;
                setFile(selectedFile);
              }}
            />
            <Button
              onClick={handleResumeReview}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Analyzing..." : "Upload & Get Review"}
            </Button>
          </div>
        )}

        {/* Current review result */}
        {reviewText && (
          <div className="border p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">AI Feedback:</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
              {reviewText}
            </p>
          </div>
        )}

        {/* Create another button */}
        {showCreateAnother && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setFile(null);
              setReviewText(null);
              setShowCreateAnother(false);
            }}
          >
            Review Another Resume
          </Button>
        )}

        {/* Saved reviews list */}
        {savedReviews.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Your Previous Reviews</h3>
            <div className="space-y-4">
              {savedReviews.map((item) => (
                <div
                  key={item._id}
                  className="p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">Resume Review</h4>
                      <p className="whitespace-pre-line mt-2 text-gray-700 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
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