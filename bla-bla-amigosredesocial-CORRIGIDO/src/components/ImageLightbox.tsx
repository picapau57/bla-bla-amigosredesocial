import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCw, Download, Copy, Check, RefreshCw, Maximize2, Minimize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

export default function ImageLightbox({ isOpen, imageUrl, altText = 'Image Preview', onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset transforms when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    // Attempt download using anchor fetch or open in new tab
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = altText.replace(/\s+/g, '_') || 'downloaded_image';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return; // Only drag when zoomed in
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Bounds checking based on scale (rough estimate)
    const bound = (scale - 1) * 250;
    setPosition({
      x: Math.max(-bound, Math.min(bound, newX)),
      y: Math.max(-bound, Math.min(bound, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#02020a]/95 backdrop-blur-md flex flex-col justify-between"
          id="image-lightbox-overlay"
          ref={containerRef}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header Controls */}
          <div className="p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between z-10">
            <div className="flex flex-col">
              <span className="text-white text-xs font-extrabold truncate max-w-[200px] sm:max-w-xs">{altText}</span>
              {scale > 1 && (
                <span className="text-[10px] text-orange-400 font-mono animate-pulse">
                  Arraste para navegar na imagem ampliada ({Math.round(scale * 100)}%)
                </span>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Reduzir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 4}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Rotacionar 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Resetar Ajustes"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-5 bg-white/10 mx-1 hidden sm:block" />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer relative"
                title="Copiar Link da Imagem"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {isCopied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] bg-green-500 text-white font-mono font-bold px-1.5 py-0.5 rounded shadow">
                    Copiado!
                  </span>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Baixar Imagem"
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-5 bg-white/10 mx-1" />
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-lg text-white transition-all cursor-pointer"
                title="Fechar"
              >
                <X className="w-4.5 h-4.5 font-bold" />
              </button>
            </div>
          </div>

          {/* Interactive Image Container */}
          <div 
            className={`flex-1 flex items-center justify-center overflow-hidden p-4 relative ${
              scale > 1 ? 'cursor-grab' : 'cursor-default'
            } ${isDragging ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            id="lightbox-image-viewport"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.div
              animate={{ 
                scale, 
                rotate: rotation,
                x: position.x,
                y: position.y
              }}
              transition={{ 
                type: isDragging ? 'just' : 'spring', 
                stiffness: 300, 
                damping: 25 
              }}
              className="max-w-full max-h-[75vh] flex items-center justify-center select-none"
            >
              <img
                src={imageUrl}
                alt={altText}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
              />
            </motion.div>
          </div>

          {/* Footer Navigation or zoom display */}
          <div className="p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center text-gray-400 text-[10px] font-mono gap-4">
            <span>Zoom: {Math.round(scale * 100)}%</span>
            <span>•</span>
            <span>Rotação: {rotation}°</span>
            <span>•</span>
            <button 
              onClick={handleReset}
              className="hover:text-white underline cursor-pointer"
            >
              Restaurar Original
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
