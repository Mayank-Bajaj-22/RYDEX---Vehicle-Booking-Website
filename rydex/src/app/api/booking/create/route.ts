import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();

        const session = await auth();

        if (!session?.user) {
            logger.warn({
                action: "BOOKING_CREATION_FAILED",
                reason: "UNAUTHORIZED"
            });

            return NextResponse.json(
                {
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            )
        }

        const { driverId, vehicleId, pickUpAddress, dropAddress, pickUpLocation, dropLocation, fare, mobileNumber } = await req.json();

        if (!driverId || !vehicleId || !pickUpLocation?.coordinates || !dropLocation?.coordinates) {
            logger.warn({
                action: "BOOKING_CREATION_FAILED",
                reason: "MISSING_REQUIRED_FIELDS",
                userId: session.user.id
            });

            return NextResponse.json(
                {
                    message: "missing required details"
                },
                {
                    status: 400
                }
            )
        }

        const driver = await User.findById(driverId);

        if (!driver) {
            logger.warn({
                action: "BOOKING_CREATION_FAILED",
                reason: "DRIVER_NOT_FOUND",
                driverId
            });

            return NextResponse.json(
                {
                    message: "driver not found"
                },
                {
                    status: 400
                }
            )
        }

        const existing = await Booking.findOne({
            user: session.user.id,
            bookingStatus: {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            }
        })

        if (existing) {
            logger.info({
                action: "BOOKING_ALREADY_EXISTS",
                bookingId: existing._id,
                userId: session.user.id
            });

            return NextResponse.json(
                existing
            )
        }

        const booking = await Booking.create({
            user: session.user?.id,
            driver,
            vehicle: vehicleId,
            pickUpAddress,
            dropAddress,
            pickUpLocation,
            dropLocation,
            fare,
            userMobileNumber: mobileNumber,
            driverMobileNumber: driver.mobileNumber,
            bookingStatus: "requested"
        })

        logger.info({
            action: "BOOKING_CREATED",
            bookingId: booking._id,
            userId: session.user.id,
            driverId
        });

        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "new-booking",
            userId: driverId,
            data: booking
        });

        logger.info({
            action: "NEW_BOOKING_EVENT_EMITTED",
            bookingId: booking._id,
            driverId
        });

        return NextResponse.json(
            booking,
            {
                status: 200
            }
        )

    } catch (error) {
        logger.error({
            action: "BOOKING_CREATION_ERROR",
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
        return NextResponse.json(
            {
                message: `create booking error ${error}`
            },
            {
                status: 500
            }
        )
    }
}