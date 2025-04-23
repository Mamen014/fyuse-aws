export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-background text-foreground p-8 rounded shadow-lg max-w-6xl w-[90vw] overflow-y-auto max-h-[90vh] relative border border-primary">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground hover:text-cta text-xl font-bold"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-cta">
          FYUSE – Terms and Conditions of Use
        </h1>
        <div className="prose prose-lg max-w-none space-y-4">
          <div className="text-lg">Last Updated: [April 09, 2025]</div>
          <ol className="space-y-4">
            <li>
              <strong className="text-xl text-primary">
                Acceptance of Terms and Conditions
              </strong>
              <div className="text-lg text-foreground">
                By accessing and using FYUSE (“Platform”), you agree to these
                Terms and Conditions (“Terms”). If you do not agree, please do
                not use our services.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">Scope of Services</strong>
              <div className="text-lg text-foreground">
                FYUSE provides the following services:
                <ul className="list-disc ml-6 space-y-2">
                  <li>Virtual try-on services through the upload of personal photos.</li>
                  <li>Intelligent clothing visualization and fit analysis.</li>
                  <li>Features to save and manage try-on results in your “Digital Wardrobe”.</li>
                  <li>Tools to assist in style decision-making and share outfits with others.</li>
                </ul>
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">User Eligibility</strong>
              <div className="text-lg text-foreground">
                Users must be at least 18 years old or have valid parental/guardian consent to use this service.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">
                User Data Protection and Privacy
              </strong>
              <ol className="list-decimal ml-6 space-y-2">
                <li>
                  <strong className="text-lg text-primary">
                    Collection of Personal Data
                  </strong>
                  <div className="text-lg text-foreground">
                    We collect and process personal data such as: body photos, clothing images, try-on result images, and user preferences.
                  </div>
                </li>
                <li>
                  <strong className="text-lg text-primary">Purpose of Data Usage</strong>
                  <div className="text-lg text-foreground">
                    Data is used to provide services, personalize experiences, store try-on results, and analyze services in anonymized forms.
                  </div>
                </li>
                <li>
                  <strong className="text-lg text-primary">Data Storage and Retention</strong>
                  <div className="text-lg text-foreground">
                    Data is securely stored on cloud servers and only retained for as long as necessary.
                  </div>
                </li>
                <li>
                  <strong className="text-lg text-primary">User Consent and Control</strong>
                  <div className="text-lg text-foreground">
                    Users can access, update, delete, or withdraw consent for the use of their data.
                  </div>
                </li>
                <li>
                  <strong className="text-lg text-primary">Data Sharing with Third Parties</strong>
                  <div className="text-lg text-foreground">
                    Data is not sold or rented. It is shared only with authorized service providers or legal authorities as required by law.
                  </div>
                </li>
                <li>
                  <strong className="text-lg text-primary">Data Protection Standards</strong>
                  <div className="text-lg text-foreground">
                    We adhere to data privacy laws with principles of transparency, data minimization, and data security.
                  </div>
                </li>
              </ol>
            </li>
            <li>
              <strong className="text-xl text-primary">Intellectual Property Rights</strong>
              <div className="text-lg text-foreground">
                All content and technology on FYUSE are protected by intellectual property laws.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">Account Responsibility</strong>
              <div className="text-lg text-foreground">
                Users are responsible for the security of their accounts.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">Prohibited Use</strong>
              <div className="text-lg text-foreground">
                Using the platform for illegal activities or violating the rights of others is prohibited.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">
                Changes and Termination of Service
              </strong>
              <div className="text-lg text-foreground">
                FYUSE reserves the right to modify or terminate services with prior notice.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">Limitation of Liability</strong>
              <div className="text-lg text-foreground">
                FYUSE is not liable for indirect or incidental damages.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">Governing Law</strong>
              <div className="text-lg text-foreground">
                Subject to the laws of the Republic of Indonesia.
              </div>
            </li>
            <li>
              <strong className="text-xl text-primary">Contact Information</strong>
              <div className="text-lg text-foreground">
                Contact: Ryan Iaska, Founder of FYUSE
              </div>
              <div className="text-lg text-foreground">Email: ryaniaska14@gmail.com</div>
              <div className="text-lg text-foreground">WhatsApp: +62 813 8448 1108</div>
            </li>
            <li>
              <strong className="text-xl text-primary">Terms Updates</strong>
              <div className="text-lg text-foreground">
                Continued use of FYUSE indicates agreement to updates to these Terms.
              </div>
            </li>
          </ol>
          <div className="mt-4">
            <strong className="text-xl text-primary">Consent Statement</strong>
            <div className="text-lg text-foreground">
              By using FYUSE, you consent to the collection and use of your personal data in accordance with applicable data privacy laws.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}