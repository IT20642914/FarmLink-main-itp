import { createSlice } from "@reduxjs/toolkit";
let storedName;

try {
  const localStorageValue = localStorage.getItem("name");

  // Check if the value is not null or undefined before parsing
  storedName = localStorageValue ? JSON.parse(localStorageValue) : "";
} catch (error) {
  console.error("Error parsing 'name' from localStorage:", error);
  storedName = "";
}

const initialState = {
  isLoggedIn: false,
  name: storedName,
  user: {
    name: "",
    email: "",
    phone: "",
    bio: "",
    photo: "",
  },
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    SET_LOGIN(state, action) {
      state.isLoggedIn = action.payload;
    },
    SET_NAME(state, action) {
      localStorage.setItem("name", JSON.stringify(action.payload));
      state.name = action.payload;
    },
    SET_USER(state, action) {
      const profile = action.payload;
      state.user.name = profile.name;
      state.user.email = profile.email;
      state.user.phone = profile.phone;
      state.user.bio = profile.bio;
      state.user.photo = profile.photo;
    },
  },
});

export const { SET_LOGIN, SET_NAME, SET_USER } = authSlice.actions;

export const selectIsLoggedIn = (state) => /*state.auth.isLoggedIn*/ true;
//export const selectName = (state) => state.auth.name;
export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;