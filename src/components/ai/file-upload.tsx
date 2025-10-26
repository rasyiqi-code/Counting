'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye
} from 'lucide-react';

interface FileUploadProps {
  onFileProcessed?: (result: any) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
  preview?: string;
}

export function FileUpload({
  onFileProcessed,
  onError,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', 'text/plain'],
  maxSize = 10
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    newFiles.forEach(uploadedFile => {
      processFile(uploadedFile);
    });
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, progress }
            : f
        ));
      }

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing' }
          : f
      ));

      // Simulate document processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate preview for images
      let preview = '';
      if (uploadedFile.file.type.startsWith('image/')) {
        preview = URL.createObjectURL(uploadedFile.file);
      }

      // Simulate extracted data
      const result = await simulateDocumentProcessing(uploadedFile.file);

      // Update status to completed
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'completed',
              result,
              preview
            }
          : f
      ));

      if (onFileProcessed) {
        onFileProcessed(result);
      }

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Processing failed'
            }
          : f
      ));

      if (onError) {
        onError(error instanceof Error ? error.message : 'Processing failed');
      }
    }
  };

  const simulateDocumentProcessing = async (file: File) => {
    // Simulate different processing based on file type
    if (file.type.startsWith('image/')) {
      return {
        type: 'receipt',
        extracted: {
          storeName: 'Toko ABC',
          date: '15/12/2024',
          totalAmount: '150,000',
          taxAmount: '15,000',
          paymentMethod: 'Cash'
        },
        lineItems: [
          { description: 'Produk A', quantity: 2, price: 50000 },
          { description: 'Produk B', quantity: 1, price: 50000 }
        ],
        confidence: 85
      };
    } else if (file.type === 'application/pdf') {
      return {
        type: 'invoice',
        extracted: {
          invoiceNumber: 'INV-2024-001',
          date: '15/12/2024',
          dueDate: '30/12/2024',
          customerName: 'PT. Customer ABC',
          totalAmount: '1,500,000',
          taxAmount: '150,000'
        },
        lineItems: [
          { description: 'Jasa Konsultasi', quantity: 1, price: 1000000 },
          { description: 'Biaya Transport', quantity: 1, price: 500000 }
        ],
        confidence: 92
      };
    } else {
      return {
        type: 'generic',
        extracted: {
          date: '15/12/2024',
          amount: '500,000',
          description: 'Transaksi umum'
        },
        confidence: 70
      };
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Dokumen
        </h3>
        <p className="text-gray-600 mb-4">
          Drag & drop file atau klik untuk memilih
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Format yang didukung: {acceptedTypes.join(', ')}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Maksimal {maxSize}MB per file, {maxFiles} file
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="mb-2"
        >
          Pilih File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">File yang Diupload</h4>
          {files.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadedFile.file)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(uploadedFile.status)}>
                    {getStatusIcon(uploadedFile.status)}
                    <span className="ml-1">
                      {uploadedFile.status === 'uploading' ? 'Uploading...' :
                       uploadedFile.status === 'processing' ? 'Processing...' :
                       uploadedFile.status === 'completed' ? 'Completed' :
                       uploadedFile.status === 'error' ? 'Error' : 'Unknown'}
                    </span>
                  </Badge>
                  
                  {uploadedFile.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('View result:', uploadedFile.result)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                <div className="mt-3">
                  <Progress value={uploadedFile.progress} className="h-2" />
                </div>
              )}

              {/* Error Message */}
              {uploadedFile.status === 'error' && uploadedFile.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{uploadedFile.error}</p>
                </div>
              )}

              {/* Preview */}
              {uploadedFile.preview && (
                <div className="mt-3">
                  <img
                    src={uploadedFile.preview}
                    alt="Preview"
                    className="max-w-xs h-32 object-cover rounded-md"
                  />
                </div>
              )}

              {/* Extracted Data */}
              {uploadedFile.status === 'completed' && uploadedFile.result && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <h5 className="font-medium text-green-800 mb-2">
                    Data yang Diekstrak:
                  </h5>
                  <div className="text-sm text-green-700">
                    <p><strong>Type:</strong> {uploadedFile.result.type}</p>
                    <p><strong>Confidence:</strong> {uploadedFile.result.confidence}%</p>
                    {uploadedFile.result.extracted && (
                      <div className="mt-2">
                        {Object.entries(uploadedFile.result.extracted).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {value as string}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

