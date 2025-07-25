"use client";

import Image from "next/image";
import LogoB from "@/public/images/ROUGENOIR.svg";
import { useRouter } from "next/navigation";

interface SMPLogoProps {
  className?: string;
}

export default function Logo({ className }: SMPLogoProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <Image
      className={`max-w-none ${className}`}
      src={LogoB}
      width={164}
      alt="Logo Services"
      onClick={handleLogoClick}
      style={{ cursor: "pointer" }}
    />
  );
}