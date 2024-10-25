import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface CourseData {
  name: string;
  duration: string;
  method?: string;
  id?: number;
  amount: string;
}

const initialCourseData: CourseData[] = [
  {
    name: "React Fundamentals",
    duration: "3 months",
    method: "Online",
    amount: "$250.00",
  },
  {
    name: "JavaScript Mastery",
    duration: "2 months",
    method: "In-Person",
    amount: "$150.00",
  },
];

const Provider: React.FC = () => {
  const { toast } = useToast();
  const [courseData, setCourseData] = useState<CourseData[]>(initialCourseData);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [newCourse, setNewCourse] = useState<CourseData>({
    name: "",
    duration: "",
    amount: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    name: false,
    duration: false,
    amount: false,
  });
  const amount = useRef<HTMLInputElement>(null);
  const duration = useRef<HTMLInputElement>(null);
  const loadData = () => {
    axios
      .get("/provider/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setCourseData(response.data.courses);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    loadData();
  }, []);

  const validateInputs = (course: CourseData) => {
    const errors = {
      name: !course.name.trim(),
      duration: !course.duration.trim(),
      amount:
        !course.amount.trim() ||
        isNaN(Number(course.amount.replace(/[^0-9.]/g, ""))),
    };
    setInputErrors(errors);
    return !errors.name && !errors.duration && !errors.amount;
  };

  const handleEdit = (updatedCourse: CourseData) => {
    if (validateInputs(updatedCourse)) {
      // console.log(`Editing course ID: ${index}`); // Log the ID of the course being edited
      // const updatedCourses = [...courseData];
      // updatedCourses[index] = updatedCourse;
      // setCourseData(updatedCourses);
      // setEditingCourse(null);
      console.log(updatedCourse);
      axios
        .put(
          "/provider/update-course/" + updatedCourse.id,
          {
            course_name: updatedCourse.name,
            course_duration: parseInt(
              (duration.current?.value || "").replace(/[^0-9]/g, ""),
              10
            ),
            course_fee: parseInt(
              (amount.current?.value || "").replace(/[^0-9]/g, ""),
              10
            ),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          toast({
            title: "Course Updated",
            description: "Your course has been updated successfully",
          });
          loadData();
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 401) {
            window.location.href = "/";
          }
          toast({
            title: "An error occurred",
            description: "An error occurred while updating the course",
          });
        });
      setDialogOpen(false); // Close the dialog when saved
    }
  };

  const handleAddCourse = () => {
    if (validateInputs(newCourse)) {
      const newIndex = courseData.length; // New course index
      console.log(`Adding new course ID: ${newIndex}`); // Log the ID of the new course being added
      axios
        .post(
          "/provider/add-course",
          {
            course_name: newCourse.name,
            course_duration: parseInt(
              newCourse.duration.replace(/[^0-9]/g, ""),
              10
            ),
            course_fee: parseInt(newCourse.amount.replace(/[^0-9]/g, ""), 10),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          toast({
            title: "Course Added",
            description: "Your course has been added successfully",
          });
          loadData();
          setDialogOpen(false); // Close the dialog when saved
        })
        .catch((error) => {
          console.log(error);
          toast({
            title: "An error occurred",
            description: "An error occurred while adding the course",
          });
          if (error.response.status === 401) {
            window.location.href = "/";
          }
        });
    }
  };

  const handleDeleteCourse = (index: number) => {
    console.log(`Deleting course ID: ${index}`); // Log the ID of the course being deleted
    axios
      .delete(`/provider/delete-course/${courseData[index].id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        toast({
          title: "Course Deleted",
          description: "Your course has been deleted successfully",
        });
        loadData();
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: "An error occurred",
          description: "An error occurred while deleting the course",
        });
      });
  };

  return (
    <div className="flex w-screen h-screen max-md:flex-col bg-primary md:items-end dark:bg-secondary">
      <Sidebar />
      <div className="flex flex-col w-full h-full p-10 pl-16 bg-secondary dark:bg-secondary grow md:rounded-tl-xl md:h-[98%]">
        <div className="flex flex-col items-start justify-start mb-6">
          <h1 className="text-4xl font-bold text-white dark:text-black">
            Providers
          </h1>
        </div>

        <div className="w-full h-full mb-8 overflow-auto">
          <Table className="min-w-full">
            <TableCaption>A list of your recent courses.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-gray-700 dark:text-gray-300">
                  Name of Course
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  Duration
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  Amount
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-hidden">
              {courseData.map((course, index) => (
                <TableRow
                  key={index}
                  className="transition-colors dark:hover:bg-gray-100 hover:bg-gray-700"
                >
                  <TableCell className="font-medium text-gray-200 dark:text-gray-800">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-gray-400 dark:text-gray-600">
                    {course.duration}
                  </TableCell>
                  <TableCell className="text-gray-400 dark:text-gray-600">
                    {course.amount}
                  </TableCell>

                  <TableCell className="flex items-center justify-end gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setEditingCourse(course);
                            setDialogOpen(true);
                          }}
                          className="text-sm px-3 py-1.5 bg-white text-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black rounded-md"
                          size="sm"
                        >
                          <Pencil1Icon />
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Course</DialogTitle>
                          <DialogDescription>
                            Make changes to your course here. Click save when
                            you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="name" className="text-right">
                              Course Name
                            </Label>
                            <Input
                              id="name"
                              value={editingCourse?.name || ""}
                              onChange={(e) =>
                                setEditingCourse({
                                  ...editingCourse,
                                  name: e.target.value || "",
                                } as CourseData)
                              }
                              className={`col-span-3 h-8 ${
                                inputErrors.name ? "border-red-500" : ""
                              }`}
                            />
                          </div>
                          <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="duration" className="text-right">
                              Duration
                            </Label>
                            <Input
                              id="duration"
                              type="number"
                              ref={duration}
                              value={
                                parseInt(editingCourse?.duration || "0") || ""
                              }
                              onChange={(e) => {
                                setEditingCourse({
                                  ...editingCourse,
                                  duration: e.target.value || "",
                                } as CourseData);
                                console.log(editingCourse);
                              }}
                              className={`col-span-3 h-8 ${
                                inputErrors.duration ? "border-red-500" : ""
                              }`}
                            />
                          </div>
                          <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="amount" className="text-right">
                              Amount
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              ref={amount}
                              value={
                                parseInt(editingCourse?.amount || "0") || ""
                              }
                              onChange={(e) =>
                                setEditingCourse({
                                  ...editingCourse,
                                  amount: e.target.value || "",
                                } as CourseData)
                              }
                              className={`col-span-3 h-8 ${
                                inputErrors.amount ? "border-red-500" : ""
                              }`}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={() => {
                              console.log(editingCourse);
                              if (editingCourse) {
                                handleEdit(editingCourse);
                              }
                            }}
                          >
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      className="text-sm px-3 py-1.5 bg-red-500 text-white hover:bg-red-700 rounded-md"
                      size="sm"
                      onClick={() => handleDeleteCourse(index)}
                    >
                      <TrashIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="p-3 text-black transition-transform duration-200 bg-white shadow-md hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110 rounded-xl"
              >
                <PlusIcon className="w-6 h-6" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Course</DialogTitle>
                <DialogDescription>
                  Fill in the details of the course you want to add.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="newCourseName" className="text-right">
                    Course Name
                  </Label>
                  <Input
                    id="newCourseName"
                    value={newCourse.name}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                    className={`col-span-3 h-8 ${
                      inputErrors.name ? "border-red-500" : ""
                    }`}
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="newCourseDuration" className="text-right">
                    Duration
                  </Label>
                  <Input
                    id="newCourseDuration"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                    className={`col-span-3 h-8 ${
                      inputErrors.duration ? "border-red-500" : ""
                    }`}
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="newCourseAmount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="newCourseAmount"
                    type="number"
                    value={newCourse.amount}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, amount: e.target.value })
                    }
                    className={`col-span-3 h-8 ${
                      inputErrors.amount ? "border-red-500" : ""
                    }`}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleAddCourse}>
                  Add Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Provider;
