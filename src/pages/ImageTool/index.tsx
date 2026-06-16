import { useState, useCallback, useRef } from "react";
import { Image as ImageIcon, Download, Upload, Eye, Scissors } from "lucide-react";
import ReactCrop, { type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ToolLayout } from "@/layout/tool-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import imageCompression from "browser-image-compression";

type Tab = "compress" | "crop";
type Aspect = number | null;

const ASPECT_OPTIONS: { label: string; value: Aspect }[] = [
  { label: "自由", value: null },
  { label: "1:1", value: 1 / 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4", value: 3 / 4 },
  { label: "9:16", value: 9 / 16 },
];

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): PixelCrop {
  // 先用宽度的 80% 计算高度
  let cropWidth = Math.round(mediaWidth * 0.8);
  let cropHeight = Math.round(cropWidth / aspect);

  // 如果高度超出图片，改用高度的 80% 重新计算
  if (cropHeight > mediaHeight) {
    cropHeight = Math.round(mediaHeight * 0.8);
    cropWidth = Math.round(cropHeight * aspect);
  }

  const x = Math.round((mediaWidth - cropWidth) / 2);
  const y = Math.round((mediaHeight - cropHeight) / 2);
  return { unit: "px", x, y, width: cropWidth, height: cropHeight };
}

function getCroppedImg(image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      0.95,
    );
  });
}

export default function ImageTool() {
  // --- Shared state ---
  const [activeTab, setActiveTab] = useState<Tab>("compress");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Compress state ---
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [quality, setQuality] = useState(80);
  const [compressing, setCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  // --- Crop state ---
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<PixelCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [cropAspect, setCropAspect] = useState<Aspect>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedUrl, setCroppedUrl] = useState("");
  const [cropping, setCropping] = useState(false);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // --- Shared handlers ---
  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("仅支持 JPG、PNG、WebP 格式");
      return;
    }
    setOriginalFile(file);
    setOriginalSize(file.size);
    setOriginalUrl((prev) => {
      URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    // Reset all derived states
    setCompressedFile(null);
    setCompressedUrl("");
    setCompressedSize(0);
    setCroppedFile(null);
    setCroppedUrl("");
    setCrop(undefined);
    setCompletedCrop(null);
  }, []);

  const handleClear = useCallback(() => {
    setOriginalUrl((prev) => {
      URL.revokeObjectURL(prev);
      return "";
    });
    setOriginalFile(null);
    setOriginalSize(0);
    setCompressedFile(null);
    setCompressedUrl("");
    setCompressedSize(0);
    setCroppedFile(null);
    setCroppedUrl("");
    setCrop(undefined);
    setCompletedCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // --- Compress handlers ---
  const handleCompress = useCallback(async () => {
    if (!originalFile) return;
    setCompressing(true);
    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality / 100,
      };
      const compressed = await imageCompression(originalFile, options);
      setCompressedFile(compressed);
      setCompressedSize(compressed.size);
      setCompressedUrl(URL.createObjectURL(compressed));
    } catch {
      alert("压缩失败，请重试");
    } finally {
      setCompressing(false);
    }
  }, [originalFile, quality]);

  const handleDownload = useCallback(() => {
    if (!compressedFile) return;
    const link = document.createElement("a");
    link.download = `compressed-${originalFile?.name || "image"}`;
    link.href = compressedUrl;
    link.click();
  }, [compressedFile, compressedUrl, originalFile]);

  // --- Crop handlers ---
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      if (cropAspect) {
        setCrop(centerAspectCrop(width, height, cropAspect));
      }
    },
    [cropAspect],
  );

  const handleAspectChange = useCallback(
    (aspect: Aspect) => {
      setCropAspect(aspect);
      setCroppedFile(null);
      setCroppedUrl("");
      if (aspect && imgRef.current) {
        const { width, height } = imgRef.current;
        setCrop(centerAspectCrop(width, height, aspect));
      }
    },
    [],
  );

  const handleCropConfirm = useCallback(async () => {
    const pixelCrop = completedCrop ?? crop;
    if (!originalUrl || !pixelCrop || !imgRef.current) return;
    setCropping(true);
    try {
      const blob = await getCroppedImg(imgRef.current, pixelCrop);
      const file = new File([blob], `cropped-${originalFile?.name || "image.jpg"}`, {
        type: "image/jpeg",
      });
      setCroppedFile(file);
      setCroppedUrl((prev) => {
        URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch {
      alert("裁剪失败，请重试");
    } finally {
      setCropping(false);
    }
  }, [originalUrl, completedCrop, crop, originalFile]);

  const handleDownloadCropped = useCallback(() => {
    if (!croppedFile) return;
    const link = document.createElement("a");
    link.download = `cropped-${originalFile?.name || "image.jpg"}`;
    link.href = croppedUrl;
    link.click();
  }, [croppedFile, croppedUrl, originalFile]);

  const savedPercent =
    originalSize && compressedSize
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0;

  return (
    <ToolLayout
      icon={ImageIcon}
      title="图片工具"
      description="图片压缩与裁剪，质量调节，比例裁切"
    >
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === "compress" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("compress")}
        >
          <Download className="h-4 w-4 mr-1" />
          压缩
        </Button>
        <Button
          variant={activeTab === "crop" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("crop")}
        >
          <Scissors className="h-4 w-4 mr-1" />
          裁剪
        </Button>
      </div>

      {/* Upload area (shared) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {activeTab === "compress" ? "上传图片" : "选择图片"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {originalFile ? (
            <div className="flex items-center gap-2 p-2 rounded-md border">
              {originalUrl && (
                <img
                  src={originalUrl}
                  alt="Preview"
                  className="h-8 w-8 rounded object-contain border"
                />
              )}
              <span className="text-xs text-muted-foreground flex-1 truncate">
                {originalFile.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                移除
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">上传图片</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* ========== Compress Tab ========== */}
      {activeTab === "compress" && (
        <>
          {originalUrl && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>压缩质量: {quality}%</Label>
                  <Input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>文件更小</span>
                    <span>质量更好</span>
                  </div>
                </div>

                <Button onClick={handleCompress} disabled={compressing}>
                  {compressing ? "压缩中..." : "开始压缩"}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {originalUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">压缩前</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="w-full rounded-lg object-contain max-h-48"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {formatSize(originalSize)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(originalUrl, "_blank")}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      预览
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {compressedUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">压缩后</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    className="w-full rounded-lg object-contain max-h-48"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {formatSize(compressedSize)}
                      {savedPercent > 0 && (
                        <span className="text-green-500 ml-2">
                          (-{savedPercent}%)
                        </span>
                      )}
                    </p>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* ========== Crop Tab ========== */}
      {activeTab === "crop" && (
        <>
          {originalUrl && (
            <>
              {/* Crop area */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-center bg-muted/30 rounded-lg">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={cropAspect ?? undefined}
                      className="max-h-[420px]"
                    >
                      <img
                        ref={imgRef}
                        src={originalUrl}
                        onLoad={handleImageLoad}
                        alt="Crop"
                        className="max-h-[420px] w-auto object-contain"
                      />
                    </ReactCrop>
                  </div>

                  {/* Aspect ratio buttons */}
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.label}
                        variant={cropAspect === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAspectChange(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleCropConfirm}
                    disabled={cropping || !crop}
                    className="w-full"
                  >
                    {cropping ? "裁剪中..." : "确认裁剪"}
                  </Button>
                </CardContent>
              </Card>

              {/* Crop result */}
              {croppedUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">裁剪结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <img
                      src={croppedUrl}
                      alt="Cropped"
                      className="w-full rounded-lg object-contain max-h-48"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {croppedFile && formatSize(croppedFile.size)}
                      </p>
                      <Button variant="outline" size="sm" onClick={handleDownloadCropped}>
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
}
