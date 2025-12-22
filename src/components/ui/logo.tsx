'use client'
import Image, { ImageLoaderProps } from "next/image";

interface LogoProps {
    src?: string;
    width?: number;
    height?: number;
}
const url: string = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
const imageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
    return `${url}/${src}?w=${width}&q=${quality ?? 75}`
}


export function Logo({ width = 150, height = 100 }: LogoProps) {
    return (
        <Image placeholder="empty" loader={imageLoader} src={`${url}/__kioskfy-logo.png`} alt="kioskfy" width={width} height={height} />
    )
}