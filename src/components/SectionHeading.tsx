"use client"

export default function SectionHeading({ 
    title, 
    subtitle, 
    alignment = "center",
    dark = false 
}: { 
    title: string, 
    subtitle?: string, 
    alignment?: "left" | "center",
    dark?: boolean 
}) {
    return (
        <div className={`mb-12 ${alignment === "center" ? "text-center" : "text-left"}`}>
            {subtitle && (
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ${dark ? "text-orange-300" : "text-orange-500"}`}>
                    {subtitle}
                </span>
            )}
            <h2 className={`text-3xl md:text-5xl font-black tracking-tighter ${dark ? "text-white" : "text-gray-900"} leading-none mb-4`}>
                {title}
            </h2>
            <div className={`h-1.5 w-24 bg-primary rounded-full ${alignment === "center" ? "mx-auto" : "mr-auto"}`}></div>
        </div>
    )
}
