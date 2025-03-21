
import React, { useState } from "react";
import axios from "axios";
import { signIn, fetchAuthSession } from "@aws-amplify/auth";

const VirtualTryOn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [tryonImage, setTryonImage] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const handleLogin = async () => {
    try {
      await signIn({ username: email, password });
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (token) {
        localStorage.setItem("token", token); // ✅ use localStorage
        setIsLoggedIn(true);
      } else {
        console.error("Token not found in session.");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("personImage", personImage);
    formData.append("garmentImage", garmentImage);

    try {
      const response = await axios.post("/api/tryon", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ use localStorage
        },
      });
      setTryonImage(response.data.imageUrl);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await axios.get("/api/tryon?action=analyze", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ use localStorage
        },
      });
      setMatchResult(response.data.matchResult);
    } catch (err) {
      console.error("Analyze error:", err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">Login to Fyuse</h2>
        <input
          type="email"
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Virtual Try-On</h2>
      <div className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPersonImage(e.target.files[0])}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setGarmentImage(e.target.files[0])}
        />
        <button
          onClick={handleUpload}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Upload & Try On
        </button>
        <button
          onClick={handleAnalyze}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Analyze Match
        </button>
      </div>

      {tryonImage && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Try-On Result:</h3>
          <img src={tryonImage} alt="Try-on result" className="rounded shadow" />
        </div>
      )}

      {matchResult && (
        <div className="mt-4">
          <h3 className="font-semibold">Match Analysis:</h3>
          <p>{matchResult}</p>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;