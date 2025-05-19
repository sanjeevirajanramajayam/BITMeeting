                                            <TableCell sx={mergedCellStyle}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    {(points[index].status == 'Approve' || points[index].status == null) &&
                                                        <Button
                                                            variant={point.status === "Approve" ? "contained" : "outlined"}
                                                            sx={{
                                                                color: point.status === "Approve" ? "white" : "green",
                                                                borderColor: "green",
                                                                backgroundColor: point.status === "Approve" ? "green" : "#e6f8e6",
                                                                textTransform: "none",
                                                                borderRadius: "14px",
                                                                padding: "6px 40px",
                                                                fontSize: '10px',
                                                                gap: 0.5,
                                                                "&:hover": {
                                                                    backgroundColor: point.status === "Approve" ? "darkgreen" : "#d4edda"
                                                                },
                                                                ...(isRowDisabled && {
                                                                    opacity: 0.6,
                                                                    pointerEvents: 'none',
                                                                    backgroundColor: point.status === "Approve" ? "green" : "#e6f8e6",
                                                                })
                                                            }}
                                                            onClick={() => {
                                                                approvePoint(point.point_id, "APPROVED", point, index);
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>}
                                                    {(points[index].status == 'Not Approve' || points[index].status == null) && <Button
                                                        variant={point.status === "Not Approve" ? "contained" : "outlined"}
                                                        disabled={isRowDisabled}
                                                        sx={{
                                                            color: point.status === "Not Approve" ? "white" : "red",
                                                            borderColor: "red",
                                                            backgroundColor: point.status === "Not Approve" ? "red" : "#fdecec",
                                                            textTransform: "none",
                                                            borderRadius: "14px",
                                                            padding: "6px 30px",
                                                            fontSize: '10px',
                                                            gap: 0.5,
                                                            "&:hover": {
                                                                backgroundColor: point.status === "Not Approve" ? "darkred" : "#f8d7da"
                                                            },
                                                            ...(isRowDisabled && {
                                                                opacity: 0.6,
                                                                pointerEvents: 'none',
                                                                backgroundColor: point.status === "Not Approve" ? "red" : "#fdecec",
                                                            })
                                                        }}
                                                        onClick={() => {
                                                            approvePoint(point.point_id, "NOT APPROVED", point, index);
                                                        }}
                                                    >
                                                        Not Approve
                                                    </Button>}
                                                </Box>
                                            </TableCell>