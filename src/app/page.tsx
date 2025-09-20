"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-24 bg-gradient-to-b from-white to-gray-50">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          Create Smarter with <span className="text-primary">TransformAI</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg max-w-2xl text-gray-600"
        >
          Free AI tools for articles, blog titles, and resumes.  
          Unlock premium image features with Pro.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-8 flex gap-4"
        >
          <Button size="lg">
            <a href="/login">Start for Free</a>
          </Button>
          <Button size="lg" variant="outline">
            <a href="#features">See Features</a>
          </Button>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: "Article Generator", desc: "Generate structured articles instantly for free." },
            { title: "Blog Title Generator", desc: "Get engaging, SEO-friendly titles in seconds." },
            { title: "Resume Review", desc: "Improve your resume with AI-powered suggestions." },
            { title: "AI Image Generator", desc: "Create visuals with AI (Pro required)." },
            { title: "Background Remover", desc: "Remove image backgrounds (Pro required)." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>{f.desc}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="bg-gray-50 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Unlock Premium Tools</h2>
          <p className="text-gray-600 mb-8">
            Get access to AI image generation & background removal with Pro.
          </p>
          <Button size="lg">
            <a href="/login">View Pricing</a>
          </Button>
        </motion.div>
      </section>
    </main>
  );
}