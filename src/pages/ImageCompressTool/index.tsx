import { useState, useCallback, useRef } from "react";
import { Image, Download, Upload, Eye } from "lucide-react";
import { ToolLayout } from "@/layout/tool-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import imageCompression from "browser-image-compression";

export default function ImageCompressTool() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [quality, setQuality] = useState(80);
  const [compressing, setCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("仅支持 JPG、PNG、WebP 格式");
      return;
    }
    setOriginalFile(file);
    setOriginalSize(file.size);
    setOriginalUrl(URL.createObjectURL(file));
    setCompressedFile(null);
    setCompressedUrl("");
    setCompressedSize(0);
  }, []);

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

  const handleClear = useCallback(() => {
    setOriginalFile(null);
    setOriginalUrl("");
    setCompressedFile(null);
    setCompressedUrl("");
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const savedPercent =
    originalSize && compressedSize
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0;

  return (
    <ToolLayout
      icon={Image}
      title="图片压缩"
      description="上传图片，调节压缩质量，实时预览"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">上传图片</CardTitle>
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

          {originalUrl && (
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
          )}

          {originalFile && (
            <Button onClick={handleCompress} disabled={compressing}>
              {compressing ? "压缩中..." : "开始压缩"}
            </Button>
          )}
        </CardContent>
      </Card>

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
    </ToolLayout>
  );
}
