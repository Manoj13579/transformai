"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import toast from "react-hot-toast";

export default function GenerateBlogTitle() {
  const [article, setArticle] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [savedTitles, setSavedTitles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAnother, setShowCreateAnother] = useState(false);

  const prompt = `Generate catchy blog titles based on the following article: ${article}`;

  // Fetch user’s previous blog titles
  const getSavedBlogTitles = async () => {
    try {
      const response = await axios.get("/api/aiuse/generate-blog-title", {
        withCredentials: true,
      });
      if (response.data.success) {
        setSavedTitles(response.data.data);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        toast.error(error.response.data.message);
      }
      else {
        toast.error("Error in fetching blog titles! Please try later");
        console.error("Error fetching blog titles:", error);
      }
    }
  };

  useEffect(() => {
    getSavedBlogTitles();
  }, []);

  const handleGenerateBlogTitle = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/aiuse/generate-blog-title",
        { prompt },
        { withCredentials: true }
      );

      if (response.data.success) {
        const cleanedTitles = response.data.data
          .split("\n")
          .map((line: string) =>
            line.replace(/^\*+|\*+$/g, "").replace(/\*\*/g, "").trim()
          )
          .filter((line: string) => line.length > 0);

        setTitles(cleanedTitles);
        setShowCreateAnother(true);
        getSavedBlogTitles();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        toast.error(error.response.data.message);
      }
      else {
        toast.error("Error in generating blog title! Please try later");
        console.error("Error generating blog title:", error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete("/api/aiuse/generate-blog-title", {
        data: { _id},
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success("Blog title deleted");
        getSavedBlogTitles();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400 || error.response.status === 403 || error.response.status === 404) {
        toast.error(error.response.data.message);
      }
      else {
        toast.error("Error in deleting blog title! Please try later");
        console.error("Error deleting blog title:", error);
      }
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">AI Blog Title Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input for article */}
        {!showCreateAnother && (
          <>
            <textarea
              className="w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Write your article or topic here..."
              value={article}
              onChange={(e) => setArticle(e.target.value)}
            />
            <Button
              onClick={handleGenerateBlogTitle}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Blog Titles"}
            </Button>
          </>
        )}

        {/* Generated titles */}
        {titles.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="text-lg font-semibold">Suggested Titles:</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              {titles.map((title, index) => (
                <li key={index}>{title}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Create another button */}
        {showCreateAnother && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setArticle("");
              setTitles([]);
              setShowCreateAnother(false);
            }}
          >
            Create Another Title
          </Button>
        )}

        {/* Saved titles list */}
        {savedTitles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Your Previous Titles</h3>
            <div className="space-y-3">
              {savedTitles.map((item) => (
                <div
                  key={item._id}
                  className="p-3 border rounded-lg flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.content}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Article: {item.prompt}
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
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}