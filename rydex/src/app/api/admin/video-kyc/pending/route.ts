import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
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

        const partner = await User.find({
            role: "partner",
            partnerOnboardingStep: 4,
            videoKycStatus: {
                $in: ["pending", "in_progress"]
            }
        })

        return Response.json(
            partner,
            {
                status: 200
            }
        )
    } catch (error) {
        return Response.json(
            {
                message: `partner kyc get error ${error}`
            },
            {
                status: 500
            }
        )
    }
}