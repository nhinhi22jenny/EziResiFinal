import { Sidebar } from "@/components/Sidebar";
import * as React from "react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import axios from "axios";

// Define types for the data structure
type ProficiencyLevels = "intermediate";
type LocationPreferences = "Sydney";
type Skills = "Java" | "Python";

interface Data {
  avg_experience_years: string;
  english_proficiency_counts: Record<ProficiencyLevels, number>;
  location_preference_counts: Record<LocationPreferences, number>;
  skills_counts: Record<Skills, number>;
  total_profiles: number;
  course_counts?: Record<string, number>; // Add courses_counts for agent
  avg_course_cost?: string; // Add avg_course_cost for agent
}

const Statistics: React.FC = () => {
  const userType = localStorage.getItem("userType");
  // Data in the new format
  const datainitial: Data = {
    avg_experience_years: "5.0000",
    english_proficiency_counts: {
      intermediate: 1,
    },
    location_preference_counts: {
      Sydney: 1,
    },
    skills_counts: {
      Java: 1,
      Python: 1,
    },
    total_profiles: 1,
  };
  const [data, setData] = React.useState<Data>(datainitial);

  const color = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "var(--color-safari)",
    "var(--color-chrome)",
    "var(--color-firefox)",
    "var(--color-edge)",
    "var(--color-other)",
    "var(--color-opera)",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Transform the data to fit the chart structure, assigning different colors
  const englishProficiencyData = Object.keys(
    data.english_proficiency_counts
  ).map((level, index) => ({
    level,
    count: data.english_proficiency_counts[level as ProficiencyLevels],
    fill: color[index % 11], // Keeping color same as before
  }));

  const locationPreferenceData = Object.keys(
    data.location_preference_counts
  ).map((country, index) => ({
    country,
    count: data.location_preference_counts[country as LocationPreferences],
    fill: color[index % 11], // Keeping color same as before
  }));

  const skillsData = Object.keys(data.skills_counts).map((skill, index) => ({
    skill,
    count: data.skills_counts[skill as Skills],
    fill: color[index % 11], // Keeping color same as before
  }));

  // Transform courses data if userType is agent
  const coursesData =
    userType === "agent"||userType=="admin"
      ? Object.keys(data.course_counts || {}).map((course, index) => ({
          course,
          count: data.course_counts![course],
          fill: color[index % 11], // Keeping color same as before
        }))
      : [];

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    chrome: {
      label: "Chrome",
      color: "hsl(var(--chart-1))",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
    firefox: {
      label: "Firefox",
      color: "hsl(var(--chart-3))",
    },
    edge: {
      label: "Edge",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    axios
      .get("/users/statistics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 401) {
          window.location.href = "/";
        }
      });
  }, []);

  return (
    <div className="flex w-screen h-screen max-md:flex-col bg-primary md:items-end">
      <Sidebar />
      <div className="grow bg-secondary md:h-[98.5%] md:rounded-tl-xl p-5 overflow-auto">
        <h1 className="text-2xl font-semibold text-primary">Statistics</h1>
        <div className="flex flex-wrap gap-5 mt-10">
          {/* English Proficiency Chart */}
          <Card className="flex flex-col transition duration-500 ease-in-out grow hover:scale-105 bg-primary dark:bg-secondary">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-primary">
                English Proficiency
              </CardTitle>
              <CardDescription>Intermediate</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={englishProficiencyData}
                    dataKey="count"
                    nameKey="level"
                    innerRadius={60}
                    strokeWidth={5}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none text-primary">
                Showing proficiency distribution{" "}
              </div>
            </CardFooter>
          </Card>

          {/* Location Preference Chart */}
          <Card className="flex flex-col transition duration-500 ease-in-out grow hover:scale-105 bg-primary dark:bg-secondary">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-primary">
                Location Preference
              </CardTitle>
              <CardDescription>Sydney</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={locationPreferenceData}
                    dataKey="count"
                    nameKey="country"
                    innerRadius={60}
                    strokeWidth={5}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none text-primary">
                Showing location preferences{" "}
              </div>
            </CardFooter>
          </Card>

          {/* Skills Count Chart */}
          <Card className="flex flex-col transition duration-500 ease-in-out grow hover:scale-105 bg-primary dark:bg-secondary">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-primary">Skills Count</CardTitle>
              <CardDescription>Skills Proficiency</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={skillsData}
                    dataKey="count"
                    nameKey="skill"
                    innerRadius={60}
                    strokeWidth={5}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none text-primary">
                Showing skill distribution{" "}
              </div>
            </CardFooter>
          </Card>

          {/* Courses Count Chart (only for agent) */}
          {(userType === "agent"||userType=="admin") && (
            <Card className="flex flex-col transition duration-500 ease-in-out grow hover:scale-105 bg-primary dark:bg-secondary">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-primary">Courses Count</CardTitle>
                <CardDescription>Courses Distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={coursesData}
                      dataKey="count"
                      nameKey="course"
                      innerRadius={60}
                      strokeWidth={5}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none text-primary">
                  Showing courses distribution{" "}
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Text content 1 */}
          <div className="flex w-full gap-5">
            <Card className="flex flex-col justify-center grow hover:scale-105 min-h-[100px] transition duration-500 ease-in-out bg-primary dark:bg-secondary">
              <CardHeader className="items-center p-0">
                <CardTitle className="text-primary">Total Profiles</CardTitle>
                <CardDescription>Total number of profiles</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold text-center text-primary">
                  {data.total_profiles} Profiles
                </div>
              </CardContent>
            </Card>
            {/* Text content 2 */}
            <Card className="flex flex-col justify-center min-h-[100px] grow hover:scale-105 transition duration-500 ease-in-out bg-primary dark:bg-secondary">
              <CardHeader className="items-center p-0">
                <CardTitle className="text-primary">
                  Average Experience
                </CardTitle>
                <CardDescription>Years of experience</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold text-center text-primary">
                  {parseFloat(data.avg_experience_years).toFixed(1)} Years
                </div>
              </CardContent>
            </Card>
            {/* Text Content 3 */}
            {(userType === "agent"||userType=="admin") && (
              <Card className="flex flex-col justify-center min-h-[100px] grow hover:scale-105 transition duration-500 ease-in-out bg-primary dark:bg-secondary">
                <CardHeader className="items-center p-0">
                  <CardTitle className="text-primary">Cost</CardTitle>
                  <CardDescription>Average Course Cost</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-lg font-bold text-center text-primary">
                    {parseFloat(data.avg_course_cost || "0").toFixed(1)} Dollars
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
