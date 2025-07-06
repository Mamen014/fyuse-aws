import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8 text-center">
      <p>&copy; 2025 FYUSE. All rights reserved.</p>
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/features">Features</Link>
        <Link href="/journal">Journal</Link>
      </div>
    </footer>
  );
};

export default Footer;
