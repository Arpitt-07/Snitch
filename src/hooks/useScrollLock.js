import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
    useEffect(() => {
        if (isLocked) {
            const scrollY = window.scrollY;
            document.documentElement.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            const scrollY = document.body.style.top;
            document.documentElement.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }

        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
        };
    }, [isLocked]);
};