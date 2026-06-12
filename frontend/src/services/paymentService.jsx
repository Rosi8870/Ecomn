import { api } from "./api";

export const createPayment = (amount) =>
  api.post("/payment/create", { amount });

export const verifyPayment = (data) =>
  api.post("/payment/verify", data);
