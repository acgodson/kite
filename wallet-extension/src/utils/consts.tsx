export const PegasusRPC = 'https://replicator.pegasus.lightlink.io/rpc/v1';
export const PhoenixRPC = 'https://replicator.phoenix.lightlink.io/rpc/v1';
export const KiteContract = '0xD6b804951f7FBeA42587b6b66c4302f186554837';
export const SafeLockContract = '0x61E92d4cC038c7B50C65325417dfA4952E848D81';
export const Target = '0x61E92d4cC038c7B50C65325417dfA4952E848D81';
export const Vault = '0x61E92d4cC038c7B50C65325417dfA4952E848D81';
export const Flexi = '0x61E92d4cC038c7B50C65325417dfA4952E848D81';
export const strategies = [
    {
        name: "Safe Lock",
        address: SafeLockContract,
    },
    {
        name: "Target Savings",
        address: Target,
    },
    {
        name: "Flexi Savings",
        address: Vault,
    },
    {
        name: "Yield vault",
        address: Flexi,
    },

]
