import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

function AdminChooser() {
    const navigate = useNavigate();
    const location = useLocation();
    const { meetingData } = location.state || {};
    const user = localStorage.getItem('userId');
    useEffect(() => {
        if (JSON.parse(user).id == meetingData.host_id) {
        navigate('/meetingadmin', { state: { meetingData } });
        }
        else {
            navigate('/meeting', { state: { meetingData } });
        }
    }, [])

    return(<></>);
}

export default AdminChooser