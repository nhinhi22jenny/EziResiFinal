import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerOverlay,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/Sidebar";

// Custom hook to check screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

const Occupations: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [addOccupation, setAddOccupation] = useState(false);
  const [occupationCode, setOccupationCode] = useState("");
  const [occupationName, setOccupationName] = useState("");
  const [deleteOccupation, setDeleteOccupation] = useState(false);
  const [occupationToDelete, setOccupationToDelete] = useState<any>(null);
  const isMobile = useIsMobile();

  const occupations = [
    { code: "1234", name: "Software Developer" },
    { code: "5678", name: "Data Scientist" },
    { code: "9101", name: "Mechanical Engineer" },
    { code: "1121", name: "Civil Engineer" },
    { code: "3145", name: "Digital Marketing Specialist" },
  ];

  function handleEdit(occupation: any) {
    setOccupationCode(occupation.code);
    setOccupationName(occupation.name);
    setIsEditing(true);
    setAddOccupation(true); // Ensure the form is opened immediately after setting the state
  }

  function onSubmit() {
    if (occupationCode === "" || occupationName === "") {
      toast({
        title: "An error occurred",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      toast({
        title: "Occupation Updated",
        description: "The occupation has been updated successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Occupation Added",
        description: "The occupation has been added successfully",
        variant: "success",
      });
    }

    setAddOccupation(false);
    setIsEditing(false);
    setOccupationCode("");
    setOccupationName("");
  }

  function handleDeleteConfirmation(occupation: any) {
    setOccupationToDelete(occupation);
    setDeleteOccupation(true); // Open delete confirmation dialog/drawer
  }

  function handleDelete() {
    // Perform the deletion action here
    toast({
      title: `${occupationToDelete.name}`,
      description: "The occupation has been deleted successfully",
      variant: "success",
    });
    setDeleteOccupation(false);
    setOccupationToDelete(null);
  }

  return (
    <div className="h-screen relative flex max-md:flex-col w-screen bg-primary md:items-end">
      <Sidebar />
      <div className="grow bg-secondary md:h-[98.5%] md:rounded-tl-xl p-5 overflow-auto">
        <div className="flex flex-col h-full w-full">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold text-primary">
              SKILLED OCCUPATION
            </h2>
            <Button
              className="bg-primary flex gap-2 p-2 dark:bg-primary dark:hover:bg-secondary hover:bg-secondary text-secondary hover:text-primary transition ease-in-out duration-300 border border-primary"
              onClick={() => {
                setAddOccupation(true);
                setIsEditing(false);
                setOccupationCode(""); // Clear fields when adding a new occupation
                setOccupationName("");
              }}
            >
              <IconPlus /> Add Occupation
            </Button>
          </div>
          <Table className="border border-primary mt-5">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-secondary">
                  Occupation Code
                </TableHead>
                <TableHead className="w-[200px] text-secondary">
                  Occupation Name
                </TableHead>
                <TableHead className="w-[150px] text-secondary">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occupations.map((occupation) => (
                <TableRow key={occupation.code}>
                  <TableCell className="font-medium">
                    {occupation.code}
                  </TableCell>
                  <TableCell>{occupation.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <IconEdit
                        className="cursor-pointer"
                        onClick={() => handleEdit(occupation)}
                      />
                      <IconTrash
                        className="cursor-pointer"
                        onClick={() => handleDeleteConfirmation(occupation)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Dialog for Add/Edit Occupation */}
          {addOccupation && !isMobile && (
            <Dialog open={addOccupation} onOpenChange={setAddOccupation}>
              <DialogOverlay className="backdrop-blur-sm" />
              <DialogContent className="bg-secondary border border-dashed border-primary px-6 pt-6 pb-0">
                <DialogClose className="absolute top-3 right-3 cursor-pointer" />
                <DialogTitle className="text-primary">
                  {isEditing ? "Edit Occupation" : "Add Occupation"}
                </DialogTitle>
                <DialogDescription className="text-primary">
                  {isEditing
                    ? "Update the occupation details below."
                    : "Fill in the details to add a new occupation."}
                </DialogDescription>
                <div className="flex flex-col gap-5 mt-5">
                  <div className="flex gap-3 max-sm:flex-col">
                    <div className="flex flex-col gap-2 grow">
                      <Label className="text-primary" htmlFor="occupation-id">
                        Occupation ID
                      </Label>
                      <Input
                        className="text-primary"
                        id="occupation-id"
                        value={occupationCode}
                        onChange={(e) => setOccupationCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2 grow">
                      <Label className="text-primary" htmlFor="occupation-name">
                        Occupation Name
                      </Label>
                      <Input
                        className="text-primary"
                        id="occupation-name"
                        value={occupationName}
                        onChange={(e) => setOccupationName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end py-5">
                    <Button
                      onClick={onSubmit}
                      className="bg-primary flex gap-2 p-2 dark:bg-primary dark:hover:bg-secondary hover:bg-secondary text-secondary hover:text-primary transition ease-in-out duration-300 border border-primary"
                    >
                      {isEditing ? "Update Occupation" : "Add Occupation"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Drawer for Add/Edit Occupation (Mobile) */}
          {addOccupation && isMobile && (
            <Drawer open={addOccupation} onOpenChange={setAddOccupation}>
              <DrawerOverlay className="backdrop-blur-sm" />
              <DrawerContent className="bg-secondary border border-dashed border-primary px-6 pt-6 pb-0">
                <DrawerClose className="absolute top-3 right-3 cursor-pointer" />
                <h2 className="text-xl font-semibold text-primary">
                  {isEditing ? "Edit Occupation" : "Add Occupation"}
                </h2>
                <div className="flex flex-col gap-5 mt-5">
                  <div className="flex gap-3 max-sm:flex-col">
                    <div className="flex flex-col gap-2 grow">
                      <Label className="text-primary" htmlFor="occupation-id">
                        Occupation ID
                      </Label>
                      <Input
                        className="text-primary"
                        id="occupation-id"
                        value={occupationCode}
                        onChange={(e) => setOccupationCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2 grow">
                      <Label className="text-primary" htmlFor="occupation-name">
                        Occupation Name
                      </Label>
                      <Input
                        className="text-primary"
                        id="occupation-name"
                        value={occupationName}
                        onChange={(e) => setOccupationName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end py-5">
                    <Button
                      onClick={onSubmit}
                      className="bg-primary flex gap-2 p-2 dark:bg-primary dark:hover:bg-secondary hover:bg-secondary text-secondary hover:text-primary transition ease-in-out duration-300 border border-primary"
                    >
                      {isEditing ? "Update Occupation" : "Add Occupation"}
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
          {/* Confirmation Dialog for Deleting Occupation (Desktop) */}
          {deleteOccupation && !isMobile && occupationToDelete && (
            <Dialog open={deleteOccupation} onOpenChange={setDeleteOccupation}>
              <DialogOverlay className="backdrop-blur-sm" />
              <DialogContent className="bg-secondary border border-dashed border-primary px-6 pt-6 pb-0">
                <DialogClose className="absolute top-3 right-3 cursor-pointer" />
                <DialogTitle className="text-primary">
                  Delete Occupation
                </DialogTitle>
                <DialogDescription className="text-primary">
                  Are you sure you want to delete the following occupation?
                </DialogDescription>
                <div className="flex flex-col gap-3 mt-5">
                  <p>
                    <strong>Occupation ID:</strong> {occupationToDelete.code}
                  </p>
                  <p>
                    <strong>Occupation Name:</strong> {occupationToDelete.name}
                  </p>
                  <div className="flex justify-end gap-3 py-5">
                    <Button
                      onClick={() => setDeleteOccupation(false)}
                      className="bg-secondary text-primary border-primary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-primary text-secondary border-primary"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Confirmation Drawer for Deleting Occupation (Mobile) */}
          {deleteOccupation && isMobile && occupationToDelete && (
            <Drawer open={deleteOccupation} onOpenChange={setDeleteOccupation}>
              <DrawerOverlay className="backdrop-blur-sm" />
              <DrawerContent className="bg-secondary border border-dashed border-primary px-6 pt-6 pb-0">
                <DrawerClose className="absolute top-3 right-3 cursor-pointer" />
                <h2 className="text-xl font-semibold text-primary">
                  Delete Occupation
                </h2>
                <div className="flex flex-col gap-3 mt-5">
                  <p>
                    <strong>Occupation ID:</strong> {occupationToDelete.code}
                  </p>
                  <p>
                    <strong>Occupation Name:</strong> {occupationToDelete.name}
                  </p>
                  <div className="flex justify-end gap-3 py-5">
                    <Button
                      onClick={() => setDeleteOccupation(false)}
                      className="bg-secondary text-primary border-primary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-primary text-secondary border-primary"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Occupations;
