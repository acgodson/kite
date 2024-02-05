


export interface Asset {
  token: {
    address: string,
    circulating_market_cap: null | string,
    decimals: string,
    exchange_rate: null,
    holders: string,
    icon_url: null | string,
    name: string,
    symbol: string,
    total_supply: string,
    type: string
  },
  token_id: null | string,
  token_instance: null | string,
  value: string
}





export interface Transaction {
  timestamp: string;
  fee: {
    type: string;
    value: string;
  };
  gas_limit: string;
  block: number;
  status: string;
  method: string | null;
  confirmations: number;
  type: number;
  exchange_rate: string | null;
  to: {
    ens_domain_name: string | null;
    hash: string;
    implementation_name: string | null;
    is_contract: boolean;
    is_verified: boolean;
    name: string | null;
    private_tags: string[];
    public_tags: string[];
    watchlist_names: string[];
  };
  tx_burnt_fee: string | null;
  max_fee_per_gas: string | null;
  result: string;
  hash: string;
  gas_price: string;
  priority_fee: string | null;
  base_fee_per_gas: string | null;
  from: {
    ens_domain_name: string | null;
    hash: string;
    implementation_name: string | null;
    is_contract: boolean;
    is_verified: boolean;
    name: string | null;
    private_tags: string[];
    public_tags: string[];
    watchlist_names: string[];
  };
  token_transfers: any[] | null;
  tx_types: string[];
  gas_used: string;
  created_contract: {
    ens_domain_name: string | null;
    hash: string;
    implementation_name: string | null;
    is_contract: boolean;
    is_verified: boolean;
    name: string | null;
    private_tags: string[];
    public_tags: string[];
    watchlist_names: string[];
  };
  position: number;
  nonce: number;
  has_error_in_internal_txs: boolean;
  actions: any[];
  decoded_input: string | null;
  token_transfers_overflow: any[] | null;
  raw_input: string;
  value: string;
  max_priority_fee_per_gas: string | null;
  revert_reason: string | null;
  confirmation_duration: [number, number];
  tx_tag: string | null;
}

