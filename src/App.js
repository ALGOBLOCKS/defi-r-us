import './App.css';
import {useEffect, useMemo, useState} from "react";
import {fetchProtocols} from './services/defiLammaClient'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {CardActionArea, Container} from '@mui/material';
import Grid from '@mui/material/Grid';
import ReactGA from "react-ga4";
import Autocomplete from '@mui/material/Autocomplete';
import {TextField} from "@mui/material";
import {debounce} from "lodash";
import {event as gaEvent} from './gtag';

function App() {

    const [selectedTab, setSelectedTab] = useState(0);
    const [protocolIndex, setProtocolIndex] = useState({});
    const [protocolByCat, setProtocolByCat] = useState({});
    const [universe, setUniverse] = useState([]);
    const [filteredProtocols, setFilteredProtocols] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const handleOnSearchChangev2 = (event) => {
        const value = event.target.value ? event.target.value.toLowerCase() : event.target.value;
        if (searchValue !== value) {
            if (!value) {
                setFilteredProtocols([...protocolByCat[getSelectedTabName()]])
            } else if (!!protocolByCat[value]) {
                gaEvent({
                    category: 'Search',
                    action: 'Search For Exact Category',
                    label: value
                });

                setSelectedTab(Object.keys(protocolByCat).indexOf(value));
                setFilteredProtocols([...protocolByCat[value]]);
            } else if (!!protocolIndex[value]) {
                gaEvent({
                    category: 'Search',
                    action: 'Search For Exact Category',
                    label: value
                });
                setSelectedTab(Object.keys(protocolByCat).indexOf(protocolIndex[value].category.toLowerCase()));
                setFilteredProtocols([value])
            } else {
                setFilteredProtocols([...universe.filter(name => name.toLowerCase().includes(value.toLowerCase()))])
            }
            setSearchValue(value);
        }

    }
    const debouncedOnSearchChange = useMemo(() => debounce(handleOnSearchChangev2, 400), [filteredProtocols, selectedTab, searchValue]);

    useEffect(() => {
        fetchProtocols().then(({
                                   protocolsIndex,
                                   protocolByCat,
                                   universe
                               }) => {
            setUniverse(universe);
            setProtocolIndex(protocolsIndex);
            setProtocolByCat(protocolByCat);
            setFilteredProtocols(protocolByCat['dexes'])
            return () => {
                debouncedOnSearchChange.cancel();
            }
        });
    }, []);

    const getSelectedTabName = () => Object.keys(protocolByCat)[selectedTab];

    function ProtocolCards({pList = []}) {
        return pList.map((p, index) => {
            let protocol = protocolIndex[p];
            return protocol && (<Grid item key={index} onClick={() => {
                gaEvent({
                    category: 'DeFi Product',
                    action: 'Defi Product Clicked',
                    label: protocol.name,
                    transport: 'beacon'
                });
            }}>
                <Card sx={{width: '200px', height: '300px'}}>
                    <CardActionArea m='24' href={protocol.url}>
                        <CardMedia
                            component="img"
                            height="140"
                            image={protocol.logo || "/logos/" + protocol.name}
                            alt={protocol.name}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {protocol.name}
                            </Typography>
                            <Typography variant={"h6"}>{protocol.category}</Typography>
                            <Typography>

                                {"TVL " + new Intl.NumberFormat('en-US', {
                                    maximumFractionDigits: 1,
                                    notation: "compact",
                                    compactDisplay: "short",
                                    currency: "USD",
                                    style: 'currency',
                                }).format(protocol.tvl)}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card></Grid>);
        });
    }

    const handleTabChange = (event, value) => {
        gaEvent({
            category: 'DeFi Category Tabs',
            action: 'DeFi Tab Changed',
            label: getSelectedTabName(),
        });
        setSelectedTab(value);
        setFilteredProtocols(protocolByCat[Object.keys(protocolByCat)[value]]);
    }

    function ProtocolCategories({categories = []}) {
        return (
            <Tabs value={selectedTab} aria-label="Basic Tabs" variant="scrollable" scrollButtons="auto"
                  onChange={handleTabChange}>
                {!!categories && categories.map((category, index) => (
                    <Tab key={index} value={index} label={category}/>))}
            </Tabs>
        )
    }

    return (
        <div className="App">
            <Container margin={'24px'}>
                <Box mb={'24px'} mt={'48px'} alignItems={"center"}>
                    <Autocomplete onSelect={debouncedOnSearchChange} renderInput={(params) => (
                        <TextField
                            onChange={debouncedOnSearchChange}
                            {...params}
                            label="Search DeFi Products"
                            sx={{maxWidth: '375px'}}
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                            }}
                        />
                    )}
                                  options={universe}
                                  disableClearable/>
                </Box>
                <Box margin={'24px'}>
                    <ProtocolCategories categories={Object.keys(protocolByCat)}/>
                </Box>
                <div>
                    <Grid container spacing={3} justifyContent="center" alignItems="center">
                        <ProtocolCards pList={filteredProtocols}/>
                    </Grid>
                </div>
            </Container>
        </div>
    );
}

export default App;
