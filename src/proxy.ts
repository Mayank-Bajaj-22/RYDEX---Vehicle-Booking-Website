import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

const PUBLIC_ROUTES = ["/"];
const PUBLIC_APIS = ["/api/auth"];

export async function proxy(req: NextRequest) {
    
    const { pathname} = new URL(req.url);
    // console.log("pathname", pathname);

    if (pathname.startsWith("/_next") || pathname.startsWith('/favicon.ico') || pathname.startsWith(".")) {
        return NextResponse.next();
    }

    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    if (PUBLIC_APIS.includes(pathname)) {
        return NextResponse.next();
    }

    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL("/", req.url)); // /login
    }

    const role = session.user?.role;

    if (pathname.startsWith("/admin")) {
        if (role != "admin") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    if (pathname.startsWith("/partner")) {
        if(pathname.startsWith("/partner")) {
            return NextResponse.next();
        }
        
        if (role != "partner") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    if (pathname.startsWith("/api")) {
        if (!session.user) {
            return NextResponse.json(
                {
                    message: "unauthorize"
                },
                {
                    status: 401
                }
            )
        }
    }

    return NextResponse.next()
}

export const config ={
    matcher:"/((?!api|_next/static|_next/image|favicon.ico|node_modules).*)"
}