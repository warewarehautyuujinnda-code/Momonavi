import sakuraPetalsImg from "@/assets/images/sakura-petals.png";

interface SakuraPetalsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "both-top" | "all";
  opacity?: number;
  size?: "sm" | "md" | "lg";
}

export function SakuraPetals({ 
  position = "both-top", 
  opacity = 0.6,
  size = "md" 
}: SakuraPetalsProps) {
  const sizeClasses = {
    sm: "w-24 h-24 sm:w-32 sm:h-32",
    md: "w-32 h-32 sm:w-48 sm:h-48",
    lg: "w-48 h-48 sm:w-64 sm:h-64",
  };

  const baseClasses = `absolute pointer-events-none ${sizeClasses[size]}`;

  return (
    <>
      {(position === "top-left" || position === "both-top" || position === "all") && (
        <img 
          src={sakuraPetalsImg} 
          alt="" 
          className={`${baseClasses} -top-8 -left-8 sm:-top-12 sm:-left-12 rotate-[-15deg]`}
          style={{ opacity }}
        />
      )}
      {(position === "top-right" || position === "both-top" || position === "all") && (
        <img 
          src={sakuraPetalsImg} 
          alt="" 
          className={`${baseClasses} -top-8 -right-8 sm:-top-12 sm:-right-12 rotate-[20deg] scale-x-[-1]`}
          style={{ opacity }}
        />
      )}
      {(position === "bottom-left" || position === "all") && (
        <img 
          src={sakuraPetalsImg} 
          alt="" 
          className={`${baseClasses} -bottom-8 -left-8 sm:-bottom-12 sm:-left-12 rotate-[160deg]`}
          style={{ opacity }}
        />
      )}
      {(position === "bottom-right" || position === "all") && (
        <img 
          src={sakuraPetalsImg} 
          alt="" 
          className={`${baseClasses} -bottom-8 -right-8 sm:-bottom-12 sm:-right-12 rotate-[-160deg] scale-x-[-1]`}
          style={{ opacity }}
        />
      )}
    </>
  );
}
