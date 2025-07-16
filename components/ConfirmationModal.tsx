import { useEffect, useState } from "react";
import Image from "next/image";
import LoadingModalSpinner from "./ui/LoadingState";
import { useRouter } from "next/navigation";
import { capitalizeWords } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
};

type Profile = {
  skin_tone?: string;
  body_shape?: string;
  gender?: string;
  user_image_url?: string;
};

type StyledItem = {
  product_image_url?: string;
  fashType?: string;
  category?: string;
};

export default function ConfirmationModal({ isOpen, onClose, token }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestItem, setLatestItem] = useState<StyledItem | null>(null);

  const handleClose = () => onClose?.();

  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          fetch("/api/user-profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/styling-history", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok || !historyRes.ok) throw new Error("Failed to load data");

        const profileData = await profileRes.json();
        const historyData = await historyRes.json();

        setProfile(profileData);
        setLatestItem(historyData?.[0] || null);
      } catch (err) {
        console.error("❌ Failed to fetch modal data:", err);
        setProfile(null);
        setLatestItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, token]);

  if (!isOpen) return null;

  if (loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <LoadingModalSpinner message="Preparing preview..." subMessage="Just a second..." />
      </div>
    );

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
        <div className="modal-content w-full max-w-5xl rounded-2xl p-8 bg-white shadow-xl flex flex-col gap-10 md:flex-row md:gap-12">
        
        {/* Left column */}
        <div className="w-full md:w-[60%] space-y-6">
            {/* Modal Title */}
            <div>
            <h2 className="text-2xl font-bold text-primary mb-2 text-center md:text-left">
                Ready to Discover Your Style?
            </h2>
            </div>

            {/* Physical Attributes Section */}
            <div className="border rounded-xl p-5 bg-muted">
            <h3 className="font-bold text-xl text-primary mb-4">Physical Attributes</h3>
            <div className="flex justify-between items-center gap-4">
                {/* Skin Tone */}
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow w-full">
                <Image
                    src={
                    profile?.skin_tone
                        ? `/images/skin-tone/${profile.skin_tone.toLowerCase()}.png`
                        : "/unknown.png"
                    }
                    alt="Skin Tone"
                    width={64}
                    height={64}
                    className="rounded-md object-contain"
                />
                <p className="text-sm font-medium text-gray-700 mt-2">
                    {capitalizeWords(profile?.skin_tone || "Not Set")}
                </p>
                </div>

                {/* Body Shape */}
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow w-full">
                <Image
                    src={
                    profile?.gender && profile?.body_shape
                        ? `/images/body-shape/${profile.gender.toLowerCase()}/${profile.body_shape.toLowerCase()}.png`
                        : "/unknown.png"
                    }
                    alt="Body Shape"
                    width={64}
                    height={64}
                    className="rounded-md object-contain"
                />
                <p className="text-sm font-medium text-gray-700 mt-2">
                    {capitalizeWords(profile?.body_shape || "Not Set")}
                </p>
                </div>
            </div>
            </div>

            {/* Latest Preference Section */}
            <div className="border rounded-xl p-5 bg-muted">
            <h3 className="font-bold text-xl text-primary mb-4">Latest Preference</h3>
            {latestItem ? (
                <div className="flex items-center gap-5">
                <div className="rounded-xl overflow-hidden shadow-sm bg-white border aspect-[3/4] w-[100px] h-[130px]">
                    <Image
                    src={latestItem.product_image_url || "/placeholder.svg"}
                    alt="Liked item"
                    width={100}
                    height={130}
                    className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col text-sm text-primary">
                    <p>
                    <span className="font-semibold">Fashion Type:</span>{" "}
                    {capitalizeWords(latestItem.fashType || "Not Set")}
                    </p>
                    <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {capitalizeWords(latestItem.category || "Not Set")}
                    </p>
                </div>
                </div>
            ) : (
                <p className="text-gray-500 text-sm">No preference found</p>
            )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 py-2">
            <button
                onClick={() => handleNavigate("/personalized-styling/result")}
                className="bg-primary text-white px-5 py-2.5 rounded-lg w-full md:w-auto"
            >
                Continue
            </button>
            <button
                onClick={() => handleNavigate("/personalized-styling/physical-appearances")}
                className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-lg w-full md:w-auto"
            >
                Re-upload Photo
            </button>
            <button
                onClick={() => handleNavigate("/personalized-styling/style-preferences")}
                className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-lg w-full md:w-auto"
            >
                Change Preferences
            </button>
            </div>
        </div>

        {/* Right column: only visible on desktop */}
        <div className="hidden md:flex w-full md:w-[40%] flex-col items-center justify-center">
        <p className="text-sm font-semibold text-primary mb-3">Your Uploaded Photo</p>
        <div className="relative aspect-[1/2] w-full max-w-xs rounded-xl overflow-hidden border">
            <Image
            src={profile?.user_image_url || "/placeholder.svg"}
            alt="User Upload"
            fill
            className="object-cover"
            />
        </div>
        </div>
        </div>
    </div>
    );
}
