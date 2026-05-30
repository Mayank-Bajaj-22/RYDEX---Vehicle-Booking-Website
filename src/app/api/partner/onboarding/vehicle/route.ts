import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;

export async function POST(req: Request) {
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

        const { type, number, vehicleModel } = await req.json();
        if (!type || !number || !vehicleModel) {
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

        const duplicateVehicle = await Vehicle.findOne({ number: vehicleNumber.toUpperCase() });
        if (duplicateVehicle) {
            return Response.json(
                { 
                    message: "Vehicle number already exists" 
                }, 
                { 
                    status: 409 
                }
            );
        }

        let vehicle = await Vehicle.findOne({ owner: user._id });
        if (vehicle) {
            vehicle.type = type;
            vehicle.number = vehicleNumber;
            vehicle.vehicleModel = vehicleModel;
            vehicle.status = "pending";
            await vehicle.save();

            return Response.json( 
                vehicle,
                { 
                    status: 200 
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
        await user.save();

        return Response.json(
            vehicle,
            { 
                status: 201 
            }
        );
    } catch (error) {
        console.error("VEHICLE API ERROR:", error);

        return Response.json(
            {
                error: error instanceof Error ? error.message : String(error),
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
            return null;
        }
    } catch (error) {
        return Response.json(
            { 
                message: `get vehicle error ${error}`
            }, 
            { 
                status: 500 
            }
        );
    }
};    