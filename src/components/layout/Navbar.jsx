"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter, usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAppReady } from "@/contexts/AppReadyContext";
import { fetchCart } from "@/store/cartSlice";

function NavLink({ href, children }) {
    return (
        <TransitionLink href={href} className="relative group py-2 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300">
            {children}
        </TransitionLink>
    );
}

function CartLink({ itemCount }) {
    return (
        <TransitionLink
            href="/cart"
            className="relative group p-3 rounded-full transition-transform duration-300 active:scale-90 hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-transform duration-300 group-hover:rotate-12">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-bold px-1">
                    {itemCount}
                </span>
            )}
        </TransitionLink>
    );
}

function UserIndicator({ user, logout, theme = "dark" }) {
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

    const textColor = theme === "dark" ? "text-white" : "text-black";

    if (!user) {
        return (
            <div className="flex items-center gap-4 md:gap-6">
                <TransitionLink href="/login" className={`text-xs font-medium uppercase tracking-widest transition-colors px-2 py-2 ${textColor}`}>
                    Login
                </TransitionLink>
                <TransitionLink href="/register" className={`text-xs font-medium uppercase tracking-widest transition-colors px-2 py-2 ${textColor}`}>
                    Register
                </TransitionLink>
            </div>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-11 h-11 rounded-full overflow-hidden transition-all duration-300 active:scale-90 ${theme === "dark" ? "hover:ring-1 ring-white/40" : "hover:ring-1 ring-black/40"
                    }`}
            >
                {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                    <span className={`text-[10px] font-medium uppercase ${theme === "dark" ? "text-white" : "text-black"}`}>{user.username?.charAt(0).toUpperCase()}</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-0 mt-4 w-48 bg-white text-black border border-black/5 shadow-2xl z-50 py-3 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-w-[calc(100vw-2rem)]">
                    <TransitionLink
                        href="/orders"
                        className="block px-4 py-2 text-[11px] font-medium uppercase tracking-wider hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        My Orders
                    </TransitionLink>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-[11px] font-medium uppercase tracking-wider hover:bg-gray-50 transition-colors"
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

    // FIX: Automatically close the mobile menu whenever the page pathname changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Robust Scroll Lock for Mobile Menu
    useEffect(() => {
        if (isMobileMenuOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.overflow = "";
            window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }
        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

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
        if (!ready) return;
        gsap.from(navRef.current, {
            y: -20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2,
            clearProps: "opacity,transform",
        });
    }, [ready]);

    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAuthPage) {
        return (
            <header className="fixed top-0 left-0 w-full h-16 flex items-center justify-center z-50 px-4 mix-blend-difference text-white">
                <TransitionLink href="/" className="font-black text-xl uppercase tracking-tighter">
                    Snitch<span className="">.</span>
                </TransitionLink>
            </header>
        );
    }

    return (
        <>
            <header
                ref={navRef}
                className="fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out h-20 bg-transparent mix-blend-difference text-white isolate [transform:translateZ(0)]">
                <nav className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between pointer-events-none">
                    <div className="shrink-0 pointer-events-auto">
                        <TransitionLink href="/" className="font-black text-xl md:text-2xl uppercase tracking-tighter">
                            Snitch<span className="text-white/50">.</span>
                        </TransitionLink>
                    </div>

                    <div className="hidden md:flex items-center gap-12 pointer-events-auto">
                        <div className="flex items-center gap-10">
                            <NavLink href="/products">Shop</NavLink>
                            <NavLink href="/journal">Journal</NavLink>
                            <NavLink href="/about">About</NavLink>
                            {user?.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
                        </div>

                        <div className="flex items-center gap-8">
                            <UserIndicator user={user} logout={logout} />
                            <CartLink itemCount={itemCount} />
                        </div>
                    </div>

                    <div className="md:hidden flex items-center gap-4 pointer-events-auto">
                        <CartLink itemCount={itemCount} />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 transition-transform duration-300 active:scale-90"
                            aria-label="Toggle Menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden fixed top-0 left-0 w-full h-[100dvh] z-40 bg-white text-black transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div className="h-full w-full overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                    <div className="min-h-full flex flex-col items-center justify-center gap-8 text-center px-6 py-24">
                        <TransitionLink
                            href="/products"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-2xl font-black uppercase tracking-tighter text-black hover:opacity-50 transition-opacity py-2"
                        >
                            Shop
                        </TransitionLink>
                        <TransitionLink
                            href="/journal"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-2xl font-black uppercase tracking-tighter text-black hover:opacity-50 transition-opacity py-2"
                        >
                            Journal
                        </TransitionLink>
                        <TransitionLink
                            href="/about"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-2xl font-black uppercase tracking-tighter text-black hover:opacity-50 transition-opacity py-2"
                        >
                            About
                        </TransitionLink>
                        {user?.role === "admin" && (
                            <TransitionLink
                                href="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-2xl font-black uppercase tracking-tighter text-black hover:opacity-50 transition-opacity py-2"
                            >
                                Admin
                            </TransitionLink>
                        )}
                        <div className="h-px w-12 bg-black/10 my-2" />
                        <div className="flex items-center justify-center gap-6">
                            <UserIndicator user={user} logout={logout} theme="light" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}