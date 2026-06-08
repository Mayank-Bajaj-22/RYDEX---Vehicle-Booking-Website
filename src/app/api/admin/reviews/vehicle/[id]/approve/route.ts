import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
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

        vehicle.status = "approved";
        vehicle.rejectionReason = undefined;

        await vehicle.save();

        const partner = await User.findById(vehicle.owner);

        if (!partner) {
            return NextResponse.json(
                {
                    message: "partner not found"
                },
                {
                    status: 400
                }
            )
        }

        partner.partnerOnboardingStep = 7;

        await partner.save();

        return NextResponse.json(
            vehicle,
            {
                status: 200
            }
        )

    } catch (error) {
        return NextResponse.json(
            {
                message: `vehicle approve error ${error}`
            },
            {
                status: 500
            }
        )
    }
}