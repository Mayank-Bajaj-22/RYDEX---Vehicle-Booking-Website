import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();

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

        const totalPartners = await User.countDocuments({ role: "partner" });
        const totalApprovedPartners = await User.countDocuments({ role: "partner", partnerStatus: "approved" });
        const totalRejectedPartners = await User.countDocuments({ role: "partner", partnerStatus: "rejected" });
        const totalPendingPartners = await User.countDocuments({ role: "partner", partnerStatus: "pending" });

        const pendingPartnerUsers = await User.find({ // Get Pending Partners Waiting for Review
            role: "partner",
            partnerStatus: "pending",
            partnerOnboardingStep: 3
        })

        const partnerIds = pendingPartnerUsers.map(user => user._id);

        const partnerVehicles = await Vehicle.find({ owner: { $in: partnerIds } });

        const vehicleTypeMap = new Map(
            partnerVehicles.map(vehicle => [String(vehicle.owner), vehicle.type])
        )

        const pendingPartnersReviews = pendingPartnerUsers.map(p => ({
            id: p._id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            vehicleType: vehicleTypeMap.get(String(p._id)) || "Unknown"
        }));

        return NextResponse.json(
            {
                stats: {
                    totalPartners,
                    totalApprovedPartners,
                    totalRejectedPartners,
                    totalPendingPartners
                },
                pendingPartnersReviews
            },
            {
                status: 200
            }
        );
        
    } catch (error) {
        return NextResponse.json(
            { 
                message: `Error fetching dashboard data: ${error instanceof Error ? error.message : "Unknown error"}` 
            }, 
            { 
                status: 500 
            }
        );
    }
}