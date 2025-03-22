import { SidebarProvider } from "@/components/SidebarProvider";
import Navbar from "./_components/Navbar";

export default async function DASHBOARDLAYOUT({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <Navbar>
      {children}
    </Navbar>
  );
}


