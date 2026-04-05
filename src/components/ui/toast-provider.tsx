"use client";

import { Slide, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        limit={5}
        transition={Slide}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!rounded-2xl !shadow-lg !border !border-slate-200/90 !bg-white/95 !backdrop-blur-md !text-slate-900 !min-h-[3.25rem] !items-center"
        className="!p-3 !z-[99999]"
        bodyClassName="!font-sans !text-sm !font-medium !p-0 !m-0"
        progressClassName="!bg-slate-900/25 !h-1"
      />
    </>
  );
}
