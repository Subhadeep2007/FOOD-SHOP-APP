import { Outlet } from "react-router";

import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";

function MainLayout() {

    return (

        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffedd5,_transparent_30%),linear-gradient(180deg,_#fff,_#f8fafc)] text-slate-900">

            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

        </div>

    );

}

export default MainLayout;
