import {
    createSlice
} from "@reduxjs/toolkit";

const storedUser =
    localStorage.getItem(
        "user"
    );

let parsedUser = null;

if (storedUser) {

    try {

        parsedUser =
            JSON.parse(
                storedUser
            );

    } catch {

        parsedUser = null;
    }
}

const storedAccessToken =
    localStorage.getItem(
        "accessToken"
    );

const initialState = {

    user: parsedUser,

    accessToken: storedAccessToken,

    isAuthenticated: Boolean(
        storedAccessToken
    ),

    initialized: false
};

const authSlice =
    createSlice({

        name: "auth",

        initialState,

        reducers: {

            setCredentials: (
                state,
                action
            ) => {

                const response =
                    action.payload;

                const data =
                    response &&
                    response.data ?
                    response.data :
                    response;

                state.user =
                    data.user ||
                    null;

                state.accessToken =
                    data.accessToken ||
                    null;

                state.isAuthenticated =
                    Boolean(
                        data.accessToken &&
                        state.user
                    );

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        state.user
                    )
                );

                if (
                    data.accessToken
                ) {

                    localStorage.setItem(
                        "accessToken",
                        data.accessToken
                    );
                }

            },

            setUser: (
                state,
                action
            ) => {

                state.user =
                    action.payload;

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        action.payload
                    )
                );
            },

            setAccessToken: (
                state,
                action
            ) => {

                state.accessToken =
                    action.payload;

                state.isAuthenticated =
                    Boolean(action.payload && state.user);

                if (
                    action.payload
                ) {

                    localStorage.setItem(
                        "accessToken",
                        action.payload
                    );
                }
            },

            setInitialized: (
                state,
                action
            ) => {

                state.initialized =
                    action.payload;
            },

            logout: (
                state
            ) => {

                state.user =
                    null;

                state.accessToken =
                    null;

                state.isAuthenticated =
                    false;

                localStorage.removeItem(
                    "user"
                );

                localStorage.removeItem(
                    "accessToken"
                );

            }
        }
    });

export const {
    setCredentials,
    setUser,
    setAccessToken,
    setInitialized,
    logout
} = authSlice.actions;

export default authSlice.reducer;
