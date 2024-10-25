import React from "react";
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

  const agencyRef = useRef<HTMLInputElement>(null);

  function onSubmit() {
    // const selectedRadio = userTypeRef.current?.querySelector(
    //   'input[type="radio"]:checked'
    // );
    // const userType = selectedRadio ? selectedRadio.value : null;
    if (localStorage.getItem("token") === null) {
      toast({
        title: "An error occurred",
        description: "Please login first",
      });
      return;
    }

    axios
      .post(
        "/agent/questionnaire",
        {
          agency_name: agencyRef.current?.value,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        // console.log(response);

        toast({
          title: "Account created",
          description: "Your details have been successfully saved",
        });
        setTimeout(() => {
          window.location.href = "/agent/dashboard";
        }, 2000);
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
            Enter your details to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agency">Agency Name</Label>
              <Input
                id="agency"
                placeholder="Agency Name"
                required
                ref={agencyRef}
              />
            </div>
            <Button type="button" className="w-full" onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
