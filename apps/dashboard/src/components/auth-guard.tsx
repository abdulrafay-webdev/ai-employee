"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem("isLoggedIn");
        
        if (!loggedIn && pathname !== "/login") {
            router.push("/login");
        } else {
            setIsAuthorized(true);
        }
    }, [pathname, router]);

    if (!isAuthorized && pathname !== "/login") {
        return null; // Don't show anything while redirecting
    }

    return <>{children}</>;
}
