"use client";

import { useEffect } from "react";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";

import { useFileUpload, usePresignedUpload } from "@/hooks";
import { Button } from "@/components/ui/button";

export interface UploadFileProps {
  // React Hook Form props
  getValues?: any;
  setValue?: (fieldName: string, value: any) => void;
  value?: any[];
  onChange?: (files: any[]) => void;
  error?: string;

  // Configuration props
  fieldName?: string; // Field name to set in the form (default: "images")
  accept?: string; // File types to accept (default: "image/*")
  maxSizeMB?: number; // Maximum file size in MB (default: 5)
  maxFiles?: number; // Maximum number of files (default: 1)
  multiple?: boolean; // Allow multiple files (default: false)
  convertToBase64?: boolean; // Convert files to base64 (default: true)
  presignedUpload?: boolean; // Use presigned upload (default: false)

  // Label props
  labels?: {
    dropzone?: string; // Drop zone text (default: "Déposer vos images ici")
    uploadButton?: string; // Upload button text (default: "Sélectionner le logo")
    addMoreButton?: string; // Add more button text (default: "Ajouter plus")
    filesUploaded?: string; // Files uploaded header (default: "Fichiers téléchargés")
  };
}

export const UploadFile = ({
  getValues,
  setValue,
  value,
  onChange,
  error,
  fieldName = "images",
  accept = "image/*",
  maxSizeMB = 5,
  maxFiles = 1,
  multiple = false,
  convertToBase64 = true,
  presignedUpload = false,
  labels = {},
}: UploadFileProps) => {
  // Merge default labels with provided labels
  const mergedLabels = {
    dropzone: labels.dropzone || "Déposer vos fichiers ici",
    uploadButton: labels.uploadButton || "Sélectionner des fichiers",
    addMoreButton: labels.addMoreButton || "Ajouter plus",
    filesUploaded: labels.filesUploaded || "Fichiers téléchargés",
  };

  const maxSize = maxSizeMB * 1024 * 1024;

  // Fonction utilitaire pour convertir des fichiers en base64
  const convertFilesToBase64 = async (fileObjects: File[]) => {
    return Promise.all(
      fileObjects.map(async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              file,
              base64: reader.result as string,
              name: file.name,
              type: file.type,
              size: file.size,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const { uploadFile, isUploading } = usePresignedUpload();

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      setFiles,
    },
  ] = useFileUpload({
    accept,
    maxSize,
    multiple,
    maxFiles,

    onFilesAdded: async (files: any[]) => {
      if (files.length > 0) {
        const fileObjects = files.map((file) => file.file);

        if (presignedUpload) {
          try {
            // Upload sequentially to ensure order and avoid overwhelming
            const uploadedResults = [];
            for (const file of fileObjects) {
              const result = await uploadFile(file);
              if (result) {
                uploadedResults.push({
                  ...result,
                  // Add preview for UI consistency if needed, but result.url should be valid
                  preview: result.url,
                  name: file.name,
                  type: file.type,
                  size: file.size
                });
              }
            }
            if (uploadedResults.length > 0) {
              setValue?.(fieldName, uploadedResults);
              onChange?.(uploadedResults);
            }
          } catch (e) {
            console.error("Presigned upload failed", e);
          }
        } else if (convertToBase64) {
          const base64Files = await convertFilesToBase64(fileObjects);
          setValue?.(fieldName, base64Files);
          onChange?.(base64Files);
        } else {
          setValue?.(fieldName, fileObjects);
          onChange?.(fileObjects);
        }
      }
    },
  });

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const normalizedFiles = value.map((item) => {
        // If item is already wrapped (has .file), use it
        if (item.file) return item;
        // Otherwise wrap it
        return {
          file: item,
          id: item.id || `file-${Date.now()}-${Math.random()}`,
          preview: item.preview || item.url,
        };
      });
      setFiles(normalizedFiles);
    }
  }, [value, setFiles]);

  // Fonction pour gérer la suppression d'un fichier
  const handleRemoveFile = async (fileId: string) => {
    removeFile(fileId);
    const remainingFiles = files.filter((file) => file.id !== fileId);

    if (remainingFiles.length > 0) {
      const fileObjects = remainingFiles.map((file) => file.file as File);

      if (convertToBase64) {
        const base64Files = await convertFilesToBase64(fileObjects);
        setValue?.(fieldName, base64Files);
        onChange?.(base64Files);
      } else {
        setValue?.(fieldName, fileObjects);
        onChange?.(fileObjects);
      }
    } else {
      setValue?.(fieldName, []);
      onChange?.([]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="relative flex min-h-30 flex-col items-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                {mergedLabels.filesUploaded} ({files.length})
                {isUploading && <span className="ml-2 text-xs text-muted-foreground animate-pulse">Upload en cours...</span>}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={files.length >= maxFiles}
              >
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                {mergedLabels.addMoreButton}
              </Button>
            </div>

            <div
              className={
                maxFiles === 1
                  ? "grid grid-cols-1"
                  : "grid grid-cols-2 gap-4 md:grid-cols-3"
              }
            >
              {files.map((file) => (
                <div
                  key={file.id}
                  className="relative aspect-square rounded-md bg-accent"
                >
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="size-full rounded-[inherit] object-cover"
                  />
                  <Button
                    onClick={() => handleRemoveFile(file.id)}
                    size="icon"
                    className="absolute -top-2 -right-2 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
                    aria-label="Remove image"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">{mergedLabels.dropzone}</p>
            <p className="text-xs text-muted-foreground">
              (max. {maxSizeMB}MB)
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={openFileDialog}
            >
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              {mergedLabels.uploadButton}
            </Button>
          </div>
        )}
      </div>

      {(errors.length > 0 || error) && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error || errors[0]}</span>
        </div>
      )}
    </div>
  );
}
