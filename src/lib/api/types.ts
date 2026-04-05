export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  message: string;
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;
