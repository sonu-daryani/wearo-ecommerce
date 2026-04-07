import { createHash } from "crypto";

/** PayU web checkout request hash (matches PayU JS sample: udf1–udf5 empty + udf6–10 pipes). */
export function payuPaymentRequestHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}): string {
  const { key, txnid, amount, productinfo, firstname, email, salt } = params;
  const udf1 = "";
  const udf2 = "";
  const udf3 = "";
  const udf4 = "";
  const udf5 = "";
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return createHash("sha512").update(hashString).digest("hex");
}

/**
 * Reverse hash for PayU response (regular integration, no additional_charges / split).
 * sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function payuResponseReverseHashString(params: {
  salt: string;
  status: string;
  udf5: string;
  udf4: string;
  udf3: string;
  udf2: string;
  udf1: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
}): string {
  const p = params;
  return `${p.salt}|${p.status}||||||${p.udf5}|${p.udf4}|${p.udf3}|${p.udf2}|${p.udf1}|${p.email}|${p.firstname}|${p.productinfo}|${p.amount}|${p.txnid}|${p.key}`;
}

export function payuVerifyResponseHash(params: {
  salt: string;
  receivedHash: string;
  status: string;
  udf5?: string;
  udf4?: string;
  udf3?: string;
  udf2?: string;
  udf1?: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
}): boolean {
  const str = payuResponseReverseHashString({
    salt: params.salt,
    status: params.status,
    udf5: params.udf5 ?? "",
    udf4: params.udf4 ?? "",
    udf3: params.udf3 ?? "",
    udf2: params.udf2 ?? "",
    udf1: params.udf1 ?? "",
    email: params.email,
    firstname: params.firstname,
    productinfo: params.productinfo,
    amount: params.amount,
    txnid: params.txnid,
    key: params.key,
  });
  const expected = createHash("sha512").update(str).digest("hex");
  return expected.toLowerCase() === params.receivedHash.trim().toLowerCase();
}

export function payuPaymentEndpoint(): string {
  const env = process.env.PAYU_ENV?.trim().toLowerCase();
  return env === "production" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";
}
