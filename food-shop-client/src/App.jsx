import {
    BrowserRouter,
    Routes,
    Route
} from "react-router";

import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/public/Home.jsx";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <MainLayout />
                    }
                >

                    <Route
                        index
                        element={
                            <Home />
                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );
}

export default App;