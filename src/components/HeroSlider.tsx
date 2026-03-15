"use client"

import { useState, useEffect } from "react"

const images = [
    "/hero_abidjan_modern_district_1773609699145.png",
    "/hero_ivory_coast_home_interior_1773609718319.png",
    "/hero_abidjan_skyline_dusk_1773609749211.png",
    "/hero_family_moving_new_home_1773609766414.png",
    "/hero_abidjan_night_lights_1773609789756.png"
]

export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 6000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="absolute inset-0 z-0">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <img 
                        src={img} 
                        alt={`Slide ${index + 1}`} 
                        className="w-full h-full object-cover grayscale-[10%] brightness-[75%]"
                    />
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/30 to-transparent"></div>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {images.map((_, index) => (
                    <div 
                        key={index}
                        className={`h-1 transition-all duration-500 rounded-full ${
                            index === currentIndex ? "w-8 bg-primary" : "w-4 bg-gray-400/30"
                        }`}
                    ></div>
                ))}
            </div>
        </div>
    )
}
