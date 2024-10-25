import React from "react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Signup: React.FC = () => {
  const { toast } = useToast();

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const userTypeRef = useRef<HTMLInputElement>(null);
  const [userType, setUserType] = useState<string | null>("migrant");

  function onSubmit() {
    // const selectedRadio = userTypeRef.current?.querySelector(
    //   'input[type="radio"]:checked'
    // );
    // const userType = selectedRadio ? selectedRadio.value : null;
    if (
      firstNameRef.current?.value === "" ||
      lastNameRef.current?.value === "" ||
      emailRef.current?.value === "" ||
      passwordRef.current?.value === ""
    ) {
      toast({
        title: "An error occurred",
        description: "Please fill in all fields",
      });
      return;
    }
    if (userType === null) {
      toast({
        title: "An error occurred",
        description: "Please select a user type",
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
      .post("/users/register", {
        full_name:
          firstNameRef.current?.value + " " + lastNameRef.current?.value,
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
        user_type: userType,
      })
      .then((response: any) => {
        console.log(response);
        const data = response.data;
        if (data) {
          localStorage.setItem("token", data.token);
        }
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
        setTimeout(() => {
          switch (userType) {
            case "migrant":
              window.location.href = "/signup/migrant";
              break;
            case "provider":
              window.location.href = "/signup/provider";
              break;
            case "agent":
              window.location.href = "/signup/agent";
              break;
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
    <div className="flex items-center justify-center w-full h-screen bg-primary">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Max"
                  required
                  ref={firstNameRef}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Robinson"
                  required
                  ref={lastNameRef}
                />
              </div>
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="password">What kind of user are you?</Label>
              <RadioGroup
                defaultValue="migrant"
                ref={userTypeRef}
                onValueChange={(value) => setUserType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="migrant" id="migrant" />
                  <Label htmlFor="migrant">Migrant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="provider" id="provider" />
                  <Label htmlFor="provider">Educational Provider</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agent" id="agent" />
                  <Label htmlFor="agent">Migration Agent</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="button" className="w-full" onClick={onSubmit}>
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <Link to="/" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
