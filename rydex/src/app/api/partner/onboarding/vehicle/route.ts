import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { logger } from "@/lib/logger";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;

export async function POST(req: Request) {
    try {
        await connectDb();

        const session = await auth();

        if (!session || !session.user) {
            logger.warn({
                action: "VEHICLE_ONBOARDING_FAILED",
                reason: "UNAUTHORIZED"
            });

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
            logger.warn({
                action: "VEHICLE_ONBOARDING_FAILED",
                reason: "USER_NOT_FOUND",
                email: session.user.email
            });

            return Response.json(
                { 
                    message: "User not found" 
                }, 
                { 
                    status: 404 
                }
            );
        }

        const { type, number, vehicleModel } = await req.json();
        if (!type || !number || !vehicleModel) {
            logger.warn({
                action: "VEHICLE_ONBOARDING_FAILED",
                reason: "MISSING_FIELDS",
                userId: user._id
            });

            return Response.json(
                { 
                    message: "Missing required fields" 
                }, 
                { 
                    status: 400 
                }
            );
        }

        if (!VEHICLE_REGEX.test(number)) {
            logger.warn({
                action: "VEHICLE_ONBOARDING_FAILED",
                reason: "INVALID_VEHICLE_NUMBER",
                userId: user._id
            });

            return Response.json(
                { 
                    message: "Invalid vehicle number format" 
                }, 
                { 
                    status: 400 
                }
            );
        }

        const vehicleNumber = number.toUpperCase();

        let vehicle = await Vehicle.findOne({ owner: user._id });
        if (vehicle) {
            vehicle.type = type;
            vehicle.number = vehicleNumber;
            vehicle.vehicleModel = vehicleModel;
            vehicle.status = "pending";

            if (user.partnerOnboardingStep < 2) {
                user.partnerOnboardingStep = 2;
                user.partnerStatus = "pending";
                await user.save();
            } else {
                user.partnerOnboardingStep = 3;
                user.partnerStatus = "pending";
                await user.save();
            }
            await vehicle.save();

            return Response.json( 
                vehicle,
                { 
                    status: 200 
                }
            );
        }

        const duplicateVehicle = await Vehicle.findOne({ number: vehicleNumber.toUpperCase() });
        if (duplicateVehicle) {
            logger.warn({
                action: "VEHICLE_ONBOARDING_FAILED",
                reason: "DUPLICATE_VEHICLE_NUMBER",
                vehicleNumber
            });

            return Response.json(
                { 
                    message: "Vehicle number already exists" 
                }, 
                { 
                    status: 409 
                }
            );
        }

        vehicle = await Vehicle.create({
            owner: user._id,
            type,
            number: vehicleNumber,
            vehicleModel
        });

        if (user.partnerOnboardingStep < 1) {
            user.partnerOnboardingStep = 1;
        }

        user.role = "partner";
        user.partnerStatus = "pending";

        await user.save();

        return Response.json(
            vehicle,
            { 
                status: 201 
            }
        );
    } catch (error) {
        logger.error({
            action: "VEHICLE_API_ERROR",
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error"
        });

        return Response.json(
            {
                message: "Failed to process vehicle"
            },
            {
                status: 500,
            }
        );
    };
};



export async function GET(req: Request) {
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

        let vehicle = await Vehicle.findOne({ owner: user._id });
        if (vehicle) {
            return Response.json(
                vehicle,
                { 
                    status: 200 
                }
            );
        } else {
            return Response.json(
            {
                message: "Vehicle not found"
            },
            { 
                status: 404
            })
        }
    } catch (error) {
        return Response.json(
            { 
                message: `get vehicle error ${error}`
            }, 
            { 
                status: 500 
            }
        )
    }
} 