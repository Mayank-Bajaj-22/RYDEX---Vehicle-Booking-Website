import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        
        const { email, otp } = await req.json()

        if (!email || !otp) {
            logger.warn({
                action: "OTP_VERIFICATION_FAILED",
                reason: "MISSING_FIELDS"
            });

            return NextResponse.json(
                {
                    message: "email and otp is required"
                },
                {   
                    status: 400
                }
            )
        }

        let user = await User.findOne({ email });

        if (!user) {
            logger.warn({
                action: "OTP_VERIFICATION_FAILED",
                reason: "USER_NOT_FOUND",
                email
            });

            return NextResponse.json(
                {
                    message: "user not found"
                },
                {
                    status: 400
                }
            )
        }

        if (user.isEmailVerified) {
            logger.warn({
                action: "OTP_VERIFICATION_SKIPPED",
                reason: "EMAIL_ALREADY_VERIFIED",
                email
            });

            return NextResponse.json(
                {
                    message: "email is already verified"
                },
                {
                    status: 400
                }
            )
        }

        if (!user.otpExpiresIn || user.otpExpiresIn < Date.now()) {
            logger.warn({
                action: "OTP_VERIFICATION_FAILED",
                reason: "OTP_EXPIRED",
                email
            });

            return NextResponse.json(
                {
                    message: "otp has been expired"
                },
                {
                    status: 400
                }
            )
        }

        if (!user.otp || user.otp !== otp) {
            logger.warn({
                action: "OTP_VERIFICATION_FAILED",
                reason: "INVALID_OTP",
                email
            });

            return NextResponse.json(
                {
                    message: "invalid otp"
                },
                {
                    status: 400
                }
            )
        }

        user.isEmailVerified = true
        user.otp = undefined
        user.otpExpiresIn = undefined

        await user.save()

        logger.info({
            action: "EMAIL_VERIFIED",
            userId: user._id,
            email
        });

        return NextResponse.json(
            {
                message: "email is verified"
            },
            {
                status: 200
            }
        )

    } catch (error) {
        logger.error({
            action: "EMAIL_VERIFICATION_ERROR",
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });

        return NextResponse.json(
            {
                message: "Failed to verify email"
            },
            {
                status: 500
            }
        )
    }
}