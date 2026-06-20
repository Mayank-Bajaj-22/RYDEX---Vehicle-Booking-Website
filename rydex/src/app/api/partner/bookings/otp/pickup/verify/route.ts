import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();

        const { bookingId, otp } = await req.json();

        const booking = await Booking.findById(bookingId).populate("user");

        if (!booking) {
            return NextResponse.json(
                {
                    message: "booking not found"
                },
                {
                    status: 400
                }
            )
        }

        if (!booking.pickUpOtp) {
            return NextResponse.json(
                {
                    message: "pickup otp not generated"
                },
                {
                    status: 400
                }
            )
        }

        if (booking.pickUpOtp != otp) {
            return NextResponse.json(
                {
                    message: "incorrect pickup otp"
                },
                {
                    status: 400
                }
            )
        }

        if (booking.pickUpOtpExpires < new Date()) {
            return NextResponse.json(
                {
                    message: "pickup otp expired"
                },
                {
                    status: 400
                }
            )
        }

        booking.bookingStatus = "started";

        booking.pickUpOtp = "";

        booking.pickUpOtpExpires = undefined;

        await booking.save();

        return NextResponse.json(
            {
                message: "pickup otp verified"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                message: `pickup otp verify error ${error}`
            },
            {
                status: 500
            }
        )
    }
}