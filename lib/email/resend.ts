import { Resend } from "resend";
import { emailEnv } from "./env";

export const resend = emailEnv ? new Resend(emailEnv.RESEND_API_KEY) : null;
