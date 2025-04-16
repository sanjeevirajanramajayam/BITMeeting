import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, Typography, IconButton, InputBase, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Paper, Button, CircularProgress } from "@mui/material";
import { Close, Search, KeyboardArrowDown, Check } from "@mui/icons-material";


export default function VenueTable({ onVenueSelect, onClose }) {
    const [vselect, setVselect] = useState(null);
    const [vsearch, setVsearch] = useState("");
    const [prioritySort, setPrioritySort] = useState(null);
    const [statusSort, setStatusSort] = useState(null);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/templates/venues");
                setVenues(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching venues:", error);
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    const handleSel = (id) => {
        setVselect((prev) => (prev === id ? null : id));
    };
    
    const selectedCapacity = vselect ? venues.find((venue) => venue.id === vselect)?.capacity : "0";

    const filterVenues = venues.filter(venue =>
        venue.name?.toLowerCase().includes(vsearch.toLowerCase())
    );

    const handleAddVenue = () => {
        if (vselect) {
            const selectedVenue = venues.find(venue => venue.id === vselect);
            if (selectedVenue) {
                onVenueSelect(selectedVenue);
            }
        }
    };

    const handleStatusSort = () => {
        setPrioritySort(null);
        setStatusSort(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
    };

    const handlePrioritySort = () => {
        setStatusSort(null);
        setPrioritySort(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
    };

    const priorityRank = {
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1,
        "NIL": 0
    };

    let sortedVenues = [...filterVenues];
    
    if (statusSort) {
        sortedVenues.sort((a, b) => {
            if (statusSort === "asc") {
                return a.status === b.status ? 0 : a.status === "available" ? -1 : 1;
            } else {
                return a.status === b.status ? 0 : a.status === "available" ? 1 : -1;
            }
        });
    }

    if (prioritySort) {
        sortedVenues.sort((a, b) => {
            const rankA = priorityRank[a.priority] || 0;
            const rankB = priorityRank[b.priority] || 0;
            
            return prioritySort === "asc" ? rankB - rankA : rankA - rankB;
        });
    }

    return (
        <Card sx={{ width: 700, borderRadius: 2, p: 2, bgcolor: "white" }}>

            {/* top */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px" }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '50px' }}>
                    <Typography sx={{ color: "#3D3939", fontWeight: "bold" }}>Check Venue availability</Typography>
                    <Typography sx={{ color: "#1A79E6", fontWeight: "bold" }}>Total Members: {selectedCapacity}</Typography>
                </div>
                <IconButton
                    sx={{ border: "2px solid #FB3748", borderRadius: "50%", padding: "4px", "&:hover": { backgroundColor: "transparent" } }}
                    onClick={onClose}
                >
                    <Close sx={{ fontSize: "12px", color: "#FB3748" }} />
                </IconButton>
            </Box>

            <hr />

            {/* search */}
            <Box sx={{ display: "flex", gap: "10px", my: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", p: "2px 4px", border: "1px solid #ccc", borderRadius: "6px" }}>
                    <Search sx={{ ml: 1 }} />
                    <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search Venue ..." value={vsearch} onChange={(e) => setVsearch(e.target.value)} />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>Venue name</TableCell>
                                <TableCell onClick={handleStatusSort} sx={{ cursor: "pointer" }}>
                                    Status
                                    <KeyboardArrowDown 
                                    fontSize="small" 
                                    sx={{ 
                                        verticalAlign: "middle", 
                                        ml: 0.5, 
                                        transform: statusSort === "asc" ? "rotate(180deg)" : "rotate(0deg)" 
                                    }} 
                                    />
                                </TableCell>
                                <TableCell>Capacity</TableCell>
                                {/* <TableCell onClick={handlePrioritySort} sx={{ cursor: "pointer" }}>
                                    Priority
                                    <KeyboardArrowDown 
                                    fontSize="small" 
                                    sx={{ 
                                        verticalAlign: "middle", 
                                        ml: 0.5,
                                        transform: prioritySort === "asc" ? "rotate(180deg)" : "rotate(0deg)" 
                                    }} 
                                    />
                                </TableCell> */}
                                {/* <TableCell>Action</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedVenues.map((venue) => (
                                <TableRow key={venue.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={vselect === venue.id}
                                            onChange={() => handleSel(venue.id)}
                                            disabled={venue.status != "available"}
                                            icon={<span style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #D3D3D3", backgroundColor: venue.status != "available" ? "#DADADA" : "transparent", cursor: venue.status != "available" ? "not-allowed" : "pointer" }} />}
                                            checkedIcon={
                                                <span style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#1976D2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Check style={{ color: "white", fontSize: 18, alignItems: 'center' }} />
                                                </span>
                                            }
                                        />
                                    </TableCell>
                                    <TableCell sx={{ paddingRight: "70px" }}>{venue.name}</TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: venue.status=="available" ? "#e8f5e9" : "#ffebee", color: venue.status=="available" ? "#2e7d32" : "#d32f2f", padding: "4px 8px", borderRadius: "16px", fontSize: "12px", fontWeight: 500, width: "fit-content" }}>
                                            <Box sx={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: venue.status=="available" ? "#2e7d32" : "#d32f2f" }} />
                                            {venue.status}
                                        </Box>
                                    </TableCell>

                                    <TableCell sx={{ color: '#175CD3' }}>{venue.capacity}</TableCell>


                                    {/* <TableCell>
                                        <Typography
                                            sx={{ color: "#175CD3", backgroundColor: "#e3f2fd", padding: "4px 8px", borderRadius: "16px", fontSize: "10px", fontWeight: 500, display: "inline-block" }}>
                                            {venue.priority}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {venue.status === "In available" ? (
                                            <Typography sx={{ color: "#1A79E6", cursor: "pointer", textDecoration: "underline" }}>
                                                View
                                            </Typography>
                                        ) : (
                                            <Typography sx={{ color: "#1A79E6", cursor: "pointer", textDecoration: "underline" }}>
                                                {venue.action}
                                            </Typography>
                                        )}
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Button
                fullWidth
                sx={{ mt: 2, bgcolor: "#007bff", color: "white", textTransform: "capitalize" }}
                onClick={handleAddVenue}
                disabled={!vselect || loading}
            >
                Add Venue
            </Button>
            
        </Card>
    );
}