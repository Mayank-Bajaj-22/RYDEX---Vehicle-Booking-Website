import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import PartnerDashboard from "../components/PartnerDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default async function Home() {

  const session = await auth();
  console.log("Session:", session);

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav />
      {
        session?.user?.role === "partner" 
        ? <PartnerDashboard />
        : (
          session?.user?.role === "admin" ?
          <AdminDashboard /> 
          : <PublicHome />
        )
      }
      <Footer />
    </div>
  );
}
