"use client"
import { useState, useEffect } from "react"

const images = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Immobilier premium
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Façade moderne
    "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Interieur professionnel
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Maison avec jardin
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"  // Architecture résidentielle
]

export default function HeroSlider() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-200">
            {images.map((src, idx) => (
                <img
                    key={src}
                    src={src}
                    alt={`Présentation QAPRIL ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${current === idx ? "opacity-100" : "opacity-0"}`}
                />
            ))}
            {/* Overlay subtile pour uniformiser le design */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/40 to-transparent"></div>

            {/* Indicateurs de slide */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${current === idx ? "bg-white" : "bg-white/50 hover:bg-white/75"}`}
                        aria-label={`Aller au slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
