"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useScrollLock } from '@/hooks/useScrollLock';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter, usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAppReady } from "@/contexts/AppReadyContext";
import { fetchCart } from "@/store/cartSlice";

function NavLink({ href, children }) {
    return (
        <TransitionLink href={href} className="relative group text-base font-sans transition-colors duration-300">
            {children}
        </TransitionLink>
    );
}

function CartLink({ itemCount }) {
    return (
        <TransitionLink
            href="/cart"
            className="relative group flex items-center justify-center font-sans text-base transition-transform duration-300 active:scale-90"
        >
            Cart
            {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-bold px-1">
                    {itemCount}
                </span>
            )}
        </TransitionLink>
    );
}

function UserIndicator({ user, logout }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        router.push("/");
    };

    if (!user) {
        return (
            <div className="flex items-center">
                <TransitionLink href="/login" className="text-base font-sans transition-colors">
                    SignIn
                </TransitionLink>
            </div>
        );
    }

    const initial = (user.username?.trim()?.[0] || "?").toUpperCase();

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={user.username ? `Account menu for ${user.username}` : "Account menu"}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-white/40 text-sm font-sans transition-all duration-300 active:scale-90"
            >
                {initial}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-4 w-48 bg-white text-black border border-white shadow-lg z-50 py-3 verflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <TransitionLink
                        href="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors "
                        onClick={() => setIsOpen(false)}
                    >
                        My Orders
                    </TransitionLink>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const dispatch = useDispatch();
    const { user, logout } = useAuth();
    const { ready } = useAppReady();
    const pathname = usePathname();
    const navRef = useRef(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useScrollLock(isMobileMenuOpen);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobileMenuOpen]);

    const itemCount = useSelector((state) =>
        state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    );

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    useGSAP(() => {
        if (!ready || !navRef.current) return;
        gsap.from(navRef.current, {
            y: -20,
            opacity: 0,
            duration: 0.8,
            ease: "cubic-bezier(0.23, 1, 0.32, 1)",
            delay: .5,
            clearProps: "opacity,transform",
        });
    }, { dependencies: [ready, pathname], scope: navRef });

    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (isAuthPage) {
        return (
            <header className="fixed top-0 left-0 w-full h-24 flex items-center justify-center z-50 px-4 text-white mix-blend-difference">
                <TransitionLink href="/" className="font-sans text-xl uppercase tracking-tighter">
                    Snitch.
                </TransitionLink>
            </header>
        );
    }

    return (
        <>
            <header
                ref={navRef}
                className="fixed top-0 inset-x-0 z-50 h-fit text-white mix-blend-difference isolate transform-[translateZ(0)]">
                <nav className="w-full h-full px-6 md:px-12 flex items-center justify-between pointer-events-none mt-2">
                    <div className="hidden md:flex items-center gap-6 px-8 py-3 pointer-events-auto bg-transparent">
                        <NavLink href="/products">Shop</NavLink>
                        <NavLink href="/journal">Journal</NavLink>
                        <NavLink href="/about">About</NavLink>
                        {user?.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
                    </div>
                    <div className="hidden md:flex items-center gap-8 pointer-events-auto =">
                        <CartLink itemCount={itemCount} />
                        <UserIndicator user={user} logout={logout} />
                    </div>
                    <div className="md:hidden flex items-center justify-between w-full pointer-events-auto ">
                        <div className=" px-6 bg-transparent">
                            <TransitionLink href="/" className="font-sans text-base font-bold uppercase tracking-tighter">
                                Snitch.
                            </TransitionLink>
                        </div>
                        <div className="flex items-center gap-6">
                            <CartLink itemCount={itemCount} />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 transition-transform duration-300 active:scale-90"
                                aria-label="Toggle Menu"
                            >
                                <svg width="24" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    {isMobileMenuOpen ? (
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                    ) : (
                                        <>
                                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>
            </header>
            <div
                className={`md:hidden fixed top-0 left-0 w-full h-[100dvh] z-40 bg-white text-black transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div className="h-full w-full overflow-y-auto overscroll-contain pt-24">
                    <div className="min-h-full flex flex-col items-center justify-center gap-8 text-center px-6 py-12">
                        <TransitionLink href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-sans text-black">Shop</TransitionLink>
                        <TransitionLink href="/journal" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-sans text-black">Journal</TransitionLink>
                        <TransitionLink href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-sans text-black">About</TransitionLink>
                        {user?.role === "admin" && (
                            <TransitionLink href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-sans text-black">Admin</TransitionLink>
                        )}
                        <div className="h-px w-12 bg-black/10 my-2" />
                        <UserIndicator user={user} logout={logout} />
                    </div>
                </div>
            </div>
        </>
    );
}