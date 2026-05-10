import React from "react";

export type SocialNetworks = {
  id: number;
  icon: React.ReactNode;
  url: string;
};

export type FLink = {
  id: number;
  label: string;
  url: string;
  /** Opens in a new tab (external URLs, social). */
  external?: boolean;
};

export type FooterLinks = {
  id: number;
  title: string;
  children: FLink[];
};

export type PaymentBadge = {
  id: number;
  srcUrl: string;
};
