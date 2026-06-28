import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{id: string}> }
) {
    let booking;
    try {
        const id = (await context.params).id

        await connectDb();

        booking = await Booking.findById(id);
        
        if (!booking || booking.bookingStatus !== "requested") {
            logger.warn({
                action: "BOOKING_CANCELLATION_FAILED",
                reason: "INVALID_BOOKING",
                bookingId: id
            });

            return NextResponse.json(
                {
                    message: "invalid"
                },
                {
                    status: 400
                }
            )
        }
    booking.bookingStatus = "cancelled"

    await booking.save()

    logger.info({
        action: "BOOKING_CANCELLED",
        bookingId: id,
        userId: booking.user
    });

    return NextResponse.json(
        {
            success: true
        },
        {
            status: 200
        }
    )

    } catch (error) {
        logger.error({
            action: "BOOKING_CANCELLATION_ERROR",
            bookingId: booking._id,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error"
        });

        return NextResponse.json(
            {
                message: "Failed to cancel booking"
            },
            {
                status: 500
            }
        )
    }
}