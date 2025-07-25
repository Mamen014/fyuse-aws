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
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const countrySelectId = useId();
  const citySelectId = useId();

  const [formData, setFormData] = useState({
    nickname: '',
    birthdate: '',
    phoneNumber: '',
    country: '',
    city: '',
    occupation: '',
  });

  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countryCode, setCountryCode] = useState('+62');
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    setIsClient(true);
    setIsCheckingRedirect(false);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map(country => ({
      value: country.isoCode,
      label: country.name,
      phonecode: country.phonecode,
    })).sort((a, b) => a.label.localeCompare(b.label));

    setCountryOptions(formattedCountries);

    if (userEmail) {
      const storedAgreement = localStorage.getItem(`privacyAgreement:${userEmail}`);
      if (storedAgreement === "true") {
        setAgreeToPrivacy(true);
      }
    }
  }, [isClient, userEmail]);

  const isFormValid = formData.nickname &&
                     formData.birthdate && 
                     formData.phoneNumber && 
                     selectedCountry && 
                     selectedCity && 
                     formData.occupation &&
                     agreeToPrivacy;

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
    if (isLoading || isSubmitting) return;
    setIsCheckingRedirect(true);
    setIsLoading(true);
    setIsSubmitting(true);
    
    const fullPhoneNumber = `${countryCode}${formData.phoneNumber}`;
    const updatedFormData = { ...formData, phoneNumber: fullPhoneNumber };
    
    try {
      // Save data to localStorage immediately
      localStorage.setItem('profile', JSON.stringify(updatedFormData));
      
      // Start API call in the background but don't wait for it
      const savePromise = fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          section: 'userProfile',
          data: updatedFormData,
        }),
      });
      
      // Handle API response in the background
      savePromise
        .then(res => res.json())
        .catch(err => console.error('Failed to save registration data:', err));
      
      // Just trigger the navigation - Next.js will handle the loading state
      const registerFrom = localStorage.getItem('registerFrom');
      if (registerFrom === 'dashboard') {
        router.push('/dashboard');
        localStorage.removeItem("showRegister");
        localStorage.removeItem('registerFrom');
      } else if (registerFrom === 'physical-appearances') {
        router.push('personalized-styling/physical-appearances');
        localStorage.removeItem("showRegister");
        localStorage.removeItem('registerFrom');
      }
    } catch (err) {
      console.error('Failed to save registration data:', err);
      setIsSubmitting(false);
      setIsLoading(false);
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
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
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
            disabled={isLoading || !isFormValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg transition-colors ${
              isFormValid
                ? 'bg-[#0B1F63] text-white hover:bg-[#0a1b56]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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