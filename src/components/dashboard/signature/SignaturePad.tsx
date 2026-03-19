"use client"

import { useRef, useState, useEffect } from "react";
import { Eraser, Check, X, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#4F46E5"; // Indigo-600
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setIsEmpty(false);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.closePath();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onClear) onClear();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 border-2 border-dashed border-gray-800 rounded-2xl overflow-hidden group">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-48 cursor-crosshair touch-none"
        />
        
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-700">
            <RotateCcw className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-30">Signez ici</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex gap-2">
          <button 
            type="button"
            onClick={clear}
            className="p-3 bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-xl transition-all"
            title="Effacer"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={save}
          disabled={isEmpty}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Confirmer la signature
        </button>
      </div>
    </div>
  );
}
