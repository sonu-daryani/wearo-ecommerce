"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavAuthIcon() {
  const { status } = useSession();

  const href =
    status === "authenticated" ? "/account" : "/auth/login";
  const label =
    status === "authenticated"
      ? "Account"
      : status === "loading"
        ? "Account"
        : "Sign in";

  return (
    <Link href={href} className="p-1" title={label} aria-label={label}>
      <Image
        priority
        src="/icons/user.svg"
        height={100}
        width={100}
        alt=""
        className="max-w-[22px] max-h-[22px]"
      />
    </Link>
  );
}
