import { useState, useRef } from 'react';
import { uploadCaseImage, deleteCaseImage } from '../../services/supabase';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  maxSizeMB?: number;
}

export const ImageUploader = ({ 
  currentImageUrl, 
  onImageChange, 
  maxSizeMB = 1
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Apenas imagens são permitidas.';
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxSizeMB}MB.`;
    }
    
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    try {
      setUploading(true);
      
      // Remover imagem anterior se existir
      if (currentImageUrl) {
        try {
          await deleteCaseImage(currentImageUrl);
        } catch (deleteError) {
          console.warn('Erro ao remover imagem anterior:', deleteError);
        }
      }
      
      const imageUrl = await uploadCaseImage(file);
      onImageChange(imageUrl);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;
    
    if (!confirm('Tem certeza que deseja remover esta imagem?')) {
      return;
    }
    
    try {
      await deleteCaseImage(currentImageUrl);
      onImageChange('');
    } catch (error: any) {
      console.warn('Erro ao remover imagem:', error);
      onImageChange(''); // Remove da UI mesmo se houver erro
    }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center group">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={uploading}
              >
                {uploading ? 'Enviando...' : 'Alterar'}
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={uploading}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600">Enviando imagem...</p>
              </>
            ) : (
              <>
                <div className="text-gray-400">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    Clique para selecionar ou arraste uma imagem
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Formatos aceitos: JPG, PNG, GIF (máximo {maxSizeMB}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {currentImageUrl && (
        <div className="text-xs text-gray-500">
          <p>
            Dica: Passe o mouse sobre a imagem para ver as opções de edição.
          </p>
        </div>
      )}
    </div>
  );
};