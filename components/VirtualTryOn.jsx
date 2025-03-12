// import React, { useState } from "react";
// import axios from "axios";

// const VirtualTryOn = () => {
//   const [userImage, setUserImage] = useState(null);
//   const [apparelImage, setApparelImage] = useState(null);
//   const [userImagePreview, setUserImagePreview] = useState(null);
//   const [apparelImagePreview, setApparelImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [resultImageUrl, setResultImageUrl] = useState(null);
//   const [error, setError] = useState(null);
//   const [matchingAnalysis, setMatchingAnalysis] = useState(null);

//   const handleUserImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUserImage(file);
//       setUserImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const handleApparelImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setApparelImage(file);
//       setApparelImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const toBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const base64 = reader.result.split(",")[1];
//         resolve(base64);
//       };
//       reader.onerror = (error) => reject(error);
//     });

//   const uploadImageToS3 = async (imageFile, endpoint) => {
//     const base64 = await toBase64(imageFile);
//     const contentType = imageFile.type;
//     const fileName = imageFile.name;

//     const response = await axios.post(endpoint, {
//       fileName,
//       fileDataBase64: base64,
//       contentType,
//     });

//     return response.data?.imageUrl;
//   };

//   const handleSubmit = async (e) => {
//     e?.preventDefault(); // If used inside a form; otherwise not needed
//     if (!userImage || !apparelImage) {
//       setError("Please upload both user and apparel images.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       setResultImageUrl(null);
//       setMatchingAnalysis(null);

//       const API_BASE_URL =
//         "https://76e5op5rg6.execute-api.ap-southeast-2.amazonaws.com/dev";

//       const userImageUrl = await uploadImageToS3(
//         userImage,
//         `${API_BASE_URL}/upload-user-image`
//       );

//       const apparelImageUrl = await uploadImageToS3(
//         apparelImage,
//         `${API_BASE_URL}/upload-apparel-image`
//       );

//       const tryonResponse = await axios.post(
//         "https://ipgyftqcsg.execute-api.ap-southeast-2.amazonaws.com/dev/tryon-image",
//         {
//           person_image_url: userImageUrl,
//           garment_image_url: apparelImageUrl,
//         }
//       );

//       if (tryonResponse.data?.generated_image_url) {
//         setResultImageUrl(tryonResponse.data.generated_image_url);
//         // Save URLs for matching analysis
//         window.generatedImageUrl = tryonResponse.data.generated_image_url;
//         window.apparelImageUrl = apparelImageUrl;
//       } else if (tryonResponse.data?.error) {
//         setError(`Server error: ${tryonResponse.data.error}`);
//       } else {
//         setError("Unexpected response from server.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError(
//         err.response?.data?.error || "An error occurred during virtual try-on."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMatchingAnalysis = async () => {
//     if (!window.generatedImageUrl || !window.apparelImageUrl) {
//       setError("Missing generated try-on image or apparel image URL.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setMatchingAnalysis(null);
//       setError(null);

//       const response = await axios.post(
//         "https://j1sp2omtq2.execute-api.ap-southeast-2.amazonaws.com/dev/MatchingAnalyzer",
//         {
//           generated_image_url: window.generatedImageUrl,
//           apparel_image_url: window.apparelImageUrl,
//         }
//       );

//       if (response.data?.matching_analysis) {
//         setMatchingAnalysis(response.data.matching_analysis);
//       } else if (response.data?.error) {
//         setError(`Matching Analysis Error: ${response.data.error}`);
//       } else {
//         setError("Unexpected response from Matching Analyzer.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.error || "Matching Analysis failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       {/* Title */}
//       <h1 className="text-2xl font-bold text-center mb-6">
//         Virtual Try-On Experience
//       </h1>

//       {/* Two-column layout for uploading images */}
//       <div className="flex flex-col md:flex-row gap-6 justify-center">
//         {/* User Photo Column */}
//         <div className="flex-1 border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
//           <h2 className="text-lg font-semibold mb-2">Your Photo</h2>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleUserImageChange}
//             className="hidden"
//             id="userPhoto"
//           />
//           <label htmlFor="userPhoto" className="cursor-pointer">
//             {userImagePreview ? (
//               <img
//                 src={userImagePreview}
//                 alt="User Preview"
//                 className="mx-auto max-h-48 object-contain"
//               />
//             ) : (
//               <div className="flex flex-col items-center justify-center h-48">
//                 <p className="text-gray-500">
//                   Drop image here or click to upload
//                 </p>
//               </div>
//             )}
//           </label>
//         </div>

//         {/* Clothing Item Column */}
//         <div className="flex-1 border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
//           <h2 className="text-lg font-semibold mb-2">Clothing Item</h2>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleApparelImageChange}
//             className="hidden"
//             id="apparelPhoto"
//           />
//           <label htmlFor="apparelPhoto" className="cursor-pointer">
//             {apparelImagePreview ? (
//               <img
//                 src={apparelImagePreview}
//                 alt="Apparel Preview"
//                 className="mx-auto max-h-48 object-contain"
//               />
//             ) : (
//               <div className="flex flex-col items-center justify-center h-48">
//                 <p className="text-gray-500">
//                   Drop image here or click to upload
//                 </p>
//               </div>
//             )}
//           </label>
//         </div>
//       </div>

//       {/* Generate Try-On Button */}
//       <div className="text-center mt-6">
//         <button
//           type="button"
//           onClick={handleSubmit}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Generate Try-On Result
//         </button>
//       </div>

//       {/* Loading or Error Messages */}
//       {loading && (
//         <p className="mt-4 text-gray-600 text-center">Processing...</p>
//       )}
//       {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

//       {/* Result Image & Matching Analysis */}
//       {resultImageUrl && (
//         <div className="mt-8 text-center">
//           <h3 className="text-xl font-semibold mb-2">Generated Try-On Image</h3>
//           <img
//             src={resultImageUrl}
//             alt="Try-On Result"
//             className="rounded shadow inline-block max-h-96 object-contain"
//           />
//           <div className="mt-4">
//             <button
//               type="button"
//               onClick={handleMatchingAnalysis}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             >
//               Get Matching Analysis
//             </button>
//           </div>
//         </div>
//       )}

//       {matchingAnalysis && (
//         <div className="mt-6 p-4 border rounded bg-gray-100 text-center">
//           <h4 className="font-semibold mb-2">Matching Analysis Result</h4>
//           <pre className="whitespace-pre-wrap text-sm text-gray-800">
//             {matchingAnalysis}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VirtualTryOn;
//ok

import React, { useState } from "react";
import axios from "axios";

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [apparelImage, setApparelImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [apparelImagePreview, setApparelImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [matchingAnalysis, setMatchingAnalysis] = useState(null);
  const [taskId, setTaskId] = useState(null);

  const handleUserImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setUserImagePreview(URL.createObjectURL(file));
    }
  };

  const handleApparelImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setApparelImage(file);
      setApparelImagePreview(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const uploadImageToS3 = async (imageFile, endpoint) => {
    const base64 = await toBase64(imageFile);
    const contentType = imageFile.type;
    const fileName = imageFile.name;

    const response = await axios.post(endpoint, {
      fileName,
      fileDataBase64: base64,
      contentType,
    });

    return response.data?.imageUrl;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!userImage || !apparelImage) {
      setError("Please upload both user and apparel images.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultImageUrl(null);
      setMatchingAnalysis(null);

      const API_BASE_URL =
        "https://76e5op5rg6.execute-api.ap-southeast-2.amazonaws.com/dev";

      const userImageUrl = await uploadImageToS3(
        userImage,
        `${API_BASE_URL}/upload-user-image`
      );

      const apparelImageUrl = await uploadImageToS3(
        apparelImage,
        `${API_BASE_URL}/upload-apparel-image`
      );

      // Trigger the enqueue-tryon-job Lambda function
      try {
        const tryonResponse = await axios.post(
          `https://jev6ryapva.execute-api.ap-southeast-2.amazonaws.com/dev/enqueue-tryon-job`,
          {
            person_image_url: userImageUrl,
            garment_image_url: apparelImageUrl,
          }
        );
        // Handle response
      } catch (error) {
        console.error("Error enqueuing try-on job:", error);
        setError("Failed to start try-on job.");
      }

      if (tryonResponse.data?.taskId) {
        setTaskId(tryonResponse.data.taskId);
      } else {
        setError("Failed to initiate try-on job.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "An error occurred during virtual try-on."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkTryOnStatus = async () => {
    if (!taskId) {
      setError("Missing task ID. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL =
        "https://76e5op5rg6.execute-api.ap-southeast-2.amazonaws.com/dev";

      if (statusResponse.data?.status === "completed") {
        const resultImageUrl = statusResponse.data.generated_image_url;
        setResultImageUrl(resultImageUrl);
        window.generatedImageUrl = resultImageUrl;
      } else if (statusResponse.data?.status === "failed") {
        setError("Try-on job failed.");
      } else {
        setError("Try-on job is still processing...");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to check try-on status.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchingAnalysis = async () => {
    if (!window.generatedImageUrl) {
      setError("Missing generated try-on image.");
      return;
    }

    try {
      setLoading(true);
      setMatchingAnalysis(null);
      setError(null);

      const response = await axios.post(
        "https://j1sp2omtq2.execute-api.ap-southeast-2.amazonaws.com/dev/MatchingAnalyzer",
        {
          generated_image_url: window.generatedImageUrl,
          apparel_image_url: window.apparelImageUrl,
        }
      );

      if (response.data?.matching_analysis) {
        setMatchingAnalysis(response.data.matching_analysis);
      } else {
        setError("Matching Analysis failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Matching Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Virtual Try-On</h1>
        <p className="text-white mt-2">Experience the perfect fit.</p>
      </header>

      {/* Upload Section */}
      <div className="bg-[#1a1a2f] w-full max-w-4xl  rounded-lg shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-medium text-white text-center mb-4">
          Step 1: Upload Your Photos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Photo Card */}
          <div className="border border-gray-200 rounded-lg p-6 text-center transition hover:border-gray-400">
            <h3 className="text-lg font-medium text-white mb-4">Your Photo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleUserImageChange}
              className="hidden"
              id="userPhoto"
            />
            <label htmlFor="userPhoto" className="cursor-pointer">
              {userImagePreview ? (
                <img
                  src={userImagePreview}
                  alt="User Preview"
                  className="mx-auto max-h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <p className="text-white">Click to upload</p>
                </div>
              )}
            </label>
          </div>

          {/* Apparel Photo Card */}
          <div className="border border-gray-200 rounded-lg p-6 text-center transition hover:border-gray-400">
            <h3 className="text-lg font-medium text-white mb-4">
              Clothing Item
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleApparelImageChange}
              className="hidden"
              id="apparelPhoto"
            />
            <label htmlFor="apparelPhoto" className="cursor-pointer">
              {apparelImagePreview ? (
                <img
                  src={apparelImagePreview}
                  alt="Apparel Preview"
                  className="mx-auto max-h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <p className="text-white">Click to upload</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Generate Try-On Result
          </button>
        </div>

        {/* Loading/Error Messages */}
        {loading && (
          <p className="text-gray-600 text-center animate-pulse">Processing...</p>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </div>

      {/* Result Section */}
      {resultImageUrl && (
        <div className="mt-8 w-full max-w-4xl bg-white rounded-lg shadow-md p-8 space-y-6">
          <h2 className="text-2xl font-medium text-gray-800 text-center mb-4">
            Step 2: Try-On Result
          </h2>
          <img
            src={resultImageUrl}
            alt="Try-On Result"
            className="rounded-lg shadow-md mx-auto max-h-96 object-contain"
          />
          <div className="text-center">
            <button
              type="button"
              onClick={checkTryOnStatus}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition duration-300"
            >
              Check Try-On Status
            </button>
            <button
              type="button"
              onClick={handleMatchingAnalysis}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition duration-300 mt-4"
            >
              Analyze Fit
            </button>
          </div>
        </div>
      )}

      {/* Matching Analysis Section */}
      {matchingAnalysis && (
        <div className="mt-6 w-full max-w-4xl bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-800">Fit Analysis</h3>
          <p className="text-lg text-gray-600">{matchingAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;
