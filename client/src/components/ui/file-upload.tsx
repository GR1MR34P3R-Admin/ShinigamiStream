import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image, Video, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  accept?: string;
  onUpload: (file: File, onProgress?: (progress: number) => void) => Promise<{ url: string; filename: string }>;
  onRemove?: () => void;
  currentUrl?: string;
  disabled?: boolean;
  className?: string;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  completed: boolean;
}

export function FileUpload({
  label,
  accept = 'image/*',
  onUpload,
  onRemove,
  currentUrl,
  disabled,
  className
}: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    completed: false
  });
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isVideo = accept.includes('video');
  const isImage = accept.includes('image');

  const resetUploadState = () => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      completed: false
    });
    setSelectedFile(null);
  };

  const handleFileSelect = async (file: File, isRetry = false) => {
    if (!file && !isRetry) return;
    
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    if (!isRetry) {
      setSelectedFile(fileToUpload);
    }
    
    // Cancel any existing upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this upload
    abortControllerRef.current = new AbortController();
    
    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      completed: false
    });

    try {
      const progressCallback = (progress: number) => {
        setUploadState(prev => ({ ...prev, progress }));
      };

      const result = await onUpload(fileToUpload, progressCallback);
      
      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        completed: true
      });

      // Clear the selected file after successful upload
      setSelectedFile(null);
      
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      
      let errorMessage = 'Upload failed. Please try again.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Upload was cancelled.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Check your connection and try again.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File too large. Please choose a smaller file.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        completed: false
      });
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleFileSelect(selectedFile, true);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetUploadState();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const renderPreview = () => {
    if (!currentUrl) return null;

    if (isVideo) {
      return (
        <div className="relative inline-block">
          <video
            src={currentUrl}
            className="max-w-64 max-h-32 object-contain rounded"
            controls
            preload="metadata"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="relative inline-block">
          <img
            src={currentUrl}
            alt="Preview"
            className="max-w-32 max-h-32 object-contain rounded"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="relative inline-block">
        <div className="bg-gray-700 p-4 rounded flex items-center space-x-2">
          <div className="bg-purple-600/20 p-2 rounded">
            {isVideo ? <Video className="w-6 h-6 text-purple-400" /> : <Image className="w-6 h-6 text-purple-400" />}
          </div>
          <span className="text-white text-sm">{currentUrl.split('/').pop()}</span>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const renderUploadArea = () => {
    if (uploadState.uploading) {
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-600/20 p-4 rounded-full">
              <Upload className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-white text-sm">
                Uploading {selectedFile?.name}...
              </p>
              <span className="text-blue-400 text-sm">{uploadState.progress}%</span>
            </div>
            <Progress value={uploadState.progress} className="h-2" />
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="border-red-500/30 text-red-300"
              >
                Cancel Upload
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (uploadState.error) {
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-600/20 p-4 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-red-400 text-sm">{uploadState.error}</p>
            {selectedFile && (
              <p className="text-gray-400 text-xs">File: {selectedFile.name}</p>
            )}
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-blue-500/30 text-blue-300"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetUploadState}
                className="border-purple-500/30 text-purple-300"
              >
                Choose Different File
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (uploadState.completed && !currentUrl) {
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-600/20 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-green-400">Upload completed successfully!</p>
            <p className="text-gray-400 text-sm">File is ready to use</p>
          </div>
        </div>
      );
    }

    if (currentUrl) {
      return (
        <div className="space-y-4">
          {renderPreview()}
          <p className="text-sm text-gray-400">Click to replace {isVideo ? 'video' : 'image'}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-purple-600/20 p-4 rounded-full">
            <Upload className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div>
          <p className="text-white">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-400">
            {isVideo ? 'MP4, AVI, MOV up to 500MB' : 'PNG, JPG, GIF up to 5MB'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-gray-300">{label}</Label>
      
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-purple-500/30',
          disabled || uploadState.uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-500/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled && !uploadState.uploading ? openFileDialog : undefined}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || uploadState.uploading}
          className="hidden"
        />
        
        {renderUploadArea()}
      </div>
      
      {!currentUrl && !uploadState.uploading && !uploadState.error && (
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled || uploadState.uploading}
          className="w-full border-purple-500/30 text-purple-300"
        >
          {isVideo ? <Video className="w-4 h-4 mr-2" /> : <Image className="w-4 h-4 mr-2" />}
          Choose {isVideo ? 'Video' : 'File'}
        </Button>
      )}
    </div>
  );
}
