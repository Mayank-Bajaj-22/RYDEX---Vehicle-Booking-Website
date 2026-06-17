import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();

        const session = await auth();

        if (!session || !session.user) {
            return Response.json(
                { 
                    message: "Unauthorized" 
                }, 
                { 
                    status: 401 
                }
            );
        }

        const driver = await User.findOne({ email: session.user.email });

        const bookings = await Booking.find({ driver})
        .populate("user driver vehicle")
        .sort({ createdAt: -1 })

        return NextResponse.json(
            bookings,
            {
                status: 200
            }
        )

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                message: `get booking for partner error ${error}`
            },
            {
                status: 500
            }
        )
    }
}