import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";

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
                    throw Error("missing credentials");
                }

                const email = credentials.email;
                const password = credentials.password as string;

                await connectDb();

                const user = await User.findOne({ email })

                if (!user) {
                    throw Error("user doesn't exists");
                }

                const isMatch = await bcrypt.compare(password, user.password)

                if (!isMatch) {
                    throw Error("incorrect password")
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            token.id = user.id,
            token.name = user.name,
            token.email = user.email,
            token.role = user.role

            return token;
        },

        async session({ token, session }) {
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