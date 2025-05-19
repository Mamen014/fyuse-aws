'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/navigation';
import { Country, City } from 'country-state-city';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;


  const [formData, setFormData] = useState({
    birthdate: '',
    phoneNumber: '',
    country: '',
    city: '',
    occupation: '',
  });

  const isFormValid =
  formData.birthdate &&
  formData.phoneNumber &&
  formData.country &&
  formData.city &&
  formData.occupation;

  const [countryCode, setCountryCode] = useState('+62'); // Default
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map(country => ({
      value: country.isoCode,
      label: country.name,
      phonecode: country.phonecode,
    })).sort((a, b) => a.label.localeCompare(b.label));

    setCountryOptions(formattedCountries);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullPhoneNumber = `${countryCode}${formData.phoneNumber}`;
    const updatedFormData = { ...formData, phoneNumber: fullPhoneNumber };
    localStorage.setItem('onboarding_register', JSON.stringify(updatedFormData));
    router.push('/onboarding/physical-attributes/step-1');
  };

  const data = {
    birthdate: formData.birthdate,
    phoneNumber: `${countryCode}${formData.phoneNumber}`,
    country: formData.country,
    city: formData.city,
    occupation: formData.occupation,
  };

  const register = async () => {
    console.log("Registering user with data:", data);
    const payload = {
      userEmail,
      section: "userProfile",
      data,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/userPref`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Tracking result:", result);
    } catch (err) {
      console.error("Failed to track user event:", err);
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
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="mb-1">
          <h2 className="text-xl font-bold text-[#0B1F63]">Register</h2>
          <p className="text-sm text-gray-500">Create your account</p>
        </div>

        <div className="flex justify-end mb-6">
          <span className="inline-block px-3 py-1 text-xs bg-[#0B1F63] text-white rounded-full">Step 1/7</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Birthdate</label>
            <input
              type="date"
              name="birthdate"
              placeholder="DD-MM-YY"
              value={formData.birthdate}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 uppercase text-[#a0a0a0]  rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Phone number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm w-20">
                {countryCode}
              </span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 812-3456-7890)"
                className="block w-full px-3 py-2 border border-gray-300 rounded-r-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Country</label>
            <Select
              options={countryOptions}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder="Select a country"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">City</label>
            <Select
              options={cityOptions}
              value={selectedCity}
              onChange={handleCityChange}
              placeholder="Select a city"
              isDisabled={!selectedCountry}
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            onClick={register}
            type="submit"
            className={`w-full py-3 px-4 rounded-lg mt-6 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFormValid
                ? 'bg-[#0B1F63] text-white hover:bg-[#0a1b56] focus:ring-[#0B1F63]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isFormValid}
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}