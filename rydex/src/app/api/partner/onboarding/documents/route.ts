import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return Response.json(
                { 
                    message: "User not found" 
                }, 
                { 
                    status: 404 
                }
            );
        }

        const formData = await req.formData();

        const aadhar = formData.get("aadhar") as Blob | null;
        const rc = formData.get("rc") as Blob | null;
        const license = formData.get("license") as Blob | null;

        if (!aadhar || !rc || !license) {
            return NextResponse.json(
                { 
                    message: "All documents are required!" 
                }, 
                { 
                    status: 400 
                }
            );
        }

        const uploadPayload: any = {
            status: "pending"
        }

        if (aadhar) {
            const url = await uploadOnCloudinary(aadhar);
            if (!url) {
                return NextResponse.json(
                    { 
                        message: "Failed to upload aadhar card!" 
                    }, 
                    { 
                        status: 500 
                    }
                );
            }

            uploadPayload.aadharUrl = url;
        }

        if (license) {
            const url = await uploadOnCloudinary(license);
            if (!url) {
                return NextResponse.json(
                    { 
                        message: "Failed to upload license!" 
                    }, 
                    { 
                        status: 500 
                    }
                );
            }

            uploadPayload.licenseUrl = url;
        }

        if (rc) {
            const url = await uploadOnCloudinary(rc);
            if (!url) {
                return NextResponse.json(
                    { 
                        message: "Failed to upload rc!" 
                    }, 
                    { 
                        status: 500 
                    }
                );
            }

            uploadPayload.rcUrl = url;
        }

        const partnerDocs = await PartnerDocs.findOneAndUpdate(
            { owner: user._id },
            { $set: uploadPayload },
            { upsert: true, new: true }
        );

        if (user.partnerOnboardingStep < 2) {
            user.partnerOnboardingStep = 2;
        } else {
            user.partnerOnboardingStep = 3;
        }

        user.partnerStatus = "pending";
        
        await user.save();

        return NextResponse.json(
            partnerDocs,
            { 
                status: 201 
            }
        );
    } catch (error) {
        console.log(error);
        
        return NextResponse.json(
            { 
                message: `partner docs error ${error}`
            }, 
            { 
                status: 500 
            }
        );
    }
};
