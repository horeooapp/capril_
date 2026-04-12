"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function InteractiveBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Base layer */}
            <div className="absolute inset-0 bg-[#F6F8FA]"></div>
            
            <div className="relative w-full h-full opacity-60">
                {/* Orb 1: Imperial Gold */}
                <motion.div 
                    animate={{
                        x: mousePosition.x * -0.02 + 100,
                        y: mousePosition.y * -0.02 - 50,
                    }}
                    transition={{ type: "spring", damping: 100, stiffness: 20 }}
                    className="absolute top-[10%] left-[15%] w-[800px] h-[800px] bg-[#CBA358] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.15] animate-pulse-slow"
                />

                {/* Orb 2: Midnight Onyx */}
                <motion.div 
                    animate={{
                        x: mousePosition.x * 0.03 - 200,
                        y: mousePosition.y * 0.03 + 100,
                    }}
                    transition={{ type: "spring", damping: 100, stiffness: 10 }}
                    className="absolute top-[40%] right-[10%] w-[900px] h-[900px] bg-[#0A0F1D] rounded-full mix-blend-overlay filter blur-[150px] opacity-[0.08]"
                />

                {/* Orb 3: Trust Emerald */}
                <motion.div 
                    animate={{
                        x: mousePosition.x * -0.01 + 50,
                        y: mousePosition.y * 0.01 + 200,
                    }}
                    transition={{ type: "spring", damping: 100, stiffness: 15 }}
                    className="absolute -bottom-[20%] left-[40%] w-[1000px] h-[700px] bg-[#026343] rounded-[100%] mix-blend-multiply filter blur-[150px] opacity-[0.12] animate-pulse-slow"
                    style={{ animationDelay: '2s' }}
                />
            </div>
            
            {/* Glassmorphism subtle noise overlay to add texture */}
            <div className="absolute inset-0 bg-ivory-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F6F8FA] to-[#F6F8FA]"></div>
        </div>
    )
}
