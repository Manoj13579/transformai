"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

export default function GenerateArticle() {
  const [article, setArticle] = useState(""); // current generated article
  const [articleLength, setArticleLength] = useState(500);
  const [articleTitle, setArticleTitle] = useState("");
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAnother, setShowCreateAnother] = useState(false);

  // Fetch user’s previous articles
  const getSavedArticles = async () => {
    try {
      const response = await axios.get("/api/aiuse/generate-article", {
        withCredentials: true,
      });
      if (response.data.success) {
        setSavedArticles(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error fetching articles! Please try later");
        console.error("Error fetching articles:", error);
      }
    }
  };

  useEffect(() => {
    getSavedArticles();
  }, []);

  // Generate article
  const handleGenerateArticle = async () => {
    if (!articleTitle) {
      toast.error("Please enter article title");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/aiuse/generate-article",
        { prompt: `Generate article based on the following title: ${articleTitle}`, length: articleLength },
        { withCredentials: true }
      );
      if (response.data.success) {
        setArticle(response.data.data);
        setShowCreateAnother(true);
        getSavedArticles(); // refresh list
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error generating article! Please try later");
        console.error("Error generating article:", error);
      }
    }
    setLoading(false);
  };

  // Delete article
  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete("/api/aiuse/generate-article", {
        data: { _id },
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success("Article deleted");
        getSavedArticles();
      }
    } catch (error: any) {
      if ([400, 403, 404].includes(error.response?.status)) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting article! Please try later");
        console.error("Error deleting article:", error);
      }
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">AI Article Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input form (hidden when showing generated article) */}
        {!showCreateAnother && (
          <div className="space-y-3">
            <textarea
              className="w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your article title here..."
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enter article length in words (min 10):
              </label>
              <Input
                type="number"
                min={10}
                className="mt-1"
                value={articleLength}
                onChange={(e) => setArticleLength(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleGenerateArticle}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Article"}
            </Button>
          </div>
        )}

        {/* Generated article display */}
        {article && (
          <div className="border p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">{articleTitle}</h3>
            <p className="whitespace-pre-line leading-relaxed text-gray-800">
              {article}
            </p>
          </div>
        )}

        {/* Create another button */}
        {showCreateAnother && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setArticle("");
              setArticleTitle("");
              setShowCreateAnother(false);
            }}
          >
            Create Another Article
          </Button>
        )}

        {/* Saved articles list */}
        {savedArticles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Your Previous Articles</h3>
            <div className="space-y-4">
              {savedArticles.map((item) => (
                <div
                  key={item._id}
                  className="p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{item.prompt}</h4>
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