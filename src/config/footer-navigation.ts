import type { FooterLinks } from "@/components/layout/Footer/footer.types";
import { getYoutubePlaylistUrl } from "@/lib/site-config";

/** Single source of truth for footer column links — keep in sync with `app/` routes. */
export function getFooterLinkSections(): FooterLinks[] {
  const youtubeUrl = getYoutubePlaylistUrl();

  return [
    {
      id: 1,
      title: "company",
      children: [
        { id: 11, label: "about", url: "/about" },
        { id: 12, label: "features", url: "/features" },
        { id: 13, label: "works", url: "/works" },
        { id: 14, label: "career", url: "/careers" },
      ],
    },
    {
      id: 2,
      title: "help",
      children: [
        { id: 21, label: "customer support", url: "/support" },
        { id: 22, label: "delivery details", url: "/delivery" },
        { id: 23, label: "terms & conditions", url: "/terms" },
        { id: 24, label: "privacy policy", url: "/privacy" },
      ],
    },
    {
      id: 3,
      title: "faq",
      children: [
        { id: 31, label: "account", url: "/account" },
        { id: 32, label: "manage deliveries", url: "/delivery#tracking" },
        { id: 33, label: "orders", url: "/help/orders" },
        { id: 34, label: "payments", url: "/help/payments" },
      ],
    },
    {
      id: 4,
      title: "resources",
      children: [
        { id: 41, label: "Free eBooks", url: "/resources/ebooks" },
        { id: 42, label: "development tutorial", url: "/resources/tutorials" },
        { id: 43, label: "How to - Blog", url: "/resources/blog" },
        {
          id: 44,
          label: "youtube playlist",
          url: youtubeUrl,
          external: true,
        },
      ],
    },
  ];
}
