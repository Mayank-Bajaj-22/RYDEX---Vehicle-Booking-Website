import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
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

        if (partner.partnerStatus == "approved") {
            return NextResponse.json(
                {
                    message: "partner already approved"
                },
                {
                    status: 400
                }
            )
        }

        const partnerDocs = await PartnerDocs.findOne({ owner: partner._id })
        const partnerBank = await PartnerBank.findOne({ owner: partner._id })

        if (!partnerDocs || !partnerBank) {
            return NextResponse.json(
                {
                    message: "partner did not complete onboarding steps"
                },
                {
                    status: 400
                }
            )
        }

        partner.partnerStatus = "approved";
        partner.partnerOnboardingStep = 4; 

        await partner.save();

        partnerDocs.status = "approved";

        await partnerDocs.save();

        partnerBank.status = "verified";

        await partnerBank.save()

        return NextResponse.json(
            {
                message: "partner approved successfully"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        return NextResponse.json(
            {
                message: "partner approved error"
            },
            {
                status: 500
            }
        )
    }
}