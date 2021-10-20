import axios from "axios";

const fetchProtocols = async () => {
    const protocols = await axios.get('https://api.llama.fi/protocols');
    const others = [];
    const protocolsIndex = {};
    const protocolByCat = {};
    const parseCategory = (category) => !category ? 'Others' : category
    const universe = [];

    protocols.data.forEach((protocol) => {
        let category = parseCategory(protocol.category).toLowerCase();
        let protocolName = protocol.name.toLowerCase();
        protocolsIndex[protocolName] = {
            name: protocol.name,
            logo: protocol.logo,
            url: protocol.url,
            tvl: protocol.tvl,
            category:protocol.category
        };
        if (!protocolByCat[category]) {
            protocolByCat[category] = [protocolName];
        } else {
            protocolByCat[category].push(protocolName);
        }
        universe.push(protocolName);
    });
    universe.push(...Object.keys(protocolByCat).map(c => c.toLowerCase()));
    return ({
        protocolsIndex,
        protocolByCat,
        universe
    });
}
export {
    fetchProtocols
}