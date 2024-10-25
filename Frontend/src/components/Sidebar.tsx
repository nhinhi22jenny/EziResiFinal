import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "@/ThemeContext";
import {
  SidebarComponent,
  SidebarBody,
  SidebarLink,
} from "./ui/sidebarComponent";
import {
  IconLogout2,
  IconBrandTabler,
  IconGraph,
  IconBulb,
} from "@tabler/icons-react";
import { Link } from "react-router-dom"; // Import from react-router-dom
import { motion } from "framer-motion";


// Utility function for className concatenation
// const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [usertype, setUserType] = useState("migrant");
  const [fullname, setFullname] = useState("Manu Arora");
  const { toggleTheme } = useTheme();

  useEffect(() => {
    axios
      .get("/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUserType(response.data.user_type);
        setFullname(response.data.full_name);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 401) {
          window.location.href = "/";
        }
        
      
      });
  }, []);

  const links = [
    {
      label: "Dashboard",
      href: `/${usertype}/dashboard`,
      icon: (
        <IconBrandTabler className="flex-shrink-0 w-5 h-5 text-secondary" />
      ),
    },
    // usertype === "provider" && {
    //   label: "Courses",
    //   href: `/${usertype}/courses`,
    //   icon: <IconAward className="flex-shrink-0 w-5 h-5 text-secondary" />,
    // },
    (usertype === "provider" ||
      usertype === "admin" ) && {
      label: "Statistics",
      href: "/admin/statistics",
      icon: <IconGraph className="flex-shrink-0 w-5 h-5 text-secondary" />,
    },
    // usertype === "admin" && {
    //   label: "Occupations",
    //   href: "/admin/occupations",
    //   icon: <IconBriefcase className="flex-shrink-0 w-5 h-5 text-secondary" />,
    // },
    {
      label: "Logout",
      href: "/logout",
      icon: <IconLogout2 className="flex-shrink-0 w-5 h-5 text-secondary" />,
    },
    {
      label: "Theme Switch",
      href: "#",
      icon: (
        <IconBulb
          className="flex-shrink-0 w-5 h-5 text-secondary"
          onClick={toggleTheme}
        />
      ),
    },
  ].filter(Boolean) as any[];
  const profileUrl = `/profile`;
  return (
    <SidebarComponent open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <div className="flex flex-col gap-2 mt-8">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: fullname,
              href: profileUrl,
              icon: (
                <div className="flex items-center justify-center flex-shrink-0 border-2 border-gray-300 rounded-full w-7 h-7 dark:border-gray-700">
                <p className="text-sm text-secondary">
                  {fullname.charAt(0).toUpperCase()}
                  </p>
              </div>
              ),
            }}
          />
        </div>
      </SidebarBody>
    </SidebarComponent>
  );
}

export const Logo = () => {
  return (
    <Link
      to="#" // Use 'to' instead of 'href' with react-router-dom's Link
      className="relative z-20 flex items-center py-1 space-x-2 text-sm font-normal text-secondary"
    >
      <div className="flex-shrink-0 w-6 h-5 rounded-tl-lg rounded-tr-sm rounded-bl-sm rounded-br-lg bg-secondary" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-secondary"
      >
        Ezi Resi
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="#" // Use 'to' instead of 'href' with react-router-dom's Link
      className="relative z-20 flex items-center py-1 space-x-2 text-sm font-normal text-secondary"
    >
      <div className="flex-shrink-0 w-6 h-5 rounded-tl-lg rounded-tr-sm rounded-bl-sm rounded-br-lg bg-secondary" />
    </Link>
  );
};
