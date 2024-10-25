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
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample user data

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

// Add/Edit User Form Component
const AddEditUserForm = ({ isOpen, setIsOpen, user, isEdit }: any) => {
  const [formData, setFormData] = useState({
    userId: "",
    userType: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const isMobile = useIsMobile();
  const { toast } = useToast();
  // const [userTypestate, setUserType] = useState("admin");
  useEffect(() => {
    if (isEdit && user) {
      const [firstName, lastName] = user.full_name.split(" ");
      setFormData({
        userId: user.user_id,
        userType: user.user_type,
        firstName,
        lastName,
        email: user.email,
        password: "", // Don't prefill password
      });
    } else {
      setFormData({
        userId: "",
        userType: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
    }
  }, [isEdit, user]);

  function onSubmit() {
    const { firstName, lastName, email, password, userId, userType } = formData;
    console.log(formData);

    if (
      !firstName ||
      !lastName ||
      !email ||
      (isEdit && password) ||
      !userType
    ) {
      toast({
        title: "An error occurred",
        description:
          "Please fill in all fields" +
          !firstName +
          !lastName +
          !email +
          (isEdit && password) +
          !userType,
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "An error occurred",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (password && password.length < 8) {
      toast({
        title: "An error occurred",
        description: "Password should be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    !isEdit
      ? axios
          .post("/users/register", {
            email: email,
            password: password,
            full_name: firstName + " " + lastName,
            user_type: userType,
          })
          .then(() => {
            toast({
              title: isEdit ? "User Updated" : "User Added",
              description: isEdit
                ? "User has been updated successfully"
                : "User has been added successfully",
              variant: "success",
            });
            setIsOpen(false);
          })
          .catch((error) => {
            toast({
              title: "An error occurred",
              description: error.response.data.msg,
              variant: "destructive",
            });
          })
      : axios
          .put(
            "/users/update/" + userId,
            {
              email: email,
              password: password,
              full_name: firstName + " " + lastName,
              user_type: userType,
              user_id: userId,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(() => {
            toast({
              title: isEdit ? "User Updated" : "User Added",
              description: isEdit
                ? "User has been updated successfully"
                : "User has been added successfully",
              variant: "success",
            });
            setIsOpen(false);
          })
          .catch((error) => {
            toast({
              title: "An error occurred",
              description: error.response.data.msg || "An error occurred",
              variant: "destructive",
            });
            if (error.response.status === 401) {
              window.location.href = "/";
            }
          });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target);
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSelectChange(e: any) {
    setFormData((prevData) => ({
      ...prevData,
      userType: e,
    }));
  }

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerOverlay className="backdrop-blur-sm" />
      <DrawerContent className="px-6 pb-0 border border-dashed bg-secondary border-primary">
        <DrawerClose />
        <h2 className="text-xl font-semibold text-primary">
          {isEdit ? "Edit User" : "Add User"}
        </h2>
        <UserFormContent
          formData={formData}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogOverlay className="backdrop-blur-sm" />
      <DialogContent className="px-6 pt-6 pb-0 border border-dashed bg-secondary border-primary">
        <DialogTitle className="text-primary">
          {isEdit ? "Edit User" : "Add User"}
        </DialogTitle>
        <DialogDescription className="text-primary">
          {isEdit
            ? "Update user details below."
            : "Fill in the details to add a new user."}
        </DialogDescription>
        <UserFormContent
          formData={formData}
          onChange={handleChange}
          onSubmit={onSubmit}
          isEdit={isEdit}
          onSelectChange={handleSelectChange}
        />
        <DialogClose className="" />
      </DialogContent>
    </Dialog>
  );
};

const UserFormContent = ({
  formData,
  onChange,
  onSubmit,
  onSelectChange,
}: any) => (
  <>
    <div className="flex flex-col gap-5 mt-5">
      <div className="flex gap-3 max-sm:flex-col">
        <div className="flex flex-col gap-2 grow">
          <Label className="text-primary" htmlFor="user-type">
            User Type
          </Label>
          <Select
            value={formData.userType}
            name="userType"
            onValueChange={onSelectChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select the user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup id="user-type">
                <SelectLabel>User Type</SelectLabel>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="migrant">Migrant</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* <Input
            className="text-primary"
            id="user-type"
            name="userType"
            value={formData.userType}
            onChange={onChange}
            required
          /> */}
        </div>
      </div>
      <div className="flex gap-3 max-sm:flex-col">
        <div className="flex flex-col gap-2 grow">
          <Label className="text-primary" htmlFor="first-name">
            First Name
          </Label>
          <Input
            className="text-primary"
            id="first-name"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2 grow">
          <Label className="text-primary" htmlFor="last-name">
            Last Name
          </Label>
          <Input
            className="text-primary"
            id="last-name"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-primary" htmlFor="email">
          Email
        </Label>
        <Input
          className="text-primary"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-primary" htmlFor="password">
          Password
        </Label>
        <Input
          className="text-primary"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onChange}
          required
        />
      </div>
    </div>
    <div className="flex justify-end py-5">
      <Button
        onClick={onSubmit}
        className="flex gap-2 p-2 transition duration-300 ease-in-out border bg-primary dark:bg-primary dark:hover:bg-secondary hover:bg-secondary text-secondary hover:text-primary border-primary"
      >
        {formData.user_id ? "Update User" : "Add User"}
      </Button>
    </div>
  </>
);

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteUser, setDeleteUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  function loadData() {
    axios
      .get("/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "An error occurred",
          description: "An error occurred while fetching users",
          variant: "destructive",
        });
      });
  }

  function handleAddUser() {
    setIsEdit(false);
    setSelectedUser(null);
    setIsAddEditOpen(true);
    loadData();
  }

  function handleEditUser(user: any) {
    console.log(user);
    setIsEdit(true);
    setSelectedUser(user);
    setIsAddEditOpen(true);
    loadData();
  }

  function handleDeleteConfirmation(user: any) {
    console.log(user);
    setUserToDelete(user);
    setDeleteUser(true); // Open delete confirmation dialog/drawer
  }

  function handleDelete() {
    // Perform the deletion action here
    axios
      .delete("/users/delete", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: {
          email: userToDelete.email,
        },
      })
      .then(() => {
        toast({
          title: `${userToDelete.full_name}`,
          description: "The user has been deleted successfully",
          variant: "success",
        });
        loadData();
        setDeleteUser(false);
        setUserToDelete(null);
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "An error occurred",
          description: "An error occurred while deleting the user",
          variant: "destructive",
        });
        if (error.response.status === 401) {
          window.location.href = "/";
        }
      });
  }

  useEffect(() => {
    loadData();
  }, [isAddEditOpen]);

  return (
    <div className="relative flex w-screen h-screen max-md:flex-col bg-primary md:items-end">
      <Sidebar />
      <div className="grow bg-secondary md:h-[98.5%] md:rounded-tl-xl p-5 overflow-auto">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold text-primary">Manage Users</h2>
          <Button
            className="flex gap-2 p-2 transition duration-300 ease-in-out border bg-primary dark:bg-primary dark:hover:bg-secondary hover:bg-secondary text-secondary hover:text-primary border-primary"
            onClick={handleAddUser}
          >
            <IconPlus /> Add User
          </Button>
        </div>
        <Table className="mt-5 border">
          <TableHeader>
            <TableRow>
              <TableHead className="text-secondary">User Id</TableHead>
              <TableHead className="text-secondary">User Type</TableHead>
              <TableHead className="text-secondary">Full Name</TableHead>
              <TableHead className="text-secondary">Email</TableHead>
              <TableHead className="text-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>{user.user_id}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    <IconEdit
                      className="cursor-pointer"
                      onClick={() => handleEditUser(user)}
                    />
                    <IconTrash
                      className="cursor-pointer"
                      onClick={() => handleDeleteConfirmation(user)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AddEditUserForm
          isOpen={isAddEditOpen}
          setIsOpen={setIsAddEditOpen}
          user={selectedUser}
          isEdit={isEdit}
        />

        {/* Confirmation Dialog for Deleting User (Desktop) */}
        {deleteUser && !isMobile && userToDelete && (
          <Dialog open={deleteUser} onOpenChange={setDeleteUser}>
            <DialogOverlay className="backdrop-blur-sm" />
            <DialogContent className="px-6 pt-6 pb-0 border border-dashed bg-secondary border-primary">
              <DialogClose className="absolute cursor-pointer top-3 right-3" />
              <DialogTitle className="text-primary">Delete User</DialogTitle>
              <DialogDescription className="text-primary">
                Are you sure you want to delete the following user?
              </DialogDescription>
              <div className="flex flex-col gap-3 mt-5">
                <p>
                  <strong>User ID:</strong> {userToDelete.user_id}
                </p>
                <p>
                  <strong>Full Name:</strong> {userToDelete.full_name}
                </p>
                <div className="flex justify-end gap-3 py-5">
                  <Button
                    onClick={() => setDeleteUser(false)}
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

        {/* Confirmation Drawer for Deleting User (Mobile) */}
        {deleteUser && isMobile && userToDelete && (
          <Drawer open={deleteUser} onOpenChange={setDeleteUser}>
            <DrawerOverlay className="backdrop-blur-sm" />
            <DrawerContent className="px-6 pt-6 pb-0 border border-dashed bg-secondary border-primary">
              <DrawerClose className="absolute cursor-pointer top-3 right-3" />
              <h2 className="text-xl font-semibold text-primary">
                Delete User
              </h2>
              <div className="flex flex-col gap-3 mt-5">
                <p>
                  <strong>User ID:</strong> {userToDelete.userId}
                </p>
                <p>
                  <strong>Full Name:</strong> {userToDelete.fullName}
                </p>
                <div className="flex justify-end gap-3 py-5">
                  <Button
                    onClick={() => setDeleteUser(false)}
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
  );
};

export default Dashboard;
