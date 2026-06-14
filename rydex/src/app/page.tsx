import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import PartnerDashboard from "../components/PartnerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import GeoUpdater from "@/components/GeoUpdater";

export default async function Home() {

  const session = await auth();
  
  await connectDb();

  const user = await User.findOne({ email: session?.user?.email });

  return (
    <div className="w-full min-h-screen bg-white">
      <GeoUpdater userId={user?._id?.toString()} />
      {
        user?.role === "partner" 
        ? 
        <>
          <Nav />
          <PartnerDashboard />
        </>
        : (
          user?.role === "admin" ?
          <AdminDashboard /> 
          : 
          <>
            <Nav />
            <PublicHome />
          </>
        )
      }
      <Footer />
    </div>
  );
}
