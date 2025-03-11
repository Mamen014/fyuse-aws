import Image from "next/image";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card.jsx";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion.jsx";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "../components/ui/navigation-menu";
import { Sparkles, Star, CheckCircle } from "lucide-react";

// Import the client-side wrapper for VirtualTryOn
import VirtualTryOnWrapper from "../components/VirtualTryOnWrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Menu */}
      <nav className="fixed top-0 left-0 w-full bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Fyuse</h1>
          <NavigationMenu>
            <NavigationMenuList className="flex flex-row">
              <NavigationMenuItem className="basis-64">
                <NavigationMenuLink className="text-black basis-64" href="/">
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-black basis-64"
                  href="/features"
                >
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-black basis-64"
                  href="/about"
                >
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-black basis-64"
                  href="/contact"
                >
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center bg-gradient-to-r from-purple-700 to-pink-400 rounded-xl">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome to Fyuse
          </h1>
          <p className="mt-4 text-lg text-white leading-relaxed">
            The platform to recommend the best style for you.
          </p>
          <div className="mt-8">
            <Button className="rounded-md bg-primary px-6 py-3 text-black transition-all hover:bg-primary/90 bg-white">
              Get Started
            </Button>
          </div>
        </section>

        {/* Virtual Try-On Feature */}
        <section className="container mx-auto px-4 py-16">
          <VirtualTryOnWrapper />
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-primary">
            Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-gradient-to-r from-purple-700 to-pink-400 p-4 text-white">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                Upload Your Photo
              </h3>
              <p className="text-center text-muted-foreground leading-relaxed">
                Upload your photo and try on different styles
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-primary p-4 bg-gradient-to-r from-purple-700 to-pink-400 text-white">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                AI virtual try-on
              </h3>
              <p className="text-center text-muted-foreground leading-relaxed">
                Our AI technology will let you try clothes virtually
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-primary p-4 bg-gradient-to-r from-purple-700 to-pink-400 text-white">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                Ai style recommendation
              </h3>
              <p className="text-center text-muted-foreground leading-relaxed">
                Get style recommendations based on data and body shape
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-primary">
            FAQ
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-black">
                What is Fyuse?
              </AccordionTrigger>
              <AccordionContent className="text-black">
                Fyuse is a platform to recommend the best style for you.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-black">
                How secure is my data?
              </AccordionTrigger>
              <AccordionContent className="text-black">
                We use state-of-the-art security measures to ensure your data is
                safe and secure.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-primary">
            Testimonials
          </h2>
          <div className="flex flex-col items-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Alan Strike</CardTitle>
              </CardHeader>
              <CardContent>
                Fyuse has transformed the way we try clothes in our store, we
                can now recommend the best style for our customers by using
                Fyuse's AI technology.
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">CEO, Company</p>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 bg-background text-center text-muted-foreground">
        <p>&copy; 2025 Fyuse. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-4">
          <a
            href="https://www.instagram.com/fyuse.id/"
            className="text-primary hover:text-primary/90"
          >
            Instagram
          </a>
          {/* <a href="#" className="text-primary hover:text-primary/90">
            Twitter
          </a> */}
          <a
            href="https://www.linkedin.com/in/mzidanfatonie/"
            className="text-primary hover:text-primary/90"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
