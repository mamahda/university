import { React, useContext, useEffect } from "react";
import MainLayout from "../layout/MainLayoutAdmin";
import Dashboard from "../components/OrderDetailsAdmin";
import { UserContext } from "../components/UserContext";
import { useNavigate } from "react-router-dom";

export default function OrderPageAdmin() {
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();
  
    useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = JSON.parse(storedUser)
    if (user.role != "admin") {
      navigate("/")
    }
    if (storedUser) {
      console.log("tes")
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <MainLayout>
      <Dashboard/>
    </MainLayout>
  );
}
