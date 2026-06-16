# ImageTool (压缩 + 裁剪) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename ImageCompressTool to ImageTool and add a cropping feature with both free and fixed-ratio modes.

**Architecture:** Single-page component with Tab switching between "compress" (existing) and "crop" (new) modes. Uses `react-easy-crop` for the cropping UI and Canvas API for generating the cropped output. Image upload is shared across both tabs.

**Tech Stack:** React + TypeScript, react-easy-crop, Canvas API, browser-image-compression (existing)

---

### Task 1: Rename directory and update configs

**Files:**
- Rename: `src/pages/ImageCompressTool/` -> `src/pages/ImageTool/`
- Modify: `src/router/index.tsx`
- Modify: `src/lib/tool-config.ts`

- [ ] **Step 1: Rename the directory**

```bash
mv "c:/vide coding/pocket-tools/src/pages/ImageCompressTool" "c:/vide coding/pocket-tools/src/pages/ImageTool"
```

- [ ] **Step 2: Update router import and route**

Edit `src/router/index.tsx`:

Change:
```
import ImageCompressTool from "@/pages/ImageCompressTool/index"
import { path: "/image-compress", element: <ImageCompressTool /> }
```
To:
```
import ImageTool from "@/pages/ImageTool/index"
{ path: "/image", element: <ImageTool /> },
```

Full changes:
```diff
- import ImageCompressTool from "@/pages/ImageCompressTool/index"
+ import ImageTool from "@/pages/ImageTool/index"

- { path: "/image-compress", element: <ImageCompressTool /> },
+ { path: "/image", element: <ImageTool /> },
```

- [ ] **Step 3: Update tool config**

Edit `src/lib/tool-config.ts`:

```diff
- "/image-compress": {
+ "/image": {
    path: "/image",
    title: "图片工具",
    description: "图片压缩与裁剪，质量调节，比例裁切",
```

- [ ] **Step 4: Commit**

```bash
git add src/router/index.tsx src/lib/tool-config.ts
git mv "c:/vide coding/pocket-tools/src/pages/ImageCompressTool" "c:/vide coding/pocket-tools/src/pages/ImageTool"
git commit -m "refactor: rename ImageCompressTool to ImageTool, update route to /image"

Co-Authored-By: Claude <noreply@anthropic.com>
```


### Task 2: Install react-easy-crop dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install react-easy-crop**

```bash
cd "c:/vide coding/pocket-tools" && npm install react-easy-crop
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add react-easy-crop for image cropping"

Co-Authored-By: Claude <noreply@anthropic.com>
```


### Task 3: Rewrite ImageTool component with Tab + Crop functionality

**Files:**
- Modify: `src/pages/ImageTool/index.tsx` (full rewrite)

- [ ] **Step 1: Write the new ImageTool component**

This step completely rewrites `src/pages/ImageTool/index.tsx` with:
- Component renamed to `ImageTool`
- Tab switching between "compress" and "crop" modes
- Cropping UI integrated with react-easy-crop
- Crop result preview and download

```tsx
import { useState, useCallback, useRef } from "react";
import { Image, Download, Upload, Eye, Scissors } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
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

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95);
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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<Aspect>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
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
    // Revoke old URLs
    URL.revokeObjectURL(originalUrl);
    URL.revokeObjectURL(compressedUrl);
    URL.revokeObjectURL(croppedUrl);

    setOriginalFile(file);
    setOriginalSize(file.size);
    setOriginalUrl(URL.createObjectURL(file));
    // Reset derived states
    setCompressedFile(null);
    setCompressedUrl("");
    setCompressedSize(0);
    setCroppedFile(null);
    setCroppedUrl("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleClear = useCallback(() => {
    URL.revokeObjectURL(originalUrl);
    URL.revokeObjectURL(compressedUrl);
    URL.revokeObjectURL(croppedUrl);
    setOriginalFile(null);
    setOriginalUrl("");
    setOriginalSize(0);
    setCompressedFile(null);
    setCompressedUrl("");
    setCompressedSize(0);
    setCroppedFile(null);
    setCroppedUrl("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
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
  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!originalUrl || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const blob = await getCroppedImg(originalUrl, croppedAreaPixels);
      const file = new File([blob], `cropped-${originalFile?.name || "image.jpg"}`, { type: "image/jpeg" });
      URL.revokeObjectURL(croppedUrl);
      setCroppedFile(file);
      setCroppedUrl(URL.createObjectURL(blob));
    } catch {
      alert("裁剪失败，请重试");
    } finally {
      setCropping(false);
    }
  }, [originalUrl, croppedAreaPixels, originalFile]);

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
      icon={Image}
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
              {/* Cropper */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="relative w-full h-[420px] bg-muted rounded-lg overflow-hidden">
                    <Cropper
                      image={originalUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={cropAspect ?? undefined}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>

                  {/* Zoom slider */}
                  <div className="space-y-1">
                    <Label className="text-xs">缩放</Label>
                    <Input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                    />
                  </div>

                  {/* Aspect ratio buttons */}
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.label}
                        variant={cropAspect === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCropAspect(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleCropConfirm}
                    disabled={cropping}
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

          {!originalUrl && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  请先上传一张图片
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </ToolLayout>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
cd "c:/vide coding/pocket-tools" && npx tsc --noEmit 2>&1 | head -30
```

Expected: No type errors (may show warnings from other files, that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/pages/ImageTool/index.tsx
git commit -m "feat: add crop tab with free and fixed-ratio cropping to ImageTool"

Co-Authored-By: Claude <noreply@anthropic.com>
```


### Task 4: Self-review and verify

- [ ] **Step 1: Verify plan covers all spec requirements**

Checklist:
- [x] Directory renamed from ImageCompressTool to ImageTool (Task 1)
- [x] Router updated (Task 1)
- [x] Route path changed from `/image-compress` to `/image` (Task 1)
- [x] Config updated with new title/description (Task 1)
- [x] react-easy-crop installed (Task 2)
- [x] Tab switching between compress and crop (Task 3)
- [x] Crop UI with drag-to-select (Task 3)
- [x] Free and fixed-ratio crop modes (Task 3)
- [x] Zoom slider (Task 3)
- [x] Confirm crop and preview result (Task 3)
- [x] Download cropped image (Task 3)

- [ ] **Step 2: Run a final build check**

```bash
cd "c:/vide coding/pocket-tools" && npm run build 2>&1 | tail -10
```

Expected: Build succeeds with no errors.
