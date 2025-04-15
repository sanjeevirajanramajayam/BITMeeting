// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        navigate("/login");
    }, [navigate]);

    return null; 
};

export default Logout;
