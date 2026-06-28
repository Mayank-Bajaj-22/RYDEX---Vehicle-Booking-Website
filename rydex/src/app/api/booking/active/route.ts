import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    let session;
    try {
        await connectDb();

        session = await auth();
        
        if (!session?.user) {
            return NextResponse.json(
                {
                    booking: null
                }
            )
        }

        const user = await User.findOne({ email: session.user.email });

        const booking = await Booking.findOne({
            user: user._id,
            bookingStatus: {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            }
        })

        if (!booking) {
            return NextResponse.json(
                {
                    booking: "idle"
                }
            )
        }

        return NextResponse.json(
            {
                booking
            }
        )
    } catch (error) {
        logger.error({
            action: "GET_ACTIVE_BOOKING_ERROR",
            userEmail: session?.user?.email,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error"
        });
        return NextResponse.json(
            {
                message: "Failed to fetch active booking"
            },
            {
                status: 500
            }
        )
    }
}