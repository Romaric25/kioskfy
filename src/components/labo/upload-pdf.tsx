"use client";

import { useEffect } from "react";
import { AlertCircleIcon, FileText, UploadIcon, XIcon } from "lucide-react";

import { useFileUpload, usePresignedUpload } from "@/hooks";
import { Button } from "@/components/ui/button";

export interface UploadPdfProps {
  setValue?: (fieldName: string, value: unknown) => void;
  value?: unknown[];
  onChange?: (files: unknown[]) => void;
  error?: string;
  fieldName?: string;
  maxSizeMB?: number;
  labels?: {
    dropzone?: string;
    uploadButton?: string;
    addMoreButton?: string;
    filesUploaded?: string;
  };
  presignedUpload?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const UploadPdf = ({
  setValue,
  value,
  onChange,
  error,
  fieldName = "pdfFile",
  maxSizeMB = 250,
  labels = {},
  presignedUpload = false,
}: UploadPdfProps) => {
  const mergedLabels = {
    dropzone: labels.dropzone || "Déposer votre fichier PDF ici",
    uploadButton: labels.uploadButton || "Sélectionner un PDF",
    addMoreButton: labels.addMoreButton || "Changer le PDF",
    filesUploaded: labels.filesUploaded || "PDF téléchargé",
  };

  const maxSize = maxSizeMB * 1024 * 1024;

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
    accept: "application/pdf",
    maxSize,
    multiple: false,
    maxFiles: 1,

    onFilesAdded: async (files: unknown[]) => {
      if (files.length > 0) {
        const fileObjects = files.map(
          (file: unknown) => (file as { file: File }).file
        );

        if (presignedUpload) {
          try {
            // Upload single file (since maxFiles: 1)
            const file = fileObjects[0];
            const result = await uploadFile(file);

            if (result) {
              const uploadedResult = [{
                ...result,
                file: file, // Keep reference if needed
                name: file.name,
                type: file.type,
                size: file.size
              }];
              setValue?.(fieldName, uploadedResult);
              onChange?.(uploadedResult);
            }
          } catch (e) {
            console.error("PDF Upload failed", e);
          }
        } else {
          const base64Files = await convertFilesToBase64(fileObjects);
          setValue?.(fieldName, base64Files);
          onChange?.(base64Files);
        }
      }
    },
  });

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const normalizedFiles = value.map((item: any) => {
        if (item.file) return item;
        return {
          file: item,
          id: item.id || `file-${Date.now()}-${Math.random()}`,
          preview: item.preview || item.url,
        };
      });
      setFiles(normalizedFiles);
    }
  }, [value, setFiles]);

  const handleRemoveFile = async (fileId: string) => {
    removeFile(fileId);
    setValue?.(fieldName, []);
    onChange?.([]);
  };

  return (
    <div className="flex flex-col gap-2">
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
          aria-label="Upload PDF file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                {mergedLabels.filesUploaded}
                {isUploading && <span className="ml-2 text-xs text-muted-foreground animate-pulse">Upload en cours...</span>}
              </h3>
              <Button variant="outline" size="sm" onClick={openFileDialog}>
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                {mergedLabels.addMoreButton}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center justify-center size-12 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <FileText className="size-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF • {formatFileSize(file.file.size)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemoveFile(file.id)}
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer le PDF"
                  >
                    <XIcon className="size-4" />
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
              <FileText className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              {mergedLabels.dropzone}
            </p>
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
