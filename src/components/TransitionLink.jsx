
"use client";
import React from 'react';
import { useTransitionRouter } from './TransitionProvider.jsx'

export default function TransitionLink({ href, children, className, ...props }) {
  const { navigateWithTransition } = useTransitionRouter();

  return (
    <a
      {...props}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigateWithTransition(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
}