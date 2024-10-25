import React from "react";
import { useRef, useState } from "react";
import axios from "axios";
import Multiselect from "multiselect-react-dropdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Locations = [
  "Western Australia",
  "Victoria",
  "New South Wales",
  "Regional Australia",
  "South Australia",
  "Northern Territory",
  "ACT",
  "Tasmania",
  "Queensland",
];

const Occupations = [
  "Architect",
  "Accountant",
  "Civil Engineer",
  "Software Engineer",
  "Mechanical Engineer",
  "Graphic Designer",
  "Electrical Engineer",
  "Registered Nurse",
  "Data Analyst",
  "Project Manager",
  "ICT Business Analyst",
  "Network Administrator",
  "Teacher",
  "Early Childhood Teacher",
  "Marketing Specialist",
];
const Skills = [
  { id: 1, name: "3D Modeling" },
  { id: 2, name: "AWS" },
  { id: 3, name: "Adobe Photoshop" },
  { id: 4, name: "Agile Methodologies" },
  { id: 5, name: "Auditing" },
  { id: 6, name: "AutoCAD" },
  { id: 7, name: "Budgeting" },
  { id: 8, name: "Building Design" },
  { id: 9, name: "Business Process Modeling" },
  { id: 10, name: "C++" },
  { id: 11, name: "Childcare" },
  { id: 12, name: "Circuit Design" },
  { id: 13, name: "Cisco Routers" },
  { id: 14, name: "Classroom Management" },
  { id: 15, name: "Clinical Assessment" },
  { id: 16, name: "Cloud Computing" },
  { id: 17, name: "Construction Management" },
  { id: 18, name: "Content Creation" },
  { id: 19, name: "Cost Estimation" },
  { id: 20, name: "Curriculum Development" },
  { id: 21, name: "Data Visualization" },
  { id: 22, name: "Digital Marketing" },
  { id: 23, name: "Embedded Systems" },
  { id: 24, name: "Emergency Response" },
  { id: 25, name: "Financial Reporting" },
  { id: 26, name: "Fluid Dynamics" },
  { id: 27, name: "Illustrator" },
  { id: 28, name: "InDesign" },
  { id: 29, name: "Java" },
  { id: 30, name: "Lesson Planning" },
  { id: 31, name: "Machine Learning" },
  { id: 32, name: "Market Research" },
  { id: 33, name: "Matlab" },
  { id: 34, name: "Mechanical Design" },
  { id: 35, name: "Medication Administration" },
  { id: 36, name: "Network Security" },
  { id: 37, name: "Patient Care" },
  { id: 38, name: "Payroll" },
  { id: 39, name: "Power Systems" },
  { id: 40, name: "Project Management" },
  { id: 41, name: "Project Planning" },
  { id: 42, name: "Python" },
  { id: 43, name: "R" },
  { id: 44, name: "Risk Management" },
  { id: 45, name: "SEO" },
  { id: 46, name: "SQL" },
  { id: 47, name: "Scrum" },
  { id: 48, name: "SolidWorks" },
  { id: 49, name: "Statistics" },
  { id: 50, name: "Structural Analysis" },
  { id: 51, name: "Systems Analysis" },
  { id: 52, name: "Taxation" },
  { id: 53, name: "Team Management" },
  { id: 54, name: "Thermodynamics" },
  { id: 55, name: "Troubleshooting" },
  { id: 56, name: "UI/UX Design" },
];

const Signup: React.FC = () => {
  const { toast } = useToast();

  const skillRef = useRef<Multiselect>(null);
  const expRef = useRef<HTMLInputElement>(null);
  // const locRef = useRef<HTMLInputElement>(null);
  const [eng_prof, setEngProf] = useState<string | null>("Basic");
  const [loc_pref, setLocPref] = useState<string | null>("Sydney");
  const [occupation, setOccupation] = useState<string | null>(
    "Software Engineer"
  );

  function onSubmit() {
    console.log(skillRef.current?.getSelectedItems());
    const skills = skillRef.current
      ?.getSelectedItems()
      .map((skill: { id: number; name: string }) => skill.name)
      .join(",");

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
    const expValue = expRef.current?.value;
    const expInt = parseInt(expValue || "0", 10);
    axios
      .post(
        "/migrant/questionnaire",
        {
          skills: skills,
          experience_years: expInt,
          location_preference: loc_pref,
          english_proficiency: eng_prof,
          occupation: occupation,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response: any) => {
        // console.log(response);

        toast({
          title: "Account created",
          description:
            response.data.msg || "Your details have been successfully saved",
        });

        setTimeout(() => {
          window.location.href = "/migrant/dashboard";
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
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-primary">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Few more details to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills</Label>

              <Multiselect
                ref={skillRef}
                className="text-black bg-primary"
                placeholder="Skills"
                style={{
                  optionContainer: {
                    background: "var(--color-primary)",
                    color: "var(--color-secondary)",
                  },
                }}
                options={Skills} // Options to display in the dropdown
                displayValue="name" // Property name to display in the dropdown options
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exp_yrs">Experience (in years)</Label>
              <Input
                id="exp_yrs"
                type="number"
                placeholder="3"
                ref={expRef}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="loc_pref">English Proficiency</Label>
              <Select onValueChange={(value) => setEngProf(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Basic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Fluent">Fluent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="loc_pref">Location Preference</Label>
              <Select onValueChange={(value) => setLocPref(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Basic" />
                </SelectTrigger>
                <SelectContent>
                  {Locations.map((loc) => (
                    <SelectItem value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="loc_pref">Occupation</Label>
              <Select onValueChange={(value) => setOccupation(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Basic" />
                </SelectTrigger>
                <SelectContent>
                  {Occupations.map((occ) => (
                    <SelectItem value={occ}>{occ}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
