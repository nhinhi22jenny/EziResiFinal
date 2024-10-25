import React from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Signup: React.FC = () => {
  const { toast } = useToast();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function onSubmit() {
    // const selectedRadio = userTypeRef.current?.querySelector(
    //   'input[type="radio"]:checked'
    // );
    // const userType = selectedRadio ? selectedRadio.value : null;
    if (emailRef.current?.value === "" || passwordRef.current?.value === "") {
      toast({
        title: "An error occurred",
        description: "Please fill in all fields",
      });
      return;
    }
    if (emailRef.current?.value.includes("@") === false) {
      toast({
        title: "An error occurred",
        description: "Please enter a valid email address",
      });
      return;
    }
    axios
      .post("/users/login", {
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
      })
      .then((response: any) => {
        // console.log(response);
        const data = response.data;
        if (data) {
          localStorage.setItem("userType", data.user.user_type);
          localStorage.setItem("token", data.token);
        }
        toast({
          title: "Account Logged in",
          description: data.msg,
        });
        setTimeout(() => {
          switch (data.user.user_type) {
            case "migrant":
              window.location.href = "/migrant/dashboard";
              break;
            case "provider":
              window.location.href = "/provider/dashboard";
              break;
            case "agent":
              window.location.href = "/agent/dashboard";
              break;
            case "admin":
              window.location.href = "/admin/dashboard";
          }
        }, 3000);
      })
      .catch((error: any) => {
        console.error(error);
        toast({
          title: "An error occurred",
          description:
            error.response.data.msg ||
            "An error occurred while creating your account",
        });
      });
  }

  return (
    <div className="flex items-center justify-center w-full h-screen bg-primary dark:bg-primary">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Enter your information to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                ref={emailRef}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" ref={passwordRef} />
            </div>

            <Button type="button" className="w-full" onClick={onSubmit}>
              Sign in
            </Button>
          </div>
          <div className="mt-4 text-sm text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
