import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

        await connectDb();

        const vehicleId = (await context.params).id
        const vehicle = await Vehicle.findById(vehicleId).populate("owner")

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

        return NextResponse.json(
            vehicle,
            {
                status: 200
            }
        )

    } catch (error) {
        return NextResponse.json(
            {
                message: `vehicle get error ${error}`
            },
            {
                status: 500
            }
        )
    }
}