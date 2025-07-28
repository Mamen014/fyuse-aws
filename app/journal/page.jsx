'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTAstyling from '@/components/ui/CTAstyling';

export default function BlogIndexPage() {
  const blogs = [
    {
      slug: 'fit-over-trend',
      title: 'Look Better, Not Just Trendier',
      excerpt: 'Why matching your outfit to your body matters more than chasing trends.',
      date: 'June 2025',
    },
    // Add more blogs here
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-24 px-4 sm:px-6 md:px-16 lg:px-32 pb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
          The Style Journal: Style with Intention
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-10">
          Insights, reflections, and principles to help you dress with more purpose—and less pressure.
        </p>

        <section className="space-y-10">
          {blogs.map((blog) => (
            <article key={blog.slug} className="border-b border-border pb-6">
              <Link href={`/journal/${blog.slug}`}>
                <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-2 hover:underline hover:text-primary transition">
                  {blog.title}
                </h2>
              </Link>
              <p className="text-muted-foreground text-base sm:text-lg mb-2">{blog.excerpt}</p>
              <span className="text-sm text-muted-foreground">{blog.date}</span>
            </article>
          ))}
        </section>

        <div className="mt-20 text-center">
          <p className="text-base sm:text-lg mb-6 text-muted-foreground">
            Curious how FYUSE can match outfits to your unique shape?
          </p>
          <CTAstyling />
        </div>
      </main>

      <Footer />
    </div>
  );
}
