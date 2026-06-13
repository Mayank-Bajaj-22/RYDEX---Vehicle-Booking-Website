import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
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
        
        await connectDb();

        const { rejectionReason } = await req.json();

        const partnerId = (await context.params).id
        const partner = await User.findById(partnerId)

        if (!partner || partner.role !== "partner") {
            return NextResponse.json(
                {
                    message: "partner not found"
                },
                {
                    status: 400
                }
            )
        }

        partner.partnerStatus = "rejected"
        partner.rejectionReason = rejectionReason 

        await partner.save();

        return NextResponse.json(
            {
                message: "partner rejected successfully"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                message: "partner rejected error"
            },
            {
                status: 500
            }
        )
    }
}