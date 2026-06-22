import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
import { logger } from "./lib/logger";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // credentials se hume baas email or password milega
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****",
                },
            },

            // authorize ke anadar hum logic likhenge kya karna hai
            async authorize(credentials, request) {
                if (!credentials.email || !credentials.password) {
                    logger.warn({
                        action: "LOGIN_FAILED",
                        reason: "MISSING_CREDENTIALS"
                    });

                    throw new Error("Missing credentials");
                }

                const email = credentials.email;
                const password = credentials.password as string;

                await connectDb();

                const user = await User.findOne({ email })

                if (!user) {
                    logger.warn({
                        action: "LOGIN_FAILED",
                        reason: "USER_NOT_FOUND",
                        email
                    });

                    throw new Error("User does not exist");
                }

                const isMatch = await bcrypt.compare(password, user.password)

                if (!isMatch) {
                    logger.warn({
                        action: "LOGIN_FAILED",
                        reason: "INVALID_PASSWORD",
                        email
                    });

                    throw new Error("Incorrect password");
                }

                logger.info({
                    action: "USER_LOGIN_SUCCESS",
                    userId: user._id,
                    email: user.email,
                    provider: "credentials"
                });

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            },
        }),

        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!
        })
    ],

    callbacks: {
        async signIn({ user, account }) {
            // console.log("DB USER ROLE:", dbUser.role);
            if (account?.provider === "google") {        
                logger.info({
                    action: "GOOGLE_SIGNIN_STARTED",
                    email: user.email
                });

                await connectDb();

                let dbUser = await User.findOne({ email: user.email });

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email
                    })

                    logger.info({
                        action: "USER_REGISTERED_GOOGLE",
                        userId: dbUser._id,
                        email: dbUser.email,
                    });
                }

                logger.info({
                    action: "USER_LOGIN_SUCCESS",
                    userId: dbUser._id,
                    email: dbUser.email,
                    provider: "google",
                });

                user.id = dbUser._id.toString();
                user.role = dbUser.role;
            }

            return true
        },

        async jwt({ token, user }) {
            // console.log("JWT USER:", user);
            // console.log("JWT TOKEN:", token);
            if (user) {
                token.id = user.id,
                token.name = user.name,
                token.email = user.email,
                token.role = user.role
            }

            return token;
        },

        async session({ token, session }) {
            // console.log("SESSION ROLE:", token.role);
            if (session.user) {
                session.user.id = token.id as string,
                session.user.name = token.name as string,
                session.user.email = token.email as string,
                session.user.role = token.role as string
            }

            return session;
        }
    },

    pages: {
        signIn: '/signin',
        error: '/signin'
    },

    session: {
        strategy: "jwt",
        maxAge: 10*24*60*60
    },

    secret: process.env.AUTH_SECRET
})