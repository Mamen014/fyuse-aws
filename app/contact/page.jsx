// "use client";

// import React from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import Footer from "@/components/Footer";
// import Navbar from "@/components/Navbar";

// export default function Contact() {
//   return (
//     <div>
//       <div className="min-h-screen bg-background text-foreground">
//         <Navbar />
//         <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto font-sans space-y-12">
//           {/* Title */}
//           <motion.div
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center"
//           >
//             <h1 className="text-4xl md:text-5xl font-bold text-primary">
//               Contact FYUSE
//             </h1>
//             <p className="mt-4 text-lg text-foreground max-w-2xl mx-auto">
//               Have questions, feedback, or just want to say hi? We’d love to
//               hear from you!
//             </p>
//           </motion.div>

//           {/* Send Us an Email Button */}
//           <div className="flex justify-center mb-8">
//             <a
//               href="mailto:ryaniaska14@gmail.com"
//               className="bg-cta hover:bg-primary text-cta-foreground px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform text-lg"
//             >
//               Send Us an Email 📩
//             </a>
//           </div>

//           {/* Contact Info Card */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             className="bg-background border border-cta rounded-2xl shadow-xl p-8 space-y-6"
//           >
//             <h2 className="text-2xl font-semibold text-primary">
//               Get in Touch
//             </h2>

//             <div className="space-y-4 text-lg text-foreground">
//               <p>
//                 <span className="font-semibold text-primary">
//                   Contact Person:
//                 </span>{" "}
//                 Ryan Iaska, Founder of FYUSE
//               </p>
//               <p>
//                 <span className="font-semibold text-primary">Email:</span>{" "}
//                 <a
//                   href="mailto:ryaniaska14@gmail.com"
//                   className="text-cta hover:underline"
//                 >
//                   ryaniaska14@gmail.com
//                 </a>
//               </p>
//               <p>
//                 <span className="font-semibold text-primary">WhatsApp:</span>{" "}
//                 <a
//                   href="https://wa.me/6281384481108"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-cta hover:underline"
//                 >
//                   +62 813 8448 1108
//                 </a>
//               </p>
//             </div>
//           </motion.div>

//           {/* Back to Home (Arrow Icon) */}
//           {/* <Link href="/" passHref>
//             <button
//               type="button"
//               className="text-foreground text-lg hover:text-cta transition-colors flex items-center gap-2"
//               aria-label="Back to Home"
//             >
//               ← Back to Home
//             </button>
//           </Link> */}
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// }


"use client";

import React, { useState } from "react";
import Link from "next/link"; // Assuming you might use Link elsewhere
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";



// --- Contact Form Component ---
const ContactForm = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  // State for submission status (loading, success, error)
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null, // Store error message if any
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear status on new input
    setStatus({ loading: false, success: false, error: null });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setStatus({ loading: true, success: false, error: null }); // Set loading state

    // --- !!! BACKEND INTEGRATION POINT !!! ---
    // Replace this with your actual API call to your backend endpoint
    // Your backend endpoint will handle saving the data to DynamoDB
    try {
      // Example: Using fetch to POST data to your API endpoint
      // const response = await fetch('/api/contact', { // Your API route
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Something went wrong');
      // }

      const apiUrl = 'API_GATEWAY_INVOKE_URL/contact'; // <-- PASTE YOUR URL HERE

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // Send form data as JSON
      });

      const result = await response.json(); // Parse the JSON response from Lambda

      if (!response.ok || !result.success) {
          // Throw an error if response status is not OK or if Lambda indicated failure
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // --- MOCK DELAY (REMOVE THIS) ---
      // await new Promise(resolve => setTimeout(resolve, 1500));
      // --- END MOCK DELAY ---

      // If the API call is successful:
      console.log("Form submitted successfully via API:", result);
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: "", email: "", message: "" }); // Clear form

      // Optional: Hide success message after a few seconds
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);

      // If the API call is successful:
    //   console.log("Form submitted successfully:", formData);
    //   setStatus({ loading: false, success: true, error: null });
    //   setFormData({ name: "", email: "", message: "" }); // Clear form

    //   // Optional: Hide success message after a few seconds
    //   setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);

    } catch (error) {
      console.error("Form submission error:", error);
      setStatus({ loading: false, success: false, error: error.message || "Failed to send message. Please try again." });
    }
    // --- !!! END BACKEND INTEGRATION POINT !!! ---
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }} // Slightly later delay
      className="bg-background border border-cta rounded-2xl shadow-xl p-8 space-y-6"
    >
      <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
        Send Us a Message 
      </h2>

      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition duration-200"
          placeholder="John Doe"
          disabled={status.loading} // Disable when loading
        />
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Your Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition duration-200"
          placeholder="john.doe@example.com"
          disabled={status.loading} // Disable when loading
        />
      </div>

      {/* Message Textarea */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-foreground">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition duration-200 resize-none" // Added resize-none
          placeholder="How can we help you?"
          disabled={status.loading} // Disable when loading
        ></textarea>
      </div>

      {/* Submit Button & Status Messages */}
      <div className="text-center pt-4">
        {/* Success Message */}
        {status.success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 mb-4 text-sm"
          >
            Message sent successfully! We'll get back to you soon.
          </motion.p>
        )}

        {/* Error Message */}
        {status.error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 mb-4 text-sm"
          >
            Error: {status.error}
          </motion.p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.loading} // Disable button when loading
          className={`bg-cta hover:bg-primary text-cta-foreground px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform text-lg font-semibold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${
            status.loading ? 'animate-pulse' : '' // Add pulse animation when loading
          }`}
        >
          {status.loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </motion.form>
  );
};


// --- Main Contact Page Component ---
export default function Contact() {
  return (
    <div> {/* Outer div might be needed for layout/styling */}
      <div className="min-h-screen bg-background text-foreground font-sans"> {/* Added font-sans here */}
        <Navbar />
        <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto space-y-12">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Contact FYUSE
            </h1>
            <p className="mt-4 text-lg text-foreground max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hi? We’d love to
              hear from you!
            </p>
          </motion.div>

          <ContactForm />

        </main>
      </div>
      <Footer />
    </div>
  );
}
