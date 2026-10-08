import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Reset your KamKarOAI password",
        `<p>Hi ${user.name},</p>
         <p>Click the link below to reset your password. It expires in 1 hour.</p>
         <p><a href="${url}">Reset password</a></p>
         <p>If you didn't request this, you can ignore this email.</p>`,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Verify your KamKarOAI email",
        `<p>Hi ${user.name},</p>
         <p>Please confirm your email address:</p>
         <p><a href="${url}">Verify email</a></p>`,
      );
    },
  },
  user: {
    additionalFields: {
      disabled: { type: "boolean", defaultValue: false, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { disabled: true },
          });
          if (user?.disabled) {
            throw new APIError("FORBIDDEN", { message: "This account has been disabled." });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
