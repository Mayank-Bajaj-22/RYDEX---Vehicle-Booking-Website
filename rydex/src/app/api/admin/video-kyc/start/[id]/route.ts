import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
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

        const roomId = `kyc-${partner._id}-${Date.now()}`

        partner.videoKycRoomId = roomId;
        partner.videoKycStatus = "in_progress";
        partner.partnerOnboardingStep = 4;

        partner.save();

        return NextResponse.json(
            roomId,
            {
                status: 200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                message: "video kyc start error"
            },
            {
                status: 500
            }
        )
    }
}