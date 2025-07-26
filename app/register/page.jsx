// app/register/page.jsx

'use client';

import { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { Country, City } from 'country-state-city';
import dynamic from 'next/dynamic';
import LoadingModalSpinner from '@/components/ui/LoadingState';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

// Dynamically import Select with no SSR
const DynamicSelect = dynamic(() => import('react-select'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
  ),
});

export default function RegisterAI() {
  const router = useRouter();
  const { user, isLoading, signinRedirect } = useAuth();
  const userEmail = user?.profile?.email;
  const countrySelectId = useId();
  const citySelectId = useId();

  const [formData, setFormData] = useState({
    nickname: '',
    birthdate: '',
    phone_number: '',
    country: '',
    city: '',
    occupation: '',
    customOccupation: '',
  });

  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countryCode, setCountryCode] = useState('+62');
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  const occupationOptions = [
    { label: "Student", value: "Student" },
    { label: "Content Creator", value: "Content Creator" },
    { label: "Consultant", value: "Consultant" },
    { label: "Software Engineer", value: "Software Engineer" },
    { label: "Product Manager", value: "Product Manager" },
    { label: "Fashion Stylist", value: "Fashion Stylist" },
    { label: "Entrepreneur", value: "Entrepreneur" },
    { label: "Engineer", value: "Engineer" },
    { label: "Banker", value: "Banker" },
    { label: "Sales Executive", value: "Sales Executive" },
    { label: "Lawyer", value: "Lawyer" },
    { label: "HR Professional", value: "HR Professional" },
    { label: "Marketing Specialist", value: "Marketing Specialist" },
    { label: "Accountant", value: "Accountant" },
    { label: "Designer", value: "Designer" },
    { label: "Civil Servant", value: "Civil Servant" },
    { label: "Lecturer", value: "Lecturer" },
    { label: "Doctor", value: "Doctor" },
    { label: "Nurse", value: "Nurse" },
    { label: "Teacher", value: "Teacher" },
    { label: "Freelancer", value: "Freelancer" },
    { label: "Other", value: "Other" },
  ];

  useEffect(() => {
    setIsClient(true);
    setIsCheckingRedirect(false);
  }, []);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);
    
  useEffect(() => {
    if (!isClient) return;

    const loadCountries = () => {
      const allCountries = Country.getAllCountries();
      const formattedCountries = allCountries.map(country => ({
        value: country.isoCode,
        label: country.name,
        phonecode: country.phonecode,
      })).sort((a, b) => a.label.localeCompare(b.label));
      setCountryOptions(formattedCountries);
      return formattedCountries;
    };

    const resolveLocation = async (latitude, longitude, countryList) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
        const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`);
        const data = await res.json();
        const components = data.results?.[0]?.components || {};

        const countryName = components.country;
        const cityName = components.city || components.town || components.village || "";

        const matchedCountry = countryList.find(c => c.label === countryName);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setFormData(prev => ({ ...prev, country: matchedCountry.label }));
          setCountryCode("+" + matchedCountry.phonecode);

          const cities = City.getCitiesOfCountry(matchedCountry.value) || [];
          const formattedCities = cities.map(city => ({
            value: city.name,
            label: city.name,
          }));
          setCityOptions(formattedCities);

          const matchedCity = formattedCities.find(c => c.label.toLowerCase() === cityName.toLowerCase());
          if (matchedCity) {
            setSelectedCity(matchedCity);
            setFormData(prev => ({ ...prev, city: matchedCity.label }));
          }
        }
      } catch (err) {
        console.error("Failed reverse geocoding:", err);
      }
    };

    const fallbackIpLocation = async (countryList) => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const matchedCountry = countryList.find(c => c.label === data.country_name);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setFormData(prev => ({ ...prev, country: matchedCountry.label }));
          setCountryCode("+" + matchedCountry.phonecode);

          const cities = City.getCitiesOfCountry(matchedCountry.value) || [];
          const formattedCities = cities.map(city => ({
            value: city.name,
            label: city.name,
          }));
          setCityOptions(formattedCities);

          const matchedCity = formattedCities.find(c => c.label.toLowerCase() === data.city.toLowerCase());
          if (matchedCity) {
            setSelectedCity(matchedCity);
            setFormData(prev => ({ ...prev, city: matchedCity.label }));
          }
        }
      } catch (err) {
        console.error("IP location fallback failed:", err);
      }
    };

    const setupLocation = async () => {
      const countryList = loadCountries();

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolveLocation(latitude, longitude, countryList);
        },
        (error) => {
          console.warn("Geolocation failed or denied, falling back to IP", error);
          fallbackIpLocation(countryList);
        },
        { timeout: 8000 }
      );
    };

    setupLocation();

    // Restore privacy agreement if exists
    if (userEmail) {
      const storedAgreement = localStorage.getItem(`privacyAgreement:${userEmail}`);
      if (storedAgreement === "true") {
        setAgreeToPrivacy(true);
      }
    }
  }, [isClient, userEmail]);


  const isFormValid = () => {
    return (
      formData.nickname.trim() !== "" &&
      formData.birthdate !== "" &&
      selectedCountry &&
      selectedCity &&
      formData.phone_number.trim() !== "" &&
      formData.occupation !== "" &&
      (formData.occupation !== "Other" || formData.customOccupation.trim() !== "") &&
      agreeToPrivacy
    );
  };

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setFormData(prev => ({ ...prev, country: selectedOption.label }));
    setCountryCode('+' + selectedOption.phonecode);

    const cities = City.getCitiesOfCountry(selectedOption.value) || [];
    const formattedCities = cities.map(city => ({
      value: city.name,
      label: city.name,
    })).sort((a, b) => a.label.localeCompare(b.label));

    setCityOptions(formattedCities);
    setSelectedCity(null);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setFormData(prev => ({ ...prev, city: selectedOption?.label || '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Loading || isSubmitting) return;

    setIsCheckingRedirect(true);
    setLoading(true);
    setIsSubmitting(true);

    // ✅ Require custom occupation if "Other" is selected
    if (
      formData.occupation === "Other" &&
      !formData.customOccupation.trim()
    ) {
      alert("Please specify your occupation.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // ✅ Determine final occupation
    const finalOccupation =
      formData.occupation === "Other"
        ? formData.customOccupation
        : formData.occupation;

    // ✅ Format full phone number
    const fullPhoneNumber = `${countryCode}${formData.phone_number}`;

    // ✅ Merge data including normalized occupation
    const updatedFormData = {
      ...formData,
      phone_number: fullPhoneNumber,
      occupation: finalOccupation, // ← overwrite with correct value
    };

    // ✅ Convert all string fields to lowercase (except some)
    const lowercasedPayload = Object.fromEntries(
      Object.entries(updatedFormData).map(([key, value]) => {
        const skip = ["nickname", "user_image_url", "phone_number"];
        if (typeof value === "string" && !skip.includes(key)) {
          return [key, value.toLowerCase()];
        }
        return [key, value];
      })
    );

    try {
      // ✅ Send API request
      fetch("/api/register-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lowercasedPayload),
      });

      // ✅ Redirect based on register source
      const registerFrom = localStorage.getItem("registerFrom");
      if (registerFrom === "dashboard") {
        router.push("/dashboard");
      } else if (registerFrom === "physical-appearances") {
        router.push("personalized-styling/physical-appearances");
      }

      localStorage.removeItem("showRegister");
      localStorage.removeItem("registerFrom");
    } catch (err) {
      console.error("Failed to save registration data:", err);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (isCheckingRedirect) {
    return <LoadingModalSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0B1F63]">Register</h2>
        </div>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-sm text-blue-900 rounded-lg">
          <strong>One-time setup:</strong> Tell us a bit about yourself so we can recommend outfits that truly fit you.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your nickname"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthdate
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            {isClient ? (
              <DynamicSelect
                instanceId={countrySelectId}
                options={countryOptions}
                value={selectedCountry}
                onChange={handleCountryChange}
                placeholder="Select a country"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            ) : (
              <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            {isClient ? (
              <DynamicSelect
                instanceId={citySelectId}
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder="Select a city"
                isDisabled={!selectedCountry}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            ) : (
              <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={countryCode}
                className="w-16 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="relative z-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <DynamicSelect
              instanceId="occupation-select"
              options={occupationOptions}
              value={occupationOptions.find(opt => opt.value === formData.occupation)}
              onChange={(selected) => {
                setFormData(prev => ({
                  ...prev,
                  occupation: selected?.value || ""
                }));
              }}
              placeholder="Select an occupation"
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={typeof window !== "undefined" ? document.body : null}
              menuPosition="fixed"
              required
            />

            {/* Note for "Other" selection */}
            <p className="text-xs text-gray-500 mt-1">
              Don’t see your occupation? Select <strong>&quot;Other&quot;</strong> to type your own.
            </p>

            {formData.occupation === "Other" && (
              <div className="mt-2">
                <input
                  type="text"
                  name="customOccupation"
                  value={formData.customOccupation}
                  onChange={handleChange}
                  placeholder="Please specify"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>


          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={agreeToPrivacy}
              onChange={(e) => {
                const checked = e.target.checked;
                setAgreeToPrivacy(checked);
                if (userEmail) {
                  localStorage.setItem(
                    `privacyAgreement:${userEmail}`,
                    checked.toString()
                  );
                }
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="privacyConsent" className="text-sm text-gray-500">
              I agree to the{" "}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsPrivacyModalOpen(true);
                }}
                className="text-blue-500 underline"
              >
                Privacy Policy Agreement
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={Loading || isSubmitting || !isFormValid()}
            className={`bg-primary text-white px-5 py-2.5 rounded-lg w-full transition-opacity ${
              !isFormValid() || Loading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Save & Continue
          </button>

        </form>
      </div>
            {isPrivacyModalOpen && (
              <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
              />
            )}
    </div>
  );
} 