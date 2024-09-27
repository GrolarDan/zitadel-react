import React, {useEffect, useState} from "react";
import logo from "./logo.svg";
import "./App.css";
import {createZitadelAuth, ZitadelConfig} from "@zitadel/react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Login from "./components/Login";
import Callback from "./components/Callback";

function App() {
    const clientId = "286769127228506115";
    // const projectId = "286769126876119043";
    const orgId = "286769126523797507";

    const config: ZitadelConfig = {
        authority: "http://localhost:3000", // custom login app url
        // authority: "http://localhost:8080", // custom login app url
        client_id: clientId,
        // project_resource_id: projectId,

        scope: `openid profile email urn:zitadel:iam:org:projects:roles urn:zitadel:iam:org:id:${orgId}`,
        redirect_uri: "http://localhost:3001/callback",  // this app url callback
        post_logout_redirect_uri: "http://localhost:3001/", // this app url logout
    };

    const zitadel = createZitadelAuth(config);

    function login() {
        console.log("login", config);
        zitadel.authorize();
    }

    function signout() {
        zitadel.signout();
    }

    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        zitadel.userManager.getUser().then((user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                setAuthenticated(false);
            }
        });
    }, [zitadel]);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>Welcome to ZITADEL React</p>

                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Login authenticated={authenticated} handleLogin={login}/>
                            }
                        />
                        <Route
                            path="/callback"
                            element={
                                <Callback
                                    authenticated={authenticated}
                                    setAuth={setAuthenticated}
                                    handleLogout={signout}
                                    userManager={zitadel.userManager}
                                />
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </header>
        </div>
    );
}

export default App;
