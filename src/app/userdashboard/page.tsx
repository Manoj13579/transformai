import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const quickLinks = [
  { href: "/userdashboard/generate-article", title: "Write Article", desc: "Long-form content with AI" },
  { href: "/userdashboard/generate-blog-title", title: "Blog Title", desc: "Catchy SEO-friendly titles" },
  { href: "/userdashboard/generate-image", title: "Generate Image", desc: "Create images from prompts" },
  { href: "/userdashboard/remove-image-background", title: "Remove Background", desc: "Magic background eraser" },
  { href: "/userdashboard/resume-review", title: "Review Resume", desc: "ATS check & suggestions" },
];

export default function Page() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {quickLinks.map((q) => (
        <Card key={q.href} className="flex flex-col">
          <CardHeader>
            <CardTitle>{q.title}</CardTitle>
            <CardDescription>{q.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={q.href}>Open</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}