// app/blog/fit-over-trend/page.jsx

'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTAstyling from '@/components/ui/CTAstyling';

export default function FitOverTrendBlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 md:px-16 lg:px-32 pb-16 bg-background text-foreground font-body">
        {/* Page Title */}
        <h1 className="font-heading text-3xl md:text-5xl font-bold mb-6 leading-tight tracking-tight text-foreground">
          Look Better, Not Just Trendier: Why Fit Matters More Than Fashion
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-10">
          True style isn&apos;t about chasing trends. It&apos;s about wearing clothing that fits your body naturally.
          Discover how outfit matchness can elevate the way you look and feel.
        </p>

        {/* Blog Sections */}
        <section className="space-y-12 text-base sm:text-lg leading-relaxed text-foreground">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-4 tracking-tight text-foreground">
              Fashion Is Loud. Fit Is Quiet—But Powerful.
            </h2>
            <p>
              In today&apos;s fast-paced world of trends and hashtags, it&apos;s easy to feel like you have to keep up.
              New collections drop every month. Influencers shift styles every week.
              But here&apos;s a quiet truth: <strong>clothing that truly fits you will always look better than clothing that&apos;s simply “in.”</strong>
            </p>
            <p className="mt-4">
              Style isn&apos;t about following—it&apos;s about understanding. Understanding what shapes work with <em>your</em> shape.
              What lengths balance <em>your</em> proportions. What colors reflect <em>your</em> tone.
              When an outfit is in harmony with your body, you don&apos;t just wear it — you own it.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-4 tracking-tight text-foreground">
              Matching Clothes to Your Body Changes Everything
            </h2>
            <p>
              There&apos;s a difference between “wearing something trendy” and “wearing something that flatters you.”
              One can make you blend in. The other can make you shine.
            </p>
            <p className="mt-4">
              When clothing matches your physical appearance—your frame, your height, your skin tone, your posture—
              it brings out your natural presence. It highlights what&apos;s already there, rather than hiding it under fast fashion noise.
            </p>
            <p className="mt-4">
              Think about it: Have you ever worn something simple, yet received more compliments than when you wore something “on-trend”?
              That&apos;s the power of fit.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-4 tracking-tight text-foreground">
              It&apos;s Not About Dressing Up — It&apos;s About Dressing Right
            </h2>
            <p>
              Personal style isn&apos;t about overthinking. It&apos;s about choosing pieces that feel right on your body—
              where sleeves fall just where they should, where the waistline flatters instead of fights,
              where you feel confident <em>without trying too hard</em>.
            </p>
            <p className="mt-4">
              Outfits that match your appearance give you ease. They reflect effortlessness.
              And in that space between comfort and elegance—that&apos;s where real style lives.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-4 tracking-tight text-foreground">
              The Right Clothing Doesn&apos;t Just Fit. It Belongs.
            </h2>
            <p>
              You don&apos;t need a closet full of trending items.
              You need a few pieces that <strong>feel like they were made for you</strong>.
            </p>
            <p className="mt-4">
              Because when the fit is right, everything else follows: your confidence, your comfort, your energy.
              And that&apos;s something no trend can replace.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <p className="text-base sm:text-lg mb-2 text-muted-foreground">
            At FYUSE, we believe the best outfits are the ones that work <em>with</em> you, not against you.
          </p>
          <CTAstyling />
        </div>
      </main>
      <Footer />
    </>
  );
}
