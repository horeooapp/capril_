"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"

interface PropertyImage {
    id: string
    s3Key: string
    isMain: boolean
}

export default function PropertyImageGallery({ images }: { images: PropertyImage[] }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [showModal, setShowModal] = useState(false)

    if (!images || images.length === 0) {
        return (
            <div className="aspect-video bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                <span className="text-4xl opacity-20">🏘️</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">Aucune image disponible</p>
            </div>
        )
    }

    const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length)
    const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)

    return (
        <div className="space-y-4">
            {/* Main Image View */}
            <div className="relative aspect-video rounded-[2rem] overflow-hidden group shadow-2xl">
                <img 
                    src={images[activeIndex].s3Key} 
                    alt="Property" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="flex justify-between items-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                            {activeIndex + 1} / {images.length}
                        </span>
                        <button 
                            onClick={() => setShowModal(true)}
                            title="Agrandir l'image"
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
                        >
                            <Maximize2 size={16} />
                        </button>
                   </div>
                </div>

                {images.length > 1 && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            title="Image précédente"
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full text-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            title="Image suivante"
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full text-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button 
                            key={img.id}
                            onClick={() => setActiveIndex(idx)}
                            title={`Voir l'image ${idx + 1}`}
                            className={`relative min-w-[80px] h-[60px] rounded-xl overflow-hidden border-2 transition-all ${idx === activeIndex ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img.s3Key} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen Modal/Lightbox */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <button 
                        onClick={() => setShowModal(false)}
                        title="Fermer"
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>
                    
                    <button onClick={prevImage} title="Précédent" className="absolute left-8 p-4 text-white hover:bg-white/10 rounded-full transition-colors hidden md:block">
                        <ChevronLeft size={48} />
                    </button>
                    
                    <img 
                        src={images[activeIndex].s3Key} 
                        className="max-w-full max-h-full object-contain shadow-2xl"
                        alt="Property Full"
                    />
                    
                    <button onClick={nextImage} title="Suivant" className="absolute right-8 p-4 text-white hover:bg-white/10 rounded-full transition-colors hidden md:block">
                        <ChevronRight size={48} />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-black uppercase tracking-widest">
                        {activeIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    )
}
