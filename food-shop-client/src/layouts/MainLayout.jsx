import { Outlet } from "react-router";

import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";

function MainLayout() {

    return (

        <div className="min-h-screen bg-white text-slate-900">

            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

        </div>

    );

}

export default MainLayout;