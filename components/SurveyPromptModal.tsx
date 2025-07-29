// components/SurveyPromptModal.tsx
import { getOrCreateSessionId } from "@/lib/session";

type Props = {
  isOpen: boolean;
  token: string;
  onClose: () => void;
  onSubmit: () => void;
};

export default function SurveyPromptModal({ isOpen, token, onClose, onSubmit }: Props) {
  const sessionId = getOrCreateSessionId();
  const dismissSurvey = () => {
    try {
      fetch('/api/survey-prompt/increment-stage', {
        method: 'POST',
        headers: {
          "x-session-id": sessionId,
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to increment survey stage:", error);
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-primary">Help Us Improve FYUSE</h2>
        <p className="text-gray-700">
          We&apos;d love your feedback to improve your personalized styling experience.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90"
          >
            Take the Survey
          </button>          
          <button
            onClick={dismissSurvey}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
