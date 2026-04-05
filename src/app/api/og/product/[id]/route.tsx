import {
  absoluteUrl,
  SITE_DOMAIN,
  SITE_NAME,
} from "@/lib/site-config";
import { getPublicCompanySettings } from "@/lib/company-settings";
import { getProductById } from "@/lib/product-queries";
import { productDisplayPrice } from "@/lib/product-mapper";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

type Props = { params: { id: string } };

export async function GET(_request: Request, { params }: Props) {
  const id = Number(params.id);
  const product = Number.isFinite(id) ? await getProductById(id) : undefined;

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "white",
            fontSize: 36,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Product · {SITE_NAME}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const imageSrc = absoluteUrl(product.srcUrl);
  const company = await getPublicCompanySettings();
  const cur = company.currency;
  const price = productDisplayPrice(product, {
    code: cur.code,
    symbol: cur.symbol,
    locale: cur.locale,
    decimalPlaces: cur.decimalPlaces,
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "linear-gradient(105deg, #f8fafc 0%, #e2e8f0 45%, #dbeafe 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "48%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            background: "white",
          }}
        >
          <img
            src={imageSrc}
            alt=""
            width={420}
            height={420}
            style={{
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#2563eb",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {SITE_NAME}
          </span>
          <span
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            {product.title}
          </span>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#1e293b" }}>{price}</span>
          <span style={{ fontSize: 22, color: "#64748b", marginTop: 12 }}>
            {SITE_DOMAIN} · {product.rating.toFixed(1)} / 5 rating
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
