"use client";
import { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { useRouter } from 'next/navigation';
import { Country, City } from 'country-state-city';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

function RegisterPage() {
  const [formData, setFormData] = useState({
    birthdate: '',
    phoneNumber: '',
    country: '',
    city: '',
    occupation: ''
  });

  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [phoneCode, setPhoneCode] = useState('+1'); // Default to +1 (US/Canada)

  const { user } = useAuth();
  const router = useRouter();

  // Format countries data for react-select
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map(country => ({
      value: country.isoCode,
      label: country.name,
      phonecode: country.phonecode
    })).sort((a, b) => a.label.localeCompare(b.label));

    setCountryOptions(formattedCountries);
  }, []);

  // Handle country change - update cities and phone code
  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setFormData({ ...formData, country: selectedOption.label });

    // Update phone code when country changes
    setPhoneCode('+' + selectedOption.phonecode);

    // Get cities for selected country
    const cities = City.getCitiesOfCountry(selectedOption.value) || [];
    const formattedCities = cities.map(city => ({
      value: city.name,
      label: city.name
    })).sort((a, b) => a.label.localeCompare(b.label));

    setCityOptions(formattedCities);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('registration_data', JSON.stringify(formData));
    router.push('/onboarding/physical-attributes/step-1');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B1F63]">Register</h1>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-end">
            <div className="bg-[#0B1F63] text-white text-xs rounded-md py-1 px-2">
              Step 1/3
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Birthdate</label>
            <input
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B1F63]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Phone number</label>
            <div className="flex">
              <div className="mr-2 flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                <span className="text-gray-600">{phoneCode}</span>
              </div>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B1F63]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Country</label>
            <Select
              options={countryOptions}
              onChange={handleCountryChange}
              placeholder="Select a country"
              styles={customSelectStyles}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">City</label>
            <Select
              options={cityOptions}
              isDisabled={!selectedCountry}
              onChange={(option) => setFormData({ ...formData, city: option.value })}
              placeholder="Select a city"
              styles={customSelectStyles}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-1">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B1F63]"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#0B1F63] text-white py-3 rounded-full hover:bg-[#0a1b56] flex items-center justify-center"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
