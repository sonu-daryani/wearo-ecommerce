"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </Button>
  );
}
