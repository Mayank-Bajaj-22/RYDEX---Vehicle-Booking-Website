import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    context: {
        params: Promise<{id: string}>
    }
) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "admin") {
            return Response.json(
                { 
                    message: "Unauthorized" 
                }, 
                { 
                    status: 401 
                }
            );
        }

        const { reason } = await req.json();

        await connectDb();

        const vehicleId = (await context.params).id
        const vehicle = await Vehicle.findById(vehicleId)

        if (!vehicle) {
            return NextResponse.json(
                {
                    message: "vehicle not found"
                },
                {
                    status: 400
                }
            )
        }

        vehicle.status = "rejected";
        vehicle.rejectionReason = reason;

        await vehicle.save();

        return NextResponse.json(
            vehicle,
            {
                status: 200
            }
        )

    } catch (error) {
        return NextResponse.json(
            {
                message: `vehicle reject error ${error}`
            },
            {
                status: 500
            }
        )
    }
}