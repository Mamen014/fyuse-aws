'use client';

import { useState, useEffect, useId, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import Select from 'react-select';
import { Country, City } from 'country-state-city';
import dynamic from 'next/dynamic';

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
  const [countryCode, setCountryCode] = useState('+1');
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsClient(true);
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
    setIsLoading(true);
    setIsSubmitting(true);
    setError('');
    const fullPhoneNumber = `${countryCode}${formData.phoneNumber}`;
    const updatedFormData = { ...formData, phoneNumber: fullPhoneNumber };
    
    try {
      const res = await fetch(`${API_BASE_URL}/userPref`, {
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

      const result = await res.json();
      console.log('Registration data saved:', result);
      
      localStorage.setItem('onboarding_register', JSON.stringify(updatedFormData));
      localStorage.setItem('onboarding_version', 'ai-flow');
      // Show loading state and navigate
      setIsNavigating(true);
      router.push('/discover-your-style/upload-photo');
      
      // Fallback in case navigation doesn't complete
      const navigationTimeout = setTimeout(() => {
        if (isNavigating) {
          window.location.href = '/discover-your-style/upload-photo';
        }
      }, 5000);
      
      return () => clearTimeout(navigationTimeout);
    } catch (err) {
      console.error('Failed to save registration data:', err);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #cbd5e0',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a0aec0',
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {isNavigating && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B1F63]/20 border-t-[#0B1F63] border-b-[#0B1F63] mb-4"></div>
            <p className="text-[#0B1F63] font-medium text-lg">Preparing your experience...</p>
            <p className="text-gray-500 text-sm">Just a moment please</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0B1F63]">Register</h2>
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
            Next
          </button>
        </form>
      </div>
    </div>
  );
} 