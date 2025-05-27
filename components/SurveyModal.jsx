import { X } from 'lucide-react';

const BRAND_BLUE = '#0B1F63';

export default function SurveyModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const options = [
    'Instagram',
    'TikTok',
    'LinkedIn',
    'Friends',
    'Google Search',
    'Other'
  ];

  const handleOptionClick = (option) => {
    onSubmit(option);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: BRAND_BLUE }}>
              How Did You Hear About FYUSE?
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" style={{ color: BRAND_BLUE }} />
            </button>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className="w-full py-4 px-6 text-left rounded-2xl font-medium transition-all duration-200 hover:bg-blue-50"
                style={{ 
                  backgroundColor: 'white',
                  color: BRAND_BLUE,
                  border: `1px solid ${BRAND_BLUE}1A`
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 