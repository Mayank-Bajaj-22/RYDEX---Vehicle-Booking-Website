import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{id: string}> }
) {
    let bookingId = "";

    try {
        await connectDb();

        bookingId = (await context.params).id;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            logger.warn({
                action: "CASH_PAYMENT_CONFIRMATION_FAILED",
                reason: "BOOKING_NOT_FOUND",
                bookingId
            });
            return NextResponse.json(
                {
                    success: false, 
                    message: "booking not found"
                },
                {
                    status: 400
                }
            )
        }

        booking.paymentStatus = "cash"

        booking.bookingStatus = "confirmed";

        await booking.save();

        logger.info({
            action: "CASH_PAYMENT_CONFIRMED",
            bookingId: booking._id,
            paymentStatus: "cash"
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
            action: "CASH_PAYMENT_CONFIRMATION_ERROR",
            bookingId,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });

        return NextResponse.json(
            {
                message: "Failed to confirm cash payment"
            },
            {
                status: 500
            }
        )
    }
}