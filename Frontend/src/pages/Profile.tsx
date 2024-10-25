import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage: React.FC = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("joh");
  const [userType, setUserType] = useState("Admin");

  useEffect(() => {
    axios
      .get("/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setName(response.data.full_name);
        setEmail(response.data.email);
        setUserType(response.data.user_type);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 401) {
          window.location.href = "/";
        }
      });
  }, []);

  return (
    <div className="flex w-screen h-screen bg-secondary dark:bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Profile Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-white bg-primary dark:bg-secondary md:p-12 dark:text-black">
        {/* Profile Page Title */}
        <h1 className="mb-8 text-4xl font-bold dark:text-primary text-secondary">
          Your Profile
        </h1>

        {/* Profile Content Container */}
        <div className="w-full max-w-4xl p-8 space-y-8 text-black rounded-lg shadow-lg bg-secondary dark:bg-primary dark:text-white">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            {/* <Label className="text-lg font-semibold text-primary dark:text-secondary">
              Profile Picture
            </Label> */}

            {/* <img
              src={profilePicUrl}
              alt="Profile"
              className="object-cover border-4 border-gray-300 rounded-full w-36 h-36 dark:border-gray-700"
            /> */}
            <div className="flex items-center justify-center border-4 border-gray-300 rounded-full w-36 h-36 dark:border-gray-700">
              <p className="text-5xl text-secondary">
                {name.charAt(0).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col space-y-2">
            <Label className="text-lg font-semibold text-primary dark:text-secondary">
              {name}
            </Label>
            <p className="text-xl text-primary dark:text-secondary">{name}</p>
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <Label className="text-lg font-semibold text-primary dark:text-secondary">
              Email
            </Label>
            <p className="text-xl text-primary dark:text-secondary">{email}</p>
          </div>

          {/* User Type */}
          <div className="flex flex-col space-y-2">
            <Label className="text-lg font-semibold text-primary dark:text-secondary">
              User Type
            </Label>
            <p className="text-xl text-primary dark:text-secondary">
              {userType}
            </p>
          </div>

          {/* Logout Button */}
          <div className="flex justify-center mt-8">
            <Button
              className="w-1/3 py-2 dark:bg-secondary bg-primary dark:text-primary text-secondary "
              onClick={() => (window.location.href = "/logout")}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
