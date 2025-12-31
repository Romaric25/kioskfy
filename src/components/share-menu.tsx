"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Mail, Link2, Facebook, Linkedin, Twitter, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface ShareMenuProps {
    title: string;
    text: string;
    url: string;
}

// Icons components
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
);

const MessengerIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.245c1.09.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.108S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.96 3.13 3.259 5.889-3.258-6.56 6.959z" /></svg>
);

const BlueskyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.81 9.498 7.823 4.308 4.557-5.073 1.082-6.498-2.83-7.078-.139-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.686 12 10.8Z" /></svg>
);

export function ShareMenu({ title, text, url }: ShareMenuProps) {
    const encodedUrl = encodeURIComponent(url || "");
    const encodedText = encodeURIComponent(text || "");
    const encodedTitle = encodeURIComponent(title || "");

    const shareLinks = [
        {
            name: "Facebook",
            icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "text-blue-600",
        },
        {
            name: "X (Twitter)",
            icon: Twitter, // Lucide Twitter is simpler than X icon
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            color: "text-black dark:text-white",
        },
        {
            name: "WhatsApp",
            icon: WhatsAppIcon,
            href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            color: "text-green-500",
        },
        {
            name: "Telegram",
            icon: TelegramIcon,
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            color: "text-blue-400",
        },
        {
            name: "Messenger",
            icon: MessengerIcon,
            href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291474419146&redirect_uri=${encodedUrl}`, // Requiert un App ID. Fallback or generic share often used. 
            // Better to use generic share for messenger or specific mobile link if targetting mobile.
            // Using a common known workaround or just generic.
            // Actually 'fb-messenger://share/?link=' works on mobile devices.
            // For web, it's tricky without App ID. I'll use a generic approach or stick to what is standard.
            // Let's us native share fallback for messenger if possible or just use the dialog link which might warn but work if config exists. 
            // Or remove color and keep it generic.
            color: "text-blue-500",
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "text-blue-700",
        },
        {
            name: "Email",
            icon: Mail,
            href: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
            color: "text-gray-600",
        },
        {
            name: "Bluesky",
            icon: BlueskyIcon,
            href: `https://bsky.app/intent/compose?text=${encodedText}%20${encodedUrl}`,
            color: "text-blue-500",
        },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Lien copié !");
        } catch (err) {
            toast.error("Erreur lors de la copie");
        }
    };

    const handleShare = async (link: string) => {
        if (link.startsWith("http")) {
            window.open(link, "_blank", "width=600,height=400");
        } else if (link.startsWith("mailto:")) {
            window.location.href = link;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    title="Partager"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Partager sur</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {shareLinks.map((item) => (
                    <DropdownMenuItem
                        key={item.name}
                        onClick={() => handleShare(item.href)}
                        className="cursor-pointer gap-2"
                    >
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span>{item.name}</span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer gap-2">
                    <Link2 className="h-4 w-4" />
                    <span>Copier le lien</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
