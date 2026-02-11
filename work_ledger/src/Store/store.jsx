import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers";

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});
// console.log(store);

export default store;
