"use client";

import { useState, useCallback } from "react";
import { Button } from "./ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { ImagePlus, Shirt, Loader2 } from "lucide-react";

export default function VirtualTryOn() {
  // File states
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [clothingFile, setClothingFile] = useState(null);
  const [clothingPreview, setClothingPreview] = useState(null);

  // Result & UI states
  const [resultImage, setResultImage] = useState(null);
  const [matchPercentage, setMatchPercentage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [info, setInfo] = useState("");

  // Drag & Drop Handler
  const handleDrop = useCallback((e, setFile, setPreview) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files[0];
    if (file?.type?.startsWith("image/")) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  // Drag Over Preventer
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // File Selection Handler
  const handleFileSelect = useCallback((e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file?.type?.startsWith("image/")) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  // Process Images
  const processImages = async () => {
    if (!personFile || !clothingFile) {
      setInfo("Please upload both images first.");
      return;
    }

    setLoading(true);
    setInfo("");

    try {
      const formData = new FormData();
      formData.append("personImg", personFile);
      formData.append("garmentImg", clothingFile);

      const response = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process images. Please try again.");
      }

      const responseData = await response.json();

      if (!responseData.tryon_image_url) {
        throw new Error("Failed to retrieve processed image.");
      }

      setResultImage(responseData.tryon_image_url);
      setMatchPercentage(responseData.match_percentage?.toFixed(2) || "N/A");
      setActiveTab("result");
    } catch (error) {
      setInfo(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Component
  const ImageUploadCard = ({ title, preview, setFile, setPreview, icon: Icon, id }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 cursor-pointer hover:border-primary transition-colors"
          onDrop={(e) => handleDrop(e, setFile, setPreview)}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById(id).click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              document.getElementById(id).click();
            }
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt={`${title} preview`}
              className="max-h-full max-w-full object-contain rounded-md"
            />
          ) : (
            <div className="text-center">
              <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Drop image here or click to upload</p>
            </div>
          )}
          <input
            type="file"
            id={id}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, setFile, setPreview)}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="mb-8 text-center text-3xl font-bold text-primary">
        Virtual Try-On Experience
      </h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="result" disabled={!resultImage}>
            View Result
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent
          value="upload"
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <ImageUploadCard
            title="Your Photo"
            preview={personPreview}
            setFile={setPersonFile}
            setPreview={setPersonPreview}
            icon={ImagePlus}
            id="personImage"
          />
          <ImageUploadCard
            title="Clothing Item"
            preview={clothingPreview}
            setFile={setClothingFile}
            setPreview={setClothingPreview}
            icon={Shirt}
            id="clothingImage"
          />
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Virtual Try-On Result</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : resultImage ? (
                <>
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-h-[500px] object-contain rounded-md"
                  />
                  {matchPercentage && (
                    <p className="mt-4 text-lg text-primary">
                      Match Accuracy: {matchPercentage}%
                    </p>
                  )}
                </>
              ) : (
                <p>No result available. Please upload images and process.</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Try Another Item
              </Button>
              {resultImage && (
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resultImage;
                    link.download = "tryon_result.jpg";
                    link.click();
                  }}
                >
                  Download Result
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Button & Info */}
      <div className="mt-8 text-center">
        <Button
          onClick={processImages}
          disabled={!personFile || !clothingFile || loading}
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate Try-On Result"
          )}
        </Button>
        {info && <p className="mt-4 text-sm text-red-500">{info}</p>}
      </div>
    </section>
  );
}
