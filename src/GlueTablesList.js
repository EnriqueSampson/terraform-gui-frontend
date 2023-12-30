import React, { useState, useEffect } from 'react';
import {
    Container,
    List,
    ListItem,
    ListItemText,
    Typography,
    Collapse,
    TextField,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const schemaTypes = ['String', 'Integer', 'Boolean', 'Double', 'Binary', 'Date', 'Timestamp', 'Array', 'Map', 'Struct']; // This should be outside the component


function GlueTablesList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState({});
    const [openTable, setOpenTable] = useState({}); // Added state for tracking open tables

    const handleTableClick = (tableName) => { // Implement the handleTableClick function
        setOpenTable(prevOpenTable => ({
            ...prevOpenTable,
            [tableName]: !prevOpenTable[tableName],
        }));
    };

    // Function to update the schema details in state
    const handleSchemaChange = (databaseName, tableName, columnIndex, key, value) => {
        setData(prevData => {
            return prevData.map(db => {
                if (db.database === databaseName) {
                    return {
                        ...db,
                        tables: db.tables.map(table => {
                            if (table.name === tableName) {
                                return {
                                    ...table,
                                    schema: table.schema.map((col, index) => {
                                        if (index === columnIndex) {
                                            return { ...col, [key]: value };
                                        }
                                        return col;
                                    })
                                };
                            }
                            return table;
                        })
                    };
                }
                return db;
            });
        });
    };

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

    const fetchTablesForDatabase = async (databaseName) => {
        try {
            const response = await fetch(`http://localhost:3000/glue-tables/${databaseName}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return await response.json();
        } catch (err) {
            console.error('Error fetching tables:', err);
            throw err;
        }
    };


    const handleClick = async (dbName) => {
        if (!open[dbName]) {
            setLoading(true);
            try {
                const tables = await fetchTablesForDatabase(dbName);
                setData(prevData => prevData.map(db => {
                    if (db.database === dbName) {
                        return { ...db, tables };
                    }
                    return db;
                }));
            } catch (err) {
                console.error('Error fetching tables for database:', err);
                setError(`Failed to fetch tables for ${dbName}`);
            } finally {
                setLoading(false);
            }
        }
        setOpen(prevOpen => ({ ...prevOpen, [dbName]: !prevOpen[dbName] }));
    };

    return (
        <Container className="mx-auto p-4">
            <Typography variant="h5" gutterBottom className="text-left font-bold">
                AWS Glue Databases, Tables, and Schemas:
            </Typography>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            <List>
                {data.map(({ database, tables }) => (
                    <React.Fragment key={database}>
                        <ListItem button onClick={() => handleClick(database)} className="text-left">
                            <ListItemText primary={database} />
                            {open[database] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItem>
                        <Collapse in={open[database]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {tables.map((table, tableIndex) => (
                                    <React.Fragment key={table.name}>
                                        <ListItem button onClick={() => handleTableClick(table.name)} className="text-left">
                                            <ListItemText primary={table.name} />
                                            {openTable[table.name] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </ListItem>
                                        <Collapse in={openTable[table.name]} timeout="auto" unmountOnExit>
                                            {table.schema.map((column, colIndex) => (
                                                <div key={colIndex} className="flex flex-col p-2 border-b border-gray-200">
                                                    <FormControl fullWidth className="mb-4"> {/* Add mb-4 for margin-bottom */}
                                                        <TextField
                                                            label="Column Name"
                                                            variant="outlined"
                                                            size="small"
                                                            value={column.Name}
                                                            onChange={(e) => handleSchemaChange(database, table.name, colIndex, 'Name', e.target.value)}
                                                        />
                                                    </FormControl>
                                                    <FormControl fullWidth>
                                                        <InputLabel id={`column-type-label-${colIndex}`}>Column Type</InputLabel>
                                                        <Select
                                                            labelId={`column-type-label-${colIndex}`}
                                                            id={`column-type-select-${colIndex}`}
                                                            value={column.Type}
                                                            label="Column Type"
                                                            onChange={(e) => handleSchemaChange(database, table.name, colIndex, 'Type', e.target.value)}
                                                        >
                                                            {schemaTypes.map((type, typeIndex) => (
                                                                <MenuItem key={typeIndex} value={type}>{type}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                            ))}
                                        </Collapse>
                                    </React.Fragment>
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