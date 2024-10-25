import { useEffect, useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the structure for Recommendation data
// Define the structure for Recommendation data
export type Recommendation = {
  id: string;
  profile_id: string;
  course: {
    name: string;
    duration: number;
    fee: number;
    id: number;
  };

  education_provider: {
    id: number;
    name: string;
    location: string;
  };
  pr_probability: number;
  estimated_cost: number;
  estimated_duration_years: number;
  recommendation_rank: number;
};

export function DataTableDemo() {
  const [data, setData] = useState<Recommendation[]>([]);

  const [refresh, setRefresh] = useState(false);

  const [showSaved, setShowSaved] = useState(false); // This controls the filter view
  const { toast } = useToast();
  const handleSaveRecommendation = ( index: number) => {
    console.log(data[index]);

    axios
      .post(
        "/migrant/save_recommendation",
        {
          course_id: data[index].course.id,
          estimated_cost: data[index].estimated_cost,
          estimated_duration_years: data[index].estimated_duration_years,
          // occupation_id: data[index].occupation.id,
          pr_probability: data[index].pr_probability,
          recommendation_rank: data[index].recommendation_rank,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response: any) => {
        toast({
          title: "Saved",
          description: response.data.msg || "Saved Successfully",
        });
        console.log(response.data);
      })
      .catch((error: any) => {
        toast({
          title: "Error",
          description:
            error.response.data.msg || "Unexpected error has occured",
        });
      });
  };
  const handleUnsaveRecommendation = (id: string) => {
    // console.log(id);
    axios
      .delete("/migrant/unsave_recommendation/" + id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response: any) => {
        toast({
          title: "Unaved",
          description: response.data.msg || "Unaved Successfully",
        });
        console.log(response.data);
      })
      .catch((error: any) => {
        toast({
          title: "Error",
          description:
            error.response.data.msg || "Unexpected error has occured",
        });
        if (error.response.status === 401) {
          window.location.href = "/signin";
        }
      });
    setRefresh(!refresh);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "course.name", // Accessing course name
      header: "Course Name",
      cell: ({ row }) => <div>{row.getValue("course_name") as string}</div>,
    },
    {
      accessorKey: "course.duration", // Accessing course duration
      header: "Course Duration (Years)",
      cell: ({ row }) => <div>{row.getValue("course_duration") as number}</div>,
    },
    {
      accessorKey: "course.fee", // Accessing course fee
      header: "Course Fee",
      cell: ({ row }) => {
        const fee = parseFloat(row.getValue("course_fee") as string);
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "AUD",
        }).format(fee);
      },
    },
    {
      accessorKey: "education_provider.name", // Accessing occupation name
      header: "Institution Name",
      cell: ({ row }) => (
        <div>{row.getValue("education_provider_name") as string}</div>
      ),
    },
    // {
    //   accessorKey: "pr_probability", // Accessing PR probability
    //   header: "PR Probability",
    //   cell: ({ row }) => {
    //     const prProbability = row.getValue("pr_probability") as number;
    //     return <div>{(prProbability * 100).toFixed(2)}%</div>;
    //   },
    // },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const recommendation = row.original as Recommendation; // Cast to the Recommendation type
        // console.log(recommendation.id);
        // const isSaved = savedRecommendations.has(recommendation.id);

        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">:</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      !showSaved
                        ? handleSaveRecommendation( row.index)
                        : handleUnsaveRecommendation(
                            recommendation.id)
                    }
                  >
                    {showSaved ? "Unsave" : "Save"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    // Fetch recommendations from the API
    async function fetchRecommendations() {
      // const response = await fetch("/api/recommendations");
      // const recommendations = await response.json();
      if (showSaved) {
        axios
          .get("/migrant/recommendations/saved", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response: any) => {
            console.log(response.data);
            setData(response.data.recommendations);
          })
          .catch((error: any) => {
            toast({
              title: "An error occurred",
              description:
                error.response.data.msg || "Unexpected error has occured",
            });
            // console.error(error);
          });
      }
      {
        axios
          .get("/migrant/recommendations", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response: any) => {
            console.log(response.data);
            setData(response.data);
          })
          .catch((error: any) => {
            if (error.response.status === 401) {
              window.location.href = "/signin";
            }
            console.error(error);
          });
      }
    }

    fetchRecommendations();
  }, [refresh]);

  const table = useReactTable({
    data: data, // Use filtered data based on saved state
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleShowSaved = () => {
    setShowSaved(!showSaved);
    if (!showSaved) {
      axios
        .get("/migrant/recommendations/saved", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response: any) => {
          console.log(response.data);
          toast({
            title: "Saved Recommendations",
            description: response.data.msg || "Saved Recommendations",
          });
          setData(response.data.recommendations);
        })
        .catch((error: any) => {
          toast({
            title: "An error occurred",
            description:
              error.response.data.msg || "Unexpected error has occured",
          });
          // console.error(error);
        });
    } else {
      axios
        .get("/migrant/recommendations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response: any) => {
          console.log(response.data);
          setData(response.data);
        })
        .catch((error: any) => {
          if (error.response.status === 401) {
            window.location.href = "/signin";
          }
          console.error(error);
        });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Button
          className="transition duration-300 ease-in-out border bg-primary dark:bg-primary dark:hover:bg-secondary hover:bg-secondary text-secondary hover:text-primary border-primary"
          variant="outline"
          onClick={handleShowSaved}
        >
          {showSaved ? "Show All" : "Show Saved"}
        </Button>
      </div>
      <div className="z-0 text-black border rounded-md dark:text-white">
        <Table className="border border-primary">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-primary text-secondary"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="text-primary" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTableDemo;
