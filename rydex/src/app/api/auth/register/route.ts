import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();
        await connectDb();

        let user = await User.findOne({ email })
        if (user && user.isEmailVerified) { // user bhi hai aur verified bhi hai execute this
            logger.warn({
                action: "REGISTRATION_FAILED",
                reason: "EMAIL_ALREADY_EXISTS",
                email
            });

            return NextResponse.json(
                {
                    message: "email already exists!"
                },
                {
                    status: 400
                }
            )
        }

        if (password.length < 6) {
            logger.warn({
                action: "REGISTRATION_FAILED",
                reason: "WEAK_PASSWORD",
                email
            });

            return NextResponse.json(
                {
                    message: "password must be at least 6 characters"
                },
                {
                    status: 400
                }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresTime = new Date(Date.now() + 10*60*1000);

        if (user && !user.isEmailVerified) { // user hai par verified nhi jab yeh chalega 
            user.name = name;
            user.password = hashedPassword;
            user.email = email;
            user.otp = otp;
            user.otpExpiresIn = otpExpiresTime;

            await user.save();

            logger.info({
                action: "UNVERIFIED_USER_UPDATED",
                email,
            });
        } else {
            user = await User.create({
                name, 
                email, 
                password: hashedPassword, 
                otp, 
                otpExpiresIn: otpExpiresTime
            })

            logger.info({
                action: "USER_REGISTERED",
                userId: user._id,
                email,
            });
        }

        await sendMail(
            email,
            "Your OTP for Email Verification",
            `<h2>Your Email Verification OTP is <strong>${otp}</strong></h2>`
        );

        logger.info({
            action: "OTP_SENT",
            email,
        });

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully"
            },
            {
                status: 201
            }
        )
    } catch (error) {
        logger.error({
            action: "USER_REGISTRATION_FAILED",
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });

        return NextResponse.json(
            {
                message: `register error ${error}`
            },
            {
                status: 500
            }
        )
    }
}