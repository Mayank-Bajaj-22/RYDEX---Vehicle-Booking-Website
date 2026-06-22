import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();

        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                {
                    message: "unauthorized"
                },
                {
                    status: 400
                }
            )
        }

        const driver = await User.findOne({
            email: session?.user?.email
        })

        const sevenDayAgo = new Date();

        sevenDayAgo.setDate(sevenDayAgo.getDate() - 7);

        const bookings = await Booking.find({
            driver: driver._id,
            paymentStatus: "paid",
            createdAt: { $gte: sevenDayAgo }
        }).select("partnerAmount createdAt");

        let earningMap: Record<string, number> = {}

        bookings.forEach(b => {
            const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
            })

            if (!earningMap[date]) {
                earningMap[date] = 0;
            }

            earningMap[date] = earningMap[date] + b.partnerAmount || 0;
        })

        const earnings = Object.entries(earningMap).map(([date,earnings]) => (
            {
                date, earnings
            }
        ))

        return NextResponse.json(
            earnings, 
            {
                status: 200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                message: "partner earning error"
            }, 
            {
                status: 500
            }
        )
    }
}