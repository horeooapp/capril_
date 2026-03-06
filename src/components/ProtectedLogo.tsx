"use client"

import React from 'react'

interface ProtectedLogoProps {
    src: string
    alt: string
    className?: string
}

export default function ProtectedLogo({ src, alt, className }: ProtectedLogoProps) {
    return (
        <div 
            className="logo-container" 
            onContextMenu={(e) => e.preventDefault()}
        >
            <img 
                src={src} 
                alt={alt} 
                className={`${className} logo-shield`}
                draggable="false"
            />
        </div>
    )
}
