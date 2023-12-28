import React, { useState, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, Typography, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

function GlueTablesList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState({});

    useEffect(() => {
        async function fetchGlueTables() {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:3000/glue-tables');
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setData(data);
                let initState = {};
                data.forEach(db => initState[db.database] = false);
                setOpen(initState);
            } catch (err) {
                setError('Failed to fetch Glue tables');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchGlueTables();
    }, []);

    const handleClick = (dbName) => {
        setOpen({ ...open, [dbName]: !open[dbName] });
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                AWS Glue Databases and Tables:
            </Typography>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            <List>
                {data.map(({ database, tables }) => (
                    <React.Fragment key={database}>
                        <ListItem button onClick={() => handleClick(database)}>
                            <ListItemText primary={database} />
                            {open[database] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open[database]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {tables.map((table, index) => (
                                    <ListItem key={index} style={{ paddingLeft: 30 }}>
                                        <ListItemText primary={table.Name} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>
        </Container>
    );
}

export default GlueTablesList;